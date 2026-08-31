import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ADMIN } from '../../lib/adminConfig'
import {
  getLockoutStatus,
  recordFailedAttempt,
  resetAttempts,
  getDelay,
} from '../../lib/rateLimiter'

/** Kalan süreyi MM:SS formatına çevirir */
function formatRemaining(ms) {
  const totalSecs = Math.ceil(ms / 1000)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AdminLogin() {
  const { user, signIn } = useAuth()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Rate limiting durumu
  const [lockout,    setLockout]    = useState(getLockoutStatus())
  const [countdown,  setCountdown]  = useState('')
  const [attempts,   setAttempts]   = useState(getLockoutStatus().attempts)

  // Geri sayım sayacı
  useEffect(() => {
    if (!lockout.locked) { setCountdown(''); return }

    const tick = () => {
      const status = getLockoutStatus()
      if (!status.locked) {
        setLockout(status)
        setAttempts(0)
        setError('')
        setCountdown('')
      } else {
        setCountdown(formatRemaining(status.remainingMs))
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockout.locked])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')

    // Kilitli mi kontrol et
    const status = getLockoutStatus()
    if (status.locked) {
      setLockout(status)
      return
    }

    setLoading(true)

    // Progressive delay — timing saldırılarını zorlaştırır
    const delay = getDelay(status.attempts)
    if (delay > 0) await new Promise(r => setTimeout(r, delay))

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      const newStatus = recordFailedAttempt()
      setAttempts(newStatus.attempts)
      setLockout(newStatus)

      if (newStatus.locked) {
        setError(`Çok fazla başarısız deneme. Hesap ${formatRemaining(newStatus.remainingMs)} süreyle kilitlendi.`)
      } else {
        const remaining = 5 - newStatus.attempts
        setError(`E-posta veya şifre hatalı.${remaining > 0 ? ` Kalan deneme hakkı: ${remaining}` : ''}`)
      }
      setLoading(false)
    } else {
      resetAttempts()
      // Başarılı giriş — useAuth user state'i set edecek, Navigate devreye girecek
    }
  }, [email, password, signIn])

  if (user) return <Navigate to={ADMIN?.panel || '/'} replace />


  return (
    <div className="admin-login-page">
      <div className="admin-login-box animate-fadeInUp">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <div className="shield-icon">
              <svg width="64" height="64" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L4 9v14c0 10 7.5 19.3 18 22 10.5-2.7 18-12 18-22V9L22 2z" fill="#0d3d14" stroke="#22a135" strokeWidth="1.5"/>
                <path d="M22 7L8 13v10c0 7.5 5.5 14.3 14 16.5C30.5 37.3 36 30.5 36 23V13L22 7z" fill="#1a5c25"/>
                <path d="M22 12l1.8 5.5H29l-4.6 3.3 1.8 5.5L22 23l-4.2 3.3 1.8-5.5L15 17.5h5.2L22 12z" fill="#f5c518"/>
              </svg>
            </div>
            <h1 className="heading-sm">Yönetim Girişi</h1>
            <p>Ergani Yıldız Spor</p>
          </div>

          {/* Lockout uyarısı */}
          {lockout.locked && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div>🔒 Hesap geçici olarak kilitlendi</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
                {countdown}
              </div>
              <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem', opacity: 0.85 }}>
                kalan süre
              </div>
            </div>
          )}

          {/* Hata mesajı (kilitli değilse) */}
          {error && !lockout.locked && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Deneme uyarısı */}
          {!lockout.locked && attempts > 0 && attempts < 5 && !error && (
            <div className="alert" style={{ marginBottom: '1.5rem', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)', color: '#b8941a' }}>
              ⚠️ {5 - attempts} deneme hakkınız kaldı
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="••••••@••••••••"
                required
                autoComplete="username"
                disabled={lockout.locked || loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={lockout.locked || loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.125rem',
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center' }}
              disabled={loading || lockout.locked}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Doğrulanıyor...
                </>
              ) : lockout.locked ? (
                `🔒 Kilitli (${countdown})`
              ) : (
                '🔐 Giriş Yap'
              )}
            </button>
          </form>

          <div className="security-notice" style={{ marginTop: '1.5rem' }}>
            <span>🔒</span>
            <span>Bu panel Supabase Auth ile güvence altındadır</span>
          </div>
        </div>
      </div>
    </div>
  )
}
