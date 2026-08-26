import React from 'react'
import SEO from '../components/SEO'

export default function About() {
  const timeline = [
    { year: '2009', title: 'Kuruluş', desc: 'Ergani Yıldız Spor Kulübü, ilçede futbolun gelişimine katkı sağlamak ve gençleri sporla buluşturmak amacıyla kuruldu.' },
    { year: '2012', title: 'Sportif Faaliyetlerin Gelişimi', desc: 'Kulübümüz, kuruluşunun ardından bölgesel futbol organizasyonlarında ve liglerde mücadele ederek sportif faaliyetlerini geliştirmeye devam etti.' },
    { year: '2016', title: 'Rekabet ve Tecrübe', desc: 'Farklı sezonlarda lig ve turnuvalarda mücadele eden takımımız, kazandığı deneyimlerle sportif yapısını güçlendirdi ve bölge futbolunda varlığını sürdürdü.' },
    { year: '2020', title: 'Kulüp Yapısının Güçlendirilmesi', desc: 'Sportif çalışmaların yanı sıra kulüp organizasyonunun geliştirilmesine ve futbolcuların düzenli antrenmanlarla gelişimine daha fazla önem verilmeye başlandı.' },
    { year: '2025', title: 'Yeni Dönem', desc: 'Ergani Yıldız Spor, A takım faaliyetlerinin yanında altyapı çalışmalarına da önem vererek genç futbolcuların gelişimine katkı sağlamayı ve kulübün geleceğini güçlendirmeyi sürdürüyor.' },
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
          <div className="about-mission" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'flex-start' }}>
            <div className="mission-text animate-fadeInUp">
              <h2 className="heading-md mb-4">Misyonumuz & <span className="text-gradient">Vizyonumuz</span></h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                Ergani Yıldız Spor olarak, bölgemizdeki futbol kültürünü geliştirmek, genç yetenekleri
                keşfedip hayallerine kavuşturmak ve Ergani'yi futbolda en iyi şekilde temsil etmek için
                çalışıyoruz. Yeşil-sarı renklerimizle sahaya çıktığımızda sadece bir maç oynamıyoruz —
                bir topluluğu, bir tarihi ve bir kültürü temsil ediyoruz.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                <strong>Spor, Sadece Bir Oyun Değildir!</strong> Çocukların gelişiminde sporun yeri, fiziksel sağlığın çok ötesindedir.
                Düzenli fiziksel aktivite; çocukların hareket becerilerini geliştirmelerine, dikkat ve hafıza gibi bilişsel becerilerini
                desteklemelerine, özgüven kazanmalarına ve sosyal ilişkiler kurmalarına katkı sağlar. Takım sporları ise onlara birlikte hareket etmeyi,
                sorumluluk almayı, hedef belirlemeyi ve kazanmanın olduğu kadar kaybetmenin de doğal olduğunu öğretir.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                Biz, futbolu yalnızca bir yetenek geliştirme alanı olarak değil; çocukların disiplin, özgüven,
                takım ruhu ve sağlıklı yaşam alışkanlıkları kazanabilecekleri önemli bir gelişim ortamı olarak görüyoruz.
                Çünkü bizim için amaç yalnızca iyi futbolcular yetiştirmek değil, <strong>sporun değerleriyle güçlü bireylerin yetişmesine katkı sağlamaktır.</strong>
              </p>

            </div>
            <div className="mission-visual animate-fadeInUp" style={{ animationDelay: '0.2s', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/E.Yıldız Spor Futbol Akademisi+İletişim.jpeg"
                alt="Misyonumuz ve Değerlerimiz"
                style={{ width: '100%', maxWidth: '400px', aspectRatio: '9/16', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                loading="lazy"
                decoding="async"
              />
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
