import { useState } from 'react'
import SEO from '../components/SEO'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // mailto: linkini oluştur
    const mailtoLink = `mailto:mehmet_yesil7@hotmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(
      `Gönderen: ${form.name}\nE-posta: ${form.email}\n\nMesaj:\n${form.message}`
    )}`
    
    // E-posta istemcisini aç
    window.location.href = mailtoLink

    setStatus('success')
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setStatus(null), 5000)
  }

  const contactInfo = [
    { icon: '📍', label: 'Adres', value: 'Ergani, Diyarbakır', sub: 'Türkiye' },
    { icon: '📞', label: 'Telefon', value: '+90 533 810 46 61', sub: 'Hafta içi 09:00 - 18:00' },
    { icon: '✉️', label: 'E-posta', value: 'mehmet_yesil7@hotmail.com', sub: 'Yanıt süresi 24-48 saat' },
  ]

  return (
    <div className="page-content">
      <SEO
        title="İletişim"
        description="Ergani Yıldız Spor Futbol Kulübü ile iletişime geçin. Adres: Ergani, Diyarbakır. Telefon: +90 533 810 46 61. Altyapı kayıt, antrenman bilgisi ve iş birliği teklifleriniz için."
      />
      {/* Page Hero */}
      <section className="page-hero page-hero-sm">
        <div className="container">
          <div className="page-hero-content animate-fadeInUp">
            <div className="page-hero-badge">İletişim</div>
            <h1 className="heading-xl">
              Bize <span className="text-gradient">Ulaşın</span>
            </h1>
            <p className="page-hero-desc">
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için.
            </p>
          </div>
        </div>
        <div className="page-hero-shape" />
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info stagger-children">
              <h2 className="heading-md mb-6">
                İletişim <span className="text-gradient">Bilgileri</span>
              </h2>

              {contactInfo.map(({ icon, label, value, sub }) => (
                <div key={label} className="contact-item">
                  <div className="contact-icon">{icon}</div>
                  <div>
                    <p className="contact-label">{label}</p>
                    <p className="contact-value">{value}</p>
                    <p className="contact-sub">{sub}</p>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '2rem' }}>
                <p className="contact-label" style={{ marginBottom: '0.75rem' }}>Sosyal Medya</p>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-link" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-link" aria-label="Twitter/X">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="card card-body">
                <h3 className="heading-sm mb-6">Mesaj Gönder</h3>

                {status === 'success' && (
                  <div className="alert alert-success mb-6">
                    ✅ Mesajınız alındı! En kısa sürede geri döneceğiz.
                  </div>
                )}

                <form className="form-stack" onSubmit={handleSubmit}>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Adınız</label>
                      <input
                        className="form-input"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Adınız Soyadınız"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-posta</label>
                      <input
                        className="form-input"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ornek@mail.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Konu</label>
                    <input
                      className="form-input"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Mesajınızın konusu"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mesajınız</label>
                    <textarea
                      className="form-textarea"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Mesajınızı buraya yazın..."
                      style={{ minHeight: '150px' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
                    📨 Gönder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
