import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/mockStorage'

const USE_MOCK = !isSupabaseConfigured()

/** Şifre gücü kontrolü */
function checkStrength(pw) {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Çok Zayıf', color: '#ef4444', width: '20%' }
  if (score === 2) return { label: 'Zayıf',    color: '#f97316', width: '40%' }
  if (score === 3) return { label: 'Orta',      color: '#eab308', width: '60%' }
  if (score === 4) return { label: 'Güçlü',     color: '#22c55e', width: '80%' }
  return               { label: 'Çok Güçlü',   color: '#10b981', width: '100%' }
}

export default function AccountSettings() {
  const { user } = useAuth()

  // E-posta değiştirme state
  const [newEmail,      setNewEmail]      = useState('')
  const [emailLoading,  setEmailLoading]  = useState(false)
  const [emailSuccess,  setEmailSuccess]  = useState('')
  const [emailError,    setEmailError]    = useState('')

  // Şifre değiştirme state
  const [newPass,       setNewPass]       = useState('')
  const [confirmPass,   setConfirmPass]   = useState('')
  const [passLoading,   setPassLoading]   = useState(false)
  const [passSuccess,   setPassSuccess]   = useState('')
  const [passError,     setPassError]     = useState('')
  const [showPasses,    setShowPasses]    = useState({ new: false, confirm: false })

  const strength = newPass ? checkStrength(newPass) : null

  // ── E-posta Değiştir ───────────────────────────────────────────────────────
  const handleEmailChange = async (e) => {
    e.preventDefault()
    setEmailError(''); setEmailSuccess('')
    if (!newEmail || newEmail === user?.email) {
      setEmailError('Lütfen farklı bir e-posta adresi girin.')
      return
    }
    setEmailLoading(true)

    if (USE_MOCK) {
      setEmailError('Mock modda e-posta değiştirme desteklenmiyor. Supabase bağlantısı gereklidir.')
      setEmailLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailLoading(false)

    if (error) {
      setEmailError(error.message || 'E-posta değiştirilemedi.')
    } else {
      setEmailSuccess(
        `Onay e-postası ${newEmail} adresine gönderildi. Gelen kutunuzu kontrol edin ve linke tıklayın — değişiklik onaylandıktan sonra aktif olur.`
      )
      setNewEmail('')
    }
  }

  // ── Şifre Değiştir ────────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassError(''); setPassSuccess('')

    if (newPass.length < 8) {
      setPassError('Yeni şifre en az 8 karakter olmalıdır.')
      return
    }
    if (newPass !== confirmPass) {
      setPassError('Yeni şifreler eşleşmiyor.')
      return
    }

    setPassLoading(true)

    if (USE_MOCK) {
      setPassError('Mock modda şifre değiştirme desteklenmiyor. Supabase bağlantısı gereklidir.')
      setPassLoading(false)
      return
    }

    // Mevcut şifre kontrolünü kaldırdık (kullanıcı isteği)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass })
    setPassLoading(false)

    if (updateError) {
      setPassError(updateError.message || 'Şifre güncellenemedi.')
    } else {
      setPassSuccess('Şifreniz başarıyla güncellendi.')
      setNewPass(''); setConfirmPass('')
    }
  }

  const toggleShow = (field) => setShowPasses(p => ({ ...p, [field]: !p[field] }))

  return (
    <AdminLayout>
      <div style={{ maxWidth: '640px' }}>
        <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="admin-page-title">⚙️ Hesap Ayarları</h1>
            <p className="admin-page-subtitle">
              E-posta adresinizi ve şifrenizi buradan güncelleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Mevcut Hesap Bilgisi */}
        <div className="data-table-wrapper" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Mevcut Hesap</p>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.email}</p>
          {USE_MOCK && (
            <div className="alert" style={{ marginTop: '1rem', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)', color: '#b8941a', fontSize: '0.8125rem' }}>
              ⚠️ Şu an mock (geliştirme) modundasınız. Şifre değişikliği için Supabase bağlantısı gereklidir.
            </div>
          )}
        </div>

        {/* ── E-posta Değiştir ────────────────────────────────────── */}
        <div className="data-table-wrapper" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            📧 E-posta Adresini Değiştir
          </h2>

          {emailSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ {emailSuccess}
            </div>
          )}
          {emailError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              ⚠️ {emailError}
            </div>
          )}

          <form onSubmit={handleEmailChange}>
            <div className="form-group">
              <label className="form-label">Yeni E-posta Adresi</label>
              <input
                className="form-input"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="yeni@email.com"
                required
                autoComplete="email"
                disabled={emailLoading}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Değişikliği onaylamak için yeni adrese bir doğrulama e-postası gönderilir.
              </p>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={emailLoading || !newEmail}
            >
              {emailLoading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Gönderiliyor...</> : '📧 Onay E-postası Gönder'}
            </button>
          </form>
        </div>

        {/* ── Şifre Değiştir ──────────────────────────────────────── */}
        <div className="data-table-wrapper">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            🔐 Şifre Değiştir
          </h2>

          {passSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ {passSuccess}
            </div>
          )}
          {passError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              ⚠️ {passError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} autoComplete="off">            {/* Yeni Şifre */}
            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPasses.new ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="En az 8 karakter"
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => toggleShow('new')}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  tabIndex={-1} aria-label="Şifreyi göster/gizle">
                  {showPasses.new ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Şifre Gücü Göstergesi */}
              {newPass && strength && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s ease', borderRadius: '2px' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.3rem', fontWeight: 500 }}>
                    {strength.label}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    İpucu: Büyük harf, rakam ve özel karakter (@!#) içeren 12+ karakter şifre kullanın.
                  </p>
                </div>
              )}
            </div>

            {/* Şifre Tekrar */}
            <div className="form-group">
              <label className="form-label">Yeni Şifre (Tekrar)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPasses.confirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  style={{
                    paddingRight: '3rem',
                    borderColor: confirmPass && (confirmPass === newPass ? 'var(--success, #22c55e)' : '#ef4444'),
                  }}
                />
                <button type="button" onClick={() => toggleShow('confirm')}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  tabIndex={-1} aria-label="Şifreyi göster/gizle">
                  {showPasses.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPass && confirmPass !== newPass && (
                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.3rem' }}>Şifreler eşleşmiyor</p>
              )}
              {confirmPass && confirmPass === newPass && (
                <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.3rem' }}>✓ Şifreler eşleşiyor</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passLoading || !newPass || !confirmPass}
            >
              {passLoading
                ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Güncelleniyor...</>
                : '🔐 Şifreyi Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
