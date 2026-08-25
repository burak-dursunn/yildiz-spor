import { useState, useEffect, useRef } from 'react'
import Lightbox from './Lightbox'

/**
 * GallerySlider — Otomatik geçişli galeri slider
 * - Hover'da DURMUYOR, sürekli geçiş yapıyor
 * - Ok tuşları ve dot navigasyon
 * - Thumbnail bar altta
 */
export default function GallerySlider({ images, interval = 3500 }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const go = (index) => {
    setCurrent(((index % images.length) + images.length) % images.length)
  }

  // Otomatik geçiş
  useEffect(() => {
    if (lightboxOpen) return // Işık kutusu açıkken slider durur
    
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [images.length, interval, lightboxOpen])

  if (!images || images.length === 0) return null

  const resolveUrl = (url) => url || ''

  return (
    <div className="gallery-slider">
      {/* Ana Görsel */}
      <div className="gallery-slider-main">
        {images.map((img, i) => (
          <div
            key={img.id || i}
            className={`gallery-slider-slide ${i === current ? 'active' : ''}`}
          >
            <img
              src={resolveUrl(img.image_url)}
              alt={img.caption || `Fotoğraf ${i + 1}`}
              loading="lazy"
              decoding="async"
              style={{ cursor: 'pointer' }}
              onClick={() => setLightboxOpen(true)}
            />
          </div>
        ))}

        {/* Navigasyon Okları */}
        {images.length > 1 && (
          <>
            <button
              className="gslider-arrow gslider-prev"
              onClick={() => go(current - 1)}
              aria-label="Önceki fotoğraf"
            >
              ‹
            </button>
            <button
              className="gslider-arrow gslider-next"
              onClick={() => go(current + 1)}
              aria-label="Sonraki fotoğraf"
            >
              ›
            </button>
          </>
        )}

        {/* Sayaç */}
        <div className="gslider-counter">
          {current + 1} / {images.length}
        </div>

        {/* Caption */}
        {images[current]?.caption && (
          <div className="gslider-caption">{images[current].caption}</div>
        )}



      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="gslider-thumbs">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              className={`gslider-thumb ${i === current ? 'active' : ''}`}
              onClick={() => go(i)}
              aria-label={`Fotoğraf ${i + 1}`}
            >
              <img
                src={resolveUrl(img.image_url)}
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox (Tam Ekran Fotoğraf) */}
      {lightboxOpen && (
        <Lightbox 
          images={images} 
          initialIndex={current} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </div>
  )
}
