import { useState, useEffect, useRef, useCallback } from 'react'
import Lightbox from './Lightbox'
import { preloadGalleryImages } from '../lib/imageUtils'

/**
 * GallerySlider — Optimize Edilmiş Galeri Slider
 *
 * Temel Optimizasyonlar:
 *
 * 1. VIRTUAL RENDERING (Sanal Render)
 *    Eski: images.map() ile tüm 22 resmi DOM'a yazar → 22 HTTP isteği
 *    Yeni: DOM'a SADECE aktif + önceki + sonraki resim eklenir (3 resim)
 *    22 resim yerine 3 HTTP isteği → dramatik hız farkı
 *
 * 2. PRELOADING (Önceden Yükleme)
 *    Aktif resim değiştiğinde bir sonraki/önceki sessizce önbelleğe alınır.
 *    Kullanıcı "ileri" tıkladığında resim zaten hazır — anında görünür.
 *
 * 3. THUMBNAIL LAZY LOADING
 *    Thumbnail bar overflow-x: auto olduğu için loading="lazy" gerçekten çalışır.
 */
export default function GallerySlider({ images, interval = 3500 }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const go = useCallback((index) => {
    setCurrent(((index % images.length) + images.length) % images.length)
  }, [images.length])

  // Otomatik geçiş (lightbox açıkken durur)
  useEffect(() => {
    if (lightboxOpen) return
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [images.length, interval, lightboxOpen])

  // Preloading: aktif resim değişince komşuları sessizce indir
  useEffect(() => {
    preloadGalleryImages(images, current)
  }, [current, images])

  if (!images || images.length === 0) return null

  const resolveUrl = (url) => url || ''

  // Virtual Rendering: hangi index'lerin DOM'da olacağını belirle
  const getVisibleIndexes = () => {
    const len = images.length
    if (len === 1) return new Set([0])
    if (len === 2) return new Set([0, 1])
    const prev = (current - 1 + len) % len
    const next = (current + 1) % len
    return new Set([prev, current, next])
  }
  const visibleIndexes = getVisibleIndexes()

  return (
    <div className="gallery-slider">
      {/* Ana Görsel */}
      <div className="gallery-slider-main">
        {images.map((img, i) => {
          // Virtual Rendering: görünür alanda olmayan resimleri DOM'a yazma
          if (!visibleIndexes.has(i)) return null

          return (
            <div
              key={img.id || i}
              className={`gallery-slider-slide ${i === current ? 'active' : ''}`}
            >
              <img
                src={resolveUrl(img.image_url)}
                alt={img.caption || `Fotoğraf ${i + 1}`}
                loading={i === current ? 'eager' : 'lazy'}
                decoding="async"
                style={{ cursor: 'pointer' }}
                onClick={() => setLightboxOpen(true)}
              />
            </div>
          )
        })}

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

      {/* Thumbnail Bar
          overflow-x: auto olduğu için loading="lazy" gerçekten çalışır.
          Görünür alanın dışındaki thumbnail'lar yüklenmez.
      */}
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
                decoding="async"
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
