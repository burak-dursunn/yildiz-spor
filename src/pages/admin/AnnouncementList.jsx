import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminGetAnnouncements, deleteAnnouncement, updateAnnouncement } from '../../lib/api'
import { ANNOUNCEMENT_TYPES, getPublicUrl } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { ADMIN } from '../../lib/adminConfig'

function formatDate(d) {
  return new Date(d).toLocaleString('tr-TR', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Hem data URL, hem Supabase URL, hem path destekle
function resolveImg(v) {
  if (!v) return null
  if (v.startsWith('data:') || v.startsWith('http') || v.startsWith('/')) return v
  return getPublicUrl(v)
}

export default function AnnouncementList() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    const { data } = await adminGetAnnouncements()
    setAnnouncements(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" duyurusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return
    setDeleting(id)
    const { error } = await deleteAnnouncement(id)
    if (!error) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } else {
      alert('Silme işlemi başarısız oldu.')
    }
    setDeleting(null)
  }

  const handleTogglePublish = async (a) => {
    const { error } = await updateAnnouncement(a.id, { ...a, published: !a.published })
    if (!error) {
      setAnnouncements(prev =>
        prev.map(item => item.id === a.id ? { ...item, published: !item.published } : item)
      )
    }
  }

  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.type === filter)

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Duyurular</h1>
          <p className="admin-page-subtitle">Tüm duyuru ve haberleri yönetin</p>
        </div>
        <Link to={ADMIN?.haberlerYeni} className="btn btn-accent">
          + Yeni Duyuru
        </Link>
      </div>

      {/* Filter */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü ({announcements.length})
        </button>
        {Object.entries(ANNOUNCEMENT_TYPES).map(([key, { label, emoji }]) => {
          const count = announcements.filter(a => a.type === key).length
          return (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {emoji} {label} ({count})
            </button>
          )
        })}
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="loading-center" style={{ minHeight: '300px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Görsel</th>
                <th>Başlık</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th style={{ width: 180 }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const imgUrl = resolveImg(a.cover_image)
                const typeInfo = ANNOUNCEMENT_TYPES[a.type] || { emoji: '📋', label: a.type }
                return (
                  <tr key={a.id}>
                    <td>
                      {imgUrl ? (
                        <img src={imgUrl} alt={a.title} className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail-placeholder">{typeInfo.emoji}</div>
                      )}
                    </td>
                    <td>
                      <span className="table-title">{a.title}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.type}`}>
                        {typeInfo.emoji} {typeInfo.label}
                      </span>
                    </td>
                    <td>
                      <label className="toggle-published" title="Yayın durumunu değiştir">
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={a.published}
                            onChange={() => handleTogglePublish(a)}
                          />
                          <div className="toggle-slider" />
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: a.published ? 'var(--green-400)' : 'var(--text-muted)' }}>
                          {a.published ? 'Yayında' : 'Taslak'}
                        </span>
                      </label>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {formatDate(a.created_at)}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => navigate(ADMIN?.haberlerEdit(a.id))}
                        >
                          Düzenle
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(a.id, a.title)}
                          disabled={deleting === a.id}
                        >
                          {deleting === a.id ? '...' : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Bu kategoride duyuru bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
