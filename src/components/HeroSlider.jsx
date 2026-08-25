import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: '/slider1.jpg',
    title: 'Ergani Yıldız Spor',
    subtitle: "Bölgenin parlayan yıldızı. Geleceğin şampiyonlarını burada yetiştiriyor, her antrenmanda daha iyiye gidiyoruz."
  },
  {
    id: 2,
    image: '/slider2.jpg',
    title: 'Antrenmanda Kararlılık',
    subtitle: 'Her antrenman bir adım daha ileri. Takımımız en iyisi için ter döküyor ve geleceğe hazırlanıyor.'
  },
  {
    id: 3,
    image: '/slider3.jpg',
    title: 'Zafer Bizimle',
    subtitle: 'Taraftarlarımızla birlikte her maçı kazanmak için sahadayız. Hedefimiz daima zirve!'
  },
]

export default function HeroSlider({ slides = DEFAULT_SLIDES }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const DURATION = 4000

  const goTo = useCallback((index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  useEffect(() => {
    if (paused) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(next, DURATION)
    return () => clearInterval(intervalRef.current)
  }, [next, paused])

  // Klavye ok tuşlarıyla kontrol
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const getClassName = (index) => {
    let offset = index - current;
    const len = slides.length;
    // Sonsuz döngü hissi için offseti düzeltiyoruz (özellikle 3 slayt varsa)
    if (offset < -Math.floor(len / 2)) offset += len;
    if (offset > Math.floor(len / 2)) offset -= len;
    
    if (offset === 0) return 'cf-slide cf-active';
    if (offset === -1) return 'cf-slide cf-prev';
    if (offset === 1) return 'cf-slide cf-next';
    return 'cf-slide cf-hidden';
  }

  return (
    <div className="cf-section">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Giriş Animasyonlu Başlık */}
        <div className="cf-title-container">
          <h1 className="cf-title">SİTEMİZE HOŞ GELDİNİZ</h1>
          <p className="cf-subtitle">Ergani'nin Gururu, Bölgenin Yıldızı</p>
        </div>

        {/* 3D Coverflow Slider (16:9) */}
        <div 
          className="cf-slider-wrapper"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((s, i) => (
            <div 
              key={s.id} 
              className={getClassName(i)} 
              onClick={() => goTo(i)}
            >
              <img src={s.image} alt={s.title} loading={i === 0 ? 'eager' : 'lazy'} />
              <div className="cf-slide-overlay">
                <h3 className="cf-slide-title">{s.title}</h3>
                <p className="cf-slide-desc">{s.subtitle}</p>
              </div>
            </div>
          ))}

          <button className="cf-arrow cf-arrow-prev" onClick={prev} aria-label="Önceki">‹</button>
          <button className="cf-arrow cf-arrow-next" onClick={next} aria-label="Sonraki">›</button>
        </div>

        {/* Butonlar */}
        <div className="cf-actions">
          <a href="/haberler" className="btn btn-primary btn-lg">Son Haberler</a>
          <a href="/hakkinda" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Kulübü Tanı</a>
        </div>

      </div>
    </div>
  )
}
