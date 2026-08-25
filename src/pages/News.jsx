import { useState, useEffect } from 'react'
import { getAnnouncements } from '../lib/api'
import { ANNOUNCEMENT_TYPES } from '../lib/supabase'
import NewsCard from '../components/NewsCard'
import SEO from '../components/SEO'

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  ...Object.entries(ANNOUNCEMENT_TYPES).map(([value, { label, emoji }]) => ({
    value,
    label: `${emoji} ${label}`,
  })),
]

export default function News() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 9

  const fetchData = async (reset = false) => {
    setLoading(true)
    const offset = reset ? 0 : page * LIMIT
    const { data } = await getAnnouncements({ type: filter, limit: LIMIT, offset })
    const items = data || []
    if (reset) {
      setAnnouncements(items)
      setPage(1)
    } else {
      setAnnouncements(prev => [...prev, ...items])
      setPage(p => p + 1)
    }
    setHasMore(items.length === LIMIT)
    setLoading(false)
  }

  useEffect(() => {
    fetchData(true)
  }, [filter])

  return (
    <div className="page-content">
      <SEO title="Kulüp Haberleri" description="Ergani Yıldız Spor'dan en güncel haberler ve duyurular." />
      {/* Page Hero */}
      <section className="page-hero page-hero-sm">
        <div className="container">
          <div className="page-hero-content animate-fadeInUp">
            <div className="page-hero-badge">Duyurular & Haberler</div>
            <h1 className="heading-xl">
              Son <span className="text-gradient">Gelişmeler</span>
            </h1>
          </div>
        </div>
        <div className="page-hero-shape" />
      </section>

      {/* Filter Bar */}
      <section className="section-sm">
        <div className="container">
          <div className="filter-bar">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                className={`filter-btn ${filter === value ? 'active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* News Grid */}
          {announcements.length === 0 && !loading ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 className="heading-sm">İçerik Bulunamadı</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Bu kategoride henüz duyuru bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid-3 stagger-children" style={{ marginTop: '2rem' }}>
              {announcements.map(a => (
                <NewsCard key={a.id} announcement={a} />
              ))}
            </div>
          )}

          {loading && (
            <div className="loading-center" style={{ minHeight: '200px' }}>
              <div className="spinner" />
            </div>
          )}

          {!loading && hasMore && announcements.length > 0 && (
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => fetchData(false)}
              >
                Daha Fazla Yükle
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
