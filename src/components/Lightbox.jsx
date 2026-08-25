import { useState, useEffect, useCallback } from 'react'

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = useCallback(() => {
    setCurrent(i => (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const img = images[current]

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğraf görüntüleyici"
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Kapat">
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={prev} aria-label="Önceki">
            ‹
          </button>
          <button className="lightbox-nav lightbox-next" onClick={next} aria-label="Sonraki">
            ›
          </button>
        </>
      )}

      <div className="lightbox-content">
        <img
          src={typeof img === 'string' ? img : img.image_url}
          alt={img.caption || `Fotoğraf ${current + 1}`}
          onClick={(e) => e.stopPropagation()}
        />
        {img.caption && (
          <p className="lightbox-caption">{img.caption}</p>
        )}
        {images.length > 1 && (
          <span className="lightbox-counter">{current + 1} / {images.length}</span>
        )}
      </div>
    </div>
  )
}
