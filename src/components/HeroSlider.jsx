import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: '/slider1.jpg',
    title: 'Ergani Yıldız Spor',
    subtitle: "Ergani'nin Gururu, Bölgenin Yıldızı",
    badge: '⚽ Sezon 2024-25',
  },
  {
    id: 2,
    image: '/slider2.jpg',
    title: 'Antrenmanda Kararlılık',
    subtitle: 'Her antrenman bir adım daha ileri. Takımımız en iyisi için çalışıyor.',
    badge: '🏃 Antrenman',
  },
  {
    id: 3,
    image: '/slider3.jpg',
    title: 'Zafer Bizimle',
    subtitle: 'Taraftarlarımızla birlikte her maçı kazanmak için sahadayız.',
    badge: '🏆 Şampiyonluk',
  },
]

export default function HeroSlider({ slides = DEFAULT_SLIDES }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const DURATION = 3000

  const goTo = useCallback((index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 700)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  // Auto-advance
  useEffect(() => {
    if (paused) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(next, DURATION)
    return () => clearInterval(intervalRef.current)
  }, [next, paused])

  // Keyboard navigation
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
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Ana sayfa slayt gösterisi"
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero-slide ${i === current ? 'active' : ''}`}
          aria-hidden={i !== current}
        >
          <img
            src={s.image}
            alt={s.title}
            className="hero-slide-img"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="hero-slide-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className="hero-slider-content container" key={current}>
        <div className="hero-slider-inner animate-slideUp">
          <span className="hero-slider-badge">{slide.badge}</span>
          <h1 className="hero-slider-title">{slide.title}</h1>
          <p className="hero-slider-subtitle">{slide.subtitle}</p>
          <div className="hero-slider-actions">
            <a href="/haberler" className="btn btn-accent btn-lg">Son Haberler</a>
            <a href="/hakkinda" className="btn btn-outline-light btn-lg">Kulübü Tanı</a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        className="slider-arrow slider-arrow-prev"
        onClick={prev}
        aria-label="Önceki slayt"
      >
        ‹
      </button>
      <button
        className="slider-arrow slider-arrow-next"
        onClick={next}
        aria-label="Sonraki slayt"
      >
        ›
      </button>

      {/* Dots */}
      <div className="slider-dots" role="tablist" aria-label="Slayt navigasyonu">
        {slides.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slayt ${i + 1}: ${s.title}`}
            className={`slider-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="slider-counter">
        <span className="slider-counter-current">{String(current + 1).padStart(2, '0')}</span>
        <span className="slider-counter-sep">/</span>
        <span className="slider-counter-total">{String(slides.length).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
