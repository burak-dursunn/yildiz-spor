import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: '/slider1.jpg',
    title: 'Ergani Yıldız Spor\'a Hoş Geldiniz',
    subtitle: "Bölgenin parlayan yıldızı. Geleceğin şampiyonlarını burada yetiştiriyor, her antrenmanda daha iyiye gidiyoruz.",
    badge: '⚽ Hoş Geldiniz',
  },
  {
    id: 2,
    image: '/slider2.jpg',
    title: 'Antrenmanda Kararlılık',
    subtitle: 'Her antrenman bir adım daha ileri. Takımımız en iyisi için ter döküyor ve geleceğe hazırlanıyor.',
    badge: '🏃 Antrenman',
  },
  {
    id: 3,
    image: '/slider3.jpg',
    title: 'Zafer Bizimle',
    subtitle: 'Taraftarlarımızla birlikte her maçı kazanmak için sahadayız. Hedefimiz daima zirve!',
    badge: '🏆 Şampiyonluk',
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

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const slide = slides[current]

  return (
    <div
      className="hero-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container hero-container">
        
        {/* Left Side: Content */}
        <div className="hero-content">
          <div key={current} className="animate-slideUp">
            <span className="hero-badge">{slide.badge}</span>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
            <div className="hero-actions">
              <a href="/haberler" className="btn btn-primary btn-lg">Son Haberler</a>
              <a href="/hakkinda" className="btn btn-outline btn-lg">Kulübü Tanı</a>
            </div>
          </div>

          <div className="hero-controls">
            <div className="slider-dots" style={{ position: 'relative', bottom: 'auto', left: 'auto', transform: 'none' }}>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  className={`slider-dot ${i === current ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Slayt ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Image with crossfade */}
        <div className="hero-visual">
          <div className="hero-visual-frame">
            {slides.map((s, i) => (
              <img
                key={s.id}
                src={s.image}
                alt={s.title}
                className={`hero-image ${i === current ? 'active' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
            
            {/* Arrows overlaid on image */}
            <button className="hero-arrow hero-arrow-prev" onClick={prev}>‹</button>
            <button className="hero-arrow hero-arrow-next" onClick={next}>›</button>
          </div>
        </div>

      </div>
    </div>
  )
}
