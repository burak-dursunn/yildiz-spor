import React from 'react'
import SEO from '../components/SEO'

export default function About() {
  const timeline = [
    { year: '2009', title: 'Kuruluş', desc: 'Ergani Yıldız Spor Futbol Kulübü, bölge futbolunu geliştirme amacıyla kuruldu.' },
    { year: '1992', title: 'İlk Şampiyonluk', desc: 'Bölge liginde ilk kez şampiyon olarak üst ligde mücadele etme hakkı kazanıldı.' },
    { year: '2003', title: 'Altyapı Yatırımı', desc: 'Gençlik ve genç yeteneklere yönelik kapsamlı altyapı çalışmaları başlatıldı.' },
    { year: '2015', title: 'Tesis Yenileme', desc: 'Spor tesisleri modernize edilerek sporcularımıza daha iyi koşullar sağlandı.' },
    { year: '2025', title: 'Dijital Dönüşüm', desc: 'Kulübümüz resmi web sitesi ve dijital platformlarla taraftarlarıyla daha yakın.' },
  ]


  return (
    <div className="page-content">
      <SEO title="Hakkımızda" />
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-content animate-fadeInUp">
            <div className="page-hero-badge">Kulübümüz</div>
            <h1 className="heading-xl">
              <span className="text-gradient">Ergani Yıldız Spor</span>
            </h1>
            <p className="page-hero-desc">
              09.10.2009'dan bu yana Ergani'nin futbol temsilcisi, bölgenin gururu
            </p>
          </div>
        </div>
        <div className="page-hero-shape" />
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="about-mission">
            <div className="mission-text animate-fadeInUp">
              <h2 className="heading-md mb-4">Misyonumuz & <span className="text-gradient">Vizyonumuz</span></h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                Ergani Yıldız Spor olarak, bölgemizdeki futbol kültürünü geliştirmek, genç yetenekleri
                keşfedip hayallerine kavuşturmak ve Ergani'yi futbolda en iyi şekilde temsil etmek için
                çalışıyoruz.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                Yeşil-sarı renklerimizle sahaya çıktığımızda sadece bir maç oynamıyoruz —
                bir topluluğu, bir tarihi ve bir kültürü temsil ediyoruz.
              </p>

              <div className="mission-values">
                {[
                  { icon: '🤝', label: 'Dayanışma' },
                  { icon: '💪', label: 'Azim' },
                  { icon: '🎯', label: 'Hedef Odaklılık' },
                  { icon: '🌟', label: 'Şampiyonluk Ruhu' },
                ].map(({ icon, label }) => (
                  <div key={label} className="value-chip">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mission-visual animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="about-emblem-card">
                <svg width="140" height="140" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L4 9v14c0 10 7.5 19.3 18 22 10.5-2.7 18-12 18-22V9L22 2z" fill="#0d3d14" stroke="#22a135" strokeWidth="1"/>
                  <path d="M22 7L8 13v10c0 7.5 5.5 14.3 14 16.5C30.5 37.3 36 30.5 36 23V13L22 7z" fill="#1a5c25"/>
                  <path d="M22 12l1.8 5.5H29l-4.6 3.3 1.8 5.5L22 23l-4.2 3.3 1.8-5.5L15 17.5h5.2L22 12z" fill="#f5c518"/>
                  <path d="M14 30h16" stroke="#22a135" strokeWidth="1" opacity="0.5"/>
                </svg>
                <p className="font-heading" style={{ color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Est. 2009
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="heading-lg">Tarihimiz</h2>
            <div className="section-line" />
          </div>
          <div className="timeline">
            {timeline.map(({ year, title, desc }, i) => (
              <div key={year} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content card card-body">
                  <span className="timeline-year">{year}</span>
                  <h3 className="heading-sm">{title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.6' }}>{desc}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
