import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getLatestAnnouncements } from '../lib/api'
import NewsCard from '../components/NewsCard'
import HeroSlider from '../components/HeroSlider'
import SEO from '../components/SEO'

const altyapiImg = '/yıldızspor altyapı.jpg'

const SLIDER_SLIDES = [
  {
    id: 1,
    image: '/E.Yıldız Spor Takım Kadrosu-1.jpeg',
    title: 'Ergani Yıldız Spor',
    subtitle: "Ergani'nin Gururu, Bölgenin Yıldızı",
    badge: '⚽ Sezon 2024-25',
  },
  {
    id: 2,
    image: '/E.Yıldız Spor Takım Kadrosu-2.jpeg',
    title: 'Antrenmanda Kararlılık',
    subtitle: 'Her antrenman bir adım daha ileri. Takımımız en iyisi için çalışıyor.',
    badge: '🏃 Antrenman',
  },
  {
    id: 3,
    image: '/E.Yıldız Spor Takım Kadrosu-3.jpg',
    title: 'Zafer Bizimle',
    subtitle: 'Taraftarlarımızla birlikte her maçı kazanmak için sahadayız.',
    badge: '🏆 Şampiyonluk',
  },
]

/* ─── Scroll reveal hook ─────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ─── Latest News ────────────────────────────────────── */
function LatestNewsSection({ announcements, loading }) {
  const [ref, visible] = useInView()

  return (
    <section ref={ref} className={`home-section home-news-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-section-header">
          <div>
            <span className="section-eyebrow">Kulüp Haberleri</span>
            <h2 className="home-section-title">Son Haberler</h2>
          </div>
          <Link to="/haberler" className="btn btn-outline">
            Tüm Haberler →
          </Link>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <p>Henüz haber bulunmuyor.</p>
          </div>
        ) : (
          <div className="news-featured-grid stagger-children">
            {announcements.map((a, i) => (
              <NewsCard key={a.id} announcement={a} featured={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── About Split Section ────────────────────────────── */
function AboutSplitSection() {
  const [ref, visible] = useInView()
  const [imgRef, imgVisible] = useInView()

  return (
    <section ref={ref} className={`home-split-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-split-grid">
          {/* Sol: Metin */}
          <div className="home-split-text">
            <span className="section-eyebrow">Kulübümüz Hakkında</span>
            <h2 className="home-split-title">
              <span className="text-accent-blue">Ergani Yıldız Spor</span><br />
              Futbol Akademisi
            </h2>
            <p className="home-split-desc">
              Ergani Yıldız Spor, 2009 yılında Ergani'de futbolu köklü bir değer olarak yaşatmak amacıyla kuruldu.
              Kuruluşundan bu yana yüzlerce genç futbolcuya sahada ve sahada öte disiplin, takım ruhu ve
              spor ahlakı kazandırdı.
            </p>
            <p className="home-split-desc">
              Kulübümüz yalnızca maç kazanmayı değil; çocuklarımızı hayata hazırlayan,
              velilerin güvenle emanet edebileceği bir futbol ailesi olmayı hedefler.
            </p>
            <div className="home-split-stats">
              <div className="mini-stat">
                <span className="mini-stat-val">2009</span>
                <span className="mini-stat-label">Kuruluş Yılı</span>
              </div>
              <div className="mini-stat-divider" />
              <div className="mini-stat">
                <span className="mini-stat-val">300+</span>
                <span className="mini-stat-label">Yetiştirilen Sporcu</span>
              </div>
            </div>
            <Link to="/hakkinda" className="btn btn-primary home-split-btn">
              Kulübü Tanıyın
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Sağ: Görsel */}
          <div ref={imgRef} className={`home-split-visual ${imgVisible ? 'in-view' : ''}`}>
            <div className="home-split-img-main">
              <img src="/E.Yıldız Spor Takım Kadrosu-1.jpeg" alt="Ergani Yıldız Spor Takım Fotoğrafı" loading="lazy" decoding="async" />
            </div>
            <div className="home-split-img-badge">
              <img src="/logo.png" alt="Logo" loading="lazy" decoding="async" />
              <span>Ergani Yıldız Spor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Academy Split Section ──────────────────────────── */
function AcademySplitSection() {
  const [ref, visible] = useInView()
  const [imgRef, imgVisible] = useInView()

  return (
    <section ref={ref} className={`home-split-section home-split-alt ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-split-grid">
          {/* Sol: Fotoğraf */}
          <div ref={imgRef} className={`home-split-visual ${imgVisible ? 'in-view' : ''}`}>
            <div className="home-split-img-main">
              <img src={altyapiImg} alt="Yıldızspor Altyapı" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* Sağ: Metin */}
          <div className="home-split-text">
            <span className="section-eyebrow">Altyapı Akademisi</span>
            <h2 className="home-split-title">
              Geleceğin<br />
              <span className="text-accent-blue">Yıldızlarını</span> Geliştiriyoruz
            </h2>
            <p className="home-split-desc">
              Altyapı akademimiz, 7 yaşından 18 yaşına kadar her yaş grubuna özel geliştirilen
              antrenman programları ile çocuklarınızın potansiyelini en üst düzeye taşır.
            </p>
            <p className="home-split-desc">
              Lisanslı antrenörlerimiz eşliğinde bilimsel antrenman metodolojisi,
              bireysel gelişim takibi ve güvenli bir spor ortamı sunuyoruz.
            </p>
            <div className="home-feature-list">
              {[
                'UEFA Lisanslı Antrenörler',
                'Bireysel Gelişim Programları',
                'Modern Antrenman Tesisleri',
                'Aile ile Şeffaf İletişim',
              ].map(f => (
                <div key={f} className="home-feature-item">
                  <span className="home-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
            <Link to="/iletisim" className="btn btn-primary home-split-btn">
              Altyapıya Katıl
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── U-13 Gallery Section ───────────────────────────── */
function U13GallerySection() {
  const [ref, visible] = useInView()
  return (
    <section ref={ref} className={`home-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-section-header centered">
          <span className="section-eyebrow">Geleceğin Yıldızları</span>
          <h2 className="home-section-title">U-13 Takımımız</h2>
          <p className="home-section-sub">Futbol akademimizin parlayan yıldızları sahada yeteneklerini sergiliyor.</p>
        </div>
        <div className="news-featured-grid">
          <img src="/E.Yıldız Spor U-13.1.jpeg" alt="U-13 Takımı 1" style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px' }} loading="lazy" decoding="async" />
          <img src="/E.Yıldız Spor U-13.2.jpg" alt="U-13 Takımı 2" style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px' }} loading="lazy" decoding="async" />
          <img src="/E.Yıldız Spor U-13.3.jpg" alt="U-13 Takımı 3" style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px' }} loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  )
}

/* ─── Age Categories ─────────────────────────────────── */
const CATEGORIES = [
  { label: 'U-8', name: 'Minikler', age: '7–8 Yaş', desc: 'Temel motor beceriler, oyun sevgisi ve takım ruhu.' },
  { label: 'U-10', name: 'Küçükler', age: '9–10 Yaş', desc: 'Teknik gelişim, top kontrolü ve pozisyon eğitimi.' },
  { label: 'U-13', name: 'Yıldızlar', age: '11–13 Yaş', desc: 'Taktik kavramlar, bireysel gelişim ve rekabetçi lig.' },
  { label: 'U-15', name: 'Gençler', age: '14–15 Yaş', desc: 'İleri taktik, fiziksel hazırlık ve performans analizi.' },
  { label: 'U-18', name: 'Genç A', age: '16–18 Yaş', desc: 'Profesyonel hazırlık, zihinsel kuvvet ve liderlik.' },
]

function AgeCategories() {
  const [ref, visible] = useInView()

  return (
    <section ref={ref} className={`home-section bg-dark-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-section-header centered light">
          <h2 className="home-section-title light">Yaş Kategorileri</h2>
          <p className="home-section-sub light">
            Her yaş grubuna özel bilimsel antrenman programları ile çocuğunuzun seviyesine uygun gelişim ortamı.
          </p>
        </div>

        <div className="age-cats-grid">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className="age-cat-card"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="age-cat-label">{cat.label}</div>
              <div className="age-cat-name">{cat.name}</div>
              <div className="age-cat-age">{cat.age}</div>
              <p className="age-cat-desc">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Stats Bar ──────────────────────────────────────── */
function StatsBar() {
  const [ref, visible] = useInView()
  const stats = [
    { value: '15+', label: 'Yıl Tecrübe' },
    { value: '300+', label: 'Yetiştirilen Futbolcu' },
    { value: '5', label: 'Altyapı Takımı' },
    { value: '12+', label: 'Kupa & Derece' },
    { value: '3', label: 'Lisanslı Antrenör' },
  ]

  return (
    <section ref={ref} className={`home-stats-bar ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-stats-row">
          {stats.map((s, i) => (
            <div key={s.label} className="home-stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="home-stat-val">{s.value}</span>
              <span className="home-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Values Section ─────────────────────────────────── */
function ValuesSection() {
  const [ref, visible] = useInView()

  return (
    <section ref={ref} className={`home-section home-values-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-section-header centered">
          <span className="section-eyebrow">Futbol Anlayışımız</span>
          <h2 className="home-section-title">Değerlerimiz</h2>
        </div>

        <div className="values-text-block">
          <h3 className="values-main-title">Spor, Sadece Bir Oyun Değildir</h3>
          <p className="values-main-para">
            Çocukların gelişiminde sporun yeri, fiziksel sağlığın çok ötesindedir. Düzenli fiziksel aktivite;
            çocukların hareket becerilerini geliştirmelerine, dikkat ve hafıza gibi bilişsel becerilerini
            desteklemelerine, özgüven kazanmalarına ve sosyal ilişkiler kurmalarına katkı sağlar.
          </p>
          <p className="values-main-para">
            Takım sporları ise çocuklara birlikte hareket etmeyi, sorumluluk almayı, hedef belirlemeyi
            ve kazanmanın olduğu kadar kaybetmenin de doğal olduğunu öğretir.
          </p>
          <p className="values-main-para">
            Biz, futbolu yalnızca bir yetenek geliştirme alanı olarak değil; çocukların disiplin, özgüven,
            takım ruhu ve sağlıklı yaşam alışkanlıkları kazanabilecekleri önemli bir gelişim ortamı olarak görüyoruz.
          </p>
          <p className="values-main-quote">
            Çünkü bizim için amaç yalnızca iyi futbolcular yetiştirmek değil, sporun değerleriyle güçlü bireylerin yetişmesine katkı sağlamaktır.
          </p>
        </div>

        <div className="values-grid">
          {[
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: 'Takım Ruhu',
              desc: 'Birlikte oynamak, birlikte kazanmak. Her sporcu takımının vazgeçilmez bir parçasıdır.',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: 'Bilimsel Gelişim',
              desc: 'Çağın gerisinde kalmayan antrenman metodolojisi ile her sporcunun potansiyeli maksimize edilir.',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: 'Güvenli Ortam',
              desc: 'Veliler her zaman içi rahat olabilir. Çocukların güvenliği ve psikolojik sağlığı önceliğimizdir.',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              ),
              title: 'Spor Ahlakı',
              desc: 'Saygılı, dürüst ve disiplinli bireyler yetiştiriyoruz. Futbol bir araç; karakter bir hedef.',
            },
          ].map((v, i) => (
            <div key={v.title} className="value-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="value-icon">{v.icon}</div>
              <h3 className="value-title">{v.title}</h3>
              <p className="value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Trust Section (Veliler için) ──────────────────── */
const TRUSTS = [
  { icon: '🏅', title: 'Bölge Şampiyonluğu', desc: 'Diyarbakır Amatör Ligi birincilikleri ve bölgesel turnuva zaferleri.' },
  { icon: '📋', title: 'Lisanslı Antrenörler', desc: 'Tüm antrenörlerimiz TFF tarafından onaylı lisanslara sahiptir.' },
  { icon: '👨‍👩‍👧', title: 'Aile Odaklı Yaklaşım', desc: 'Veliler her gelişimi takip edebilir. Şeffaflık ve iletişim birincil prensibimiz.' },
  { icon: '🩺', title: 'Sporcu Sağlığı', desc: 'Periyodik sağlık kontrolleri ve profesyonel spor sağlığı danışmanlığı.' },
]

function TrustSection() {
  const [ref, visible] = useInView()

  return (
    <section ref={ref} className={`home-section ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-section-header centered">
          <span className="section-eyebrow">Veliler İçin</span>
          <h2 className="home-section-title">Neden Ergani Yıldız Spor?</h2>
          <p className="home-section-sub">
            Çocuğunuzu güvenle emanet edebileceğiniz, altyapının kalitesine yatırım yapan bir kulüp.
          </p>
        </div>

        <div className="trust-grid">
          {TRUSTS.map((t, i) => (
            <div key={t.title} className="trust-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="trust-icon">{t.icon}</div>
              <h3 className="trust-title">{t.title}</h3>
              <p className="trust-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Join Section ───────────────────────────────── */
function JoinCTASection() {
  const [ref, visible] = useInView()

  return (
    <section ref={ref} className={`home-join-cta ${visible ? 'in-view' : ''}`}>
      <div className="container">
        <div className="home-join-inner">
          <div className="home-join-text">
            <span className="section-eyebrow light">Altyapıya Katılın</span>
            <h2 className="home-join-title">
              Çocuğunuzun<br />Geleceğine Yatırım Yapın
            </h2>
            <p className="home-join-sub">
              Ergani Yıldız Spor altyapısına katılmak için bizimle iletişime geçin.
              Kayıt, antrenman takvimi ve kategoriler hakkında bilgi alabilirsiniz.
            </p>
            <div className="home-join-actions" style={{ flexDirection: 'row', marginTop: '1.5rem' }}>
              <Link to="/iletisim" className="btn btn-white btn-lg">
                İletişime Geç
              </Link>
              <Link to="/hakkinda" className="btn btn-outline-white btn-lg">
                Kulübü Tanı
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── HOME PAGE ──────────────────────────────────────── */
export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestAnnouncements(3).then(({ data }) => {
      setAnnouncements(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="home-page">
      <SEO
        title="Ana Sayfa"
        description="Ergani Yıldız Spor Kulübü - Bölgenin Parlayan Yıldızı. Altyapı ve A Takım futbol faaliyetlerimiz."
      />
      {/* 1. Hero Slider — tam genişlik */}
      <section className="home-hero-wrap" style={{ paddingTop: 'var(--nav-height)' }}>
        <HeroSlider slides={SLIDER_SLIDES} />
      </section>

      {/* 2. Son Haberler — slider'ın hemen altında */}
      <LatestNewsSection announcements={announcements} loading={loading} />

      {/* 3. Kulüp Tanıtım */}
      <AboutSplitSection />

      {/* 4. Altyapı Tanıtım */}
      <AcademySplitSection />

      <U13GallerySection />

      {/* 5. İstatistikler */}
      <StatsBar />

      {/* 6. Yaş Kategorileri */}
      <AgeCategories />

      {/* 7. Değerler / Futbol Anlayışı */}
      <ValuesSection />

      {/* 8. Veli Güven Bölümü */}
      <TrustSection />

      {/* 9. CTA */}
      <JoinCTASection />
    </div>
  )
}
