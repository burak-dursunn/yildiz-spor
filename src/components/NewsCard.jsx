import { Link } from 'react-router-dom'
import { ANNOUNCEMENT_TYPES, getPublicUrl } from '../lib/supabase'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getExcerpt(html, maxLen = 100) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}

/* Türe göre gradient renkleri */
const TYPE_GRADIENTS = {
  'mac-sonucu':     'linear-gradient(135deg, #c0392b 0%, #7b241c 100%)',
  'mac-duyurusu':   'linear-gradient(135deg, #e67e22 0%, #b05a00 100%)',
  'antrenman':      'linear-gradient(135deg, #16a34a 0%, #064e29 100%)',
  'genel':          'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
  'kulup-haberleri':'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
}

/* Türe göre büyük SVG ikonlar */
function TypeIcon({ type }) {
  const icons = {
    'mac-sonucu': (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    'mac-duyurusu': (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
        <path d="M22 3L2 10l8 4 4 8 8-19z"/>
      </svg>
    ),
    'antrenman': (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
        <circle cx="12" cy="12" r="3"/>
        <path d="M2 12h3M19 12h3M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
      </svg>
    ),
    'genel': (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    'kulup-haberleri': (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  }
  return icons[type] || (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default function NewsCard({ announcement }) {
  const { id, title, slug, content, type, cover_image, created_at } = announcement
  const typeInfo = ANNOUNCEMENT_TYPES[type] || { label: type, emoji: '📋' }

  const resolveImg = (v) => {
    if (!v) return null
    if (v.startsWith('data:') || v.startsWith('http') || v.startsWith('/')) return v
    return getPublicUrl(v)
  }
  const imgUrl = resolveImg(cover_image)

  return (
    <Link to={`/haberler/${slug}`} className="news-card">
      {/* Görsel alanı — sabit oran, her zaman dolu */}
      <div className="news-card-image">
        {imgUrl ? (
          <img src={imgUrl} alt={title} loading="lazy" />
        ) : (
          <div
            className="news-card-no-image"
            style={{ background: TYPE_GRADIENTS[type] || 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)' }}
          >
            <div className="news-card-no-image-icon">
              <TypeIcon type={type} />
            </div>
            <span className="news-card-no-image-label">{typeInfo.label}</span>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="news-card-body">
        <div className="news-card-meta">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isToday(created_at) && (
              <span className="badge badge-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>
                🌟 YENİ
              </span>
            )}
            <span className={`badge badge-${type}`}>
              {typeInfo.emoji} {typeInfo.label}
            </span>
          </div>
          <span className="news-card-date">{formatDate(created_at)}</span>
        </div>

        <h3 className="news-card-title">{title}</h3>

        {content && (
          <p className="news-card-excerpt">{getExcerpt(content)}</p>
        )}

        <div className="news-card-footer">
          <span className="read-more">
            Devamını Oku
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
