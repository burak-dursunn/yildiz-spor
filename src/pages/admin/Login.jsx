import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLogin() {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/admin/panel" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

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
            <h1 className="heading-sm">Admin Girişi</h1>
            <p>Ergani Yıldız Spor Yönetim Paneli</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@erganiyildizspor.com"
                required
                autoComplete="email"
                autoFocus
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
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Giriş Yapılıyor...
                </>
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
