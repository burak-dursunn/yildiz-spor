import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAnnouncementBySlug } from '../lib/api'
import { ANNOUNCEMENT_TYPES, getPublicUrl } from '../lib/supabase'
import GallerySlider from '../components/GallerySlider'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Hem data URL, hem Supabase URL, hem path destekle
function resolveImg(v) {
  if (!v) return null
  if (v.startsWith('data:') || v.startsWith('http') || v.startsWith('/')) return v
  return getPublicUrl(v)
}

export default function NewsDetail() {
  const { slug } = useParams()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    getAnnouncementBySlug(slug).then(({ data, error }) => {
      if (error || !data) setError('Haber bulunamadı.')
      else setAnnouncement(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="page-content">
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h1 className="heading-md">Haber Bulunamadı</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Aradığınız haber mevcut değil veya kaldırılmış olabilir.
          </p>
          <Link to="/haberler" className="btn btn-primary">Haberlere Dön</Link>
        </div>
      </div>
    )
  }

  const {
    title, content, type, cover_image, created_at,
    announcement_gallery = [],
  } = announcement

  const typeInfo  = ANNOUNCEMENT_TYPES[type] || { label: type, emoji: '📋' }
  const coverUrl  = resolveImg(cover_image)
  const gallery   = announcement_gallery
    .map(g => ({ ...g, image_url: resolveImg(g.image_url) }))
    .sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="page-content">
      {/* Article Hero */}
      <section className="article-hero">
        {coverUrl && (
          <div className="article-hero-image">
            <img src={coverUrl} alt={title} />
            <div className="article-hero-overlay" />
          </div>
        )}
        <div className="container article-hero-content">
          <div className="animate-fadeInUp">
            <Link to="/haberler" className="back-link">← Haberlere Dön</Link>
            <div className="flex items-center gap-3" style={{ margin: '1rem 0' }}>
              <span className={`badge badge-${type}`}>
                {typeInfo.emoji} {typeInfo.label}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {formatDate(created_at)}
              </span>
            </div>
            <h1 className={`article-title ${!coverUrl ? 'article-title-no-image' : ''}`}>
              {title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section-sm">
        <div className="container">
          <div className="article-layout">
            <article className="article-body">
              {/* İçerik */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Fotoğraf Galerisi — Otomatik Slider */}
              {gallery.length > 0 && (
                <div className="article-gallery">
                  <h2 className="heading-sm" style={{ marginBottom: '1.25rem' }}>
                    📸 Fotoğraf Galerisi
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      ({gallery.length} fotoğraf)
                    </span>
                  </h2>
                  <GallerySlider images={gallery} interval={3000} />
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="article-sidebar">
              <div className="card card-body">
                <p className="sidebar-label">Duyuru Türü</p>
                <span className={`badge badge-${type}`} style={{ marginTop: '0.5rem' }}>
                  {typeInfo.emoji} {typeInfo.label}
                </span>
              </div>
              <div className="card card-body" style={{ marginTop: '1rem' }}>
                <p className="sidebar-label">Tarih</p>
                <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
                  {formatDate(created_at)}
                </p>
              </div>
              {gallery.length > 0 && (
                <div className="card card-body" style={{ marginTop: '1rem' }}>
                  <p className="sidebar-label">Galeri</p>
                  <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    📸 {gallery.length} fotoğraf
                  </p>
                </div>
              )}
              <Link
                to="/haberler"
                className="btn btn-outline w-full"
                style={{ marginTop: '1rem', justifyContent: 'center' }}
              >
                ← Tüm Haberler
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
