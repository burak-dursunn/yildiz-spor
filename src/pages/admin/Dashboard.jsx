import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetAnnouncements, getVisitStats } from '../../lib/api'
import { ANNOUNCEMENT_TYPES } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { ADMIN } from '../../lib/adminConfig'

function formatDate(d) {
  return new Date(d).toLocaleString('tr-TR', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([])
  const [visits, setVisits] = useState({ today: 0, weekly: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGetAnnouncements(),
      getVisitStats()
    ]).then(([annRes, visitRes]) => {
      setAnnouncements(annRes.data || [])
      if (visitRes.data) setVisits(visitRes.data)
      setLoading(false)
    })
  }, [])

  const published = announcements.filter(a => a.published).length
  const typeCount = {}
  announcements.forEach(a => { typeCount[a.type] = (typeCount[a.type] || 0) + 1 })
  const recent = announcements.slice(0, 5)

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Kulüp içerik yönetim panelinize hoş geldiniz.</p>
        </div>
        <Link to={ADMIN?.haberlerYeni} className="btn btn-accent">
          + Yeni Duyuru
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid hidden-on-mobile" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>👥</div>
          <div className="stat-value">{visits.today}</div>
          <div className="stat-label">Bugünkü Ziyaretçi</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>📈</div>
          <div className="stat-value">{visits.weekly}</div>
          <div className="stat-label">Bu Haftaki Ziyaretçi</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">📰</div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-label">Toplam Duyuru</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">✅</div>
          <div className="stat-value">{published}</div>
          <div className="stat-label">Yayında</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📁</div>
          <div className="stat-value">{announcements.length - published}</div>
          <div className="stat-label">Taslak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">📅</div>
          <div className="stat-value">{recent.length > 0 ? formatDate(recent[0]?.created_at) : '—'}</div>
          <div className="stat-label">Son Duyuru</div>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="data-table-wrapper hidden-on-mobile" style={{ marginBottom: '1.5rem' }}>
        <div className="data-table-header">
          <h3 className="heading-sm">Türlere Göre Dağılım</h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {Object.entries(ANNOUNCEMENT_TYPES).map(([key, { label, emoji }]) => (
            <div key={key} className={`badge badge-${key}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {emoji} {label} <strong style={{ marginLeft: '0.5rem' }}>{typeCount[key] || 0}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h3 className="heading-sm">Son Duyurular</h3>
          <Link to={ADMIN?.haberler} className="btn btn-ghost btn-sm">
            Tümünü Gör →
          </Link>
        </div>
        {loading ? (
          <div className="loading-center" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(a => (
                <tr key={a.id}>
                  <td>
                    <span className="table-title">{a.title}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${a.type}`}>
                      {ANNOUNCEMENT_TYPES[a.type]?.emoji} {ANNOUNCEMENT_TYPES[a.type]?.label}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: a.published ? 'rgba(34,161,53,0.15)' : 'rgba(100,100,100,0.15)',
                      color: a.published ? 'var(--green-400)' : 'var(--text-muted)',
                      border: `1px solid ${a.published ? 'rgba(34,161,53,0.3)' : 'rgba(100,100,100,0.3)'}`,
                    }}>
                      {a.published ? '✅ Yayında' : '📁 Taslak'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {formatDate(a.created_at)}
                  </td>
                  <td>
                    <Link
                      to={ADMIN?.haberlerEdit(a.id)}
                      className="action-btn action-btn-edit"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Henüz duyuru bulunmuyor. <Link to={ADMIN?.haberlerYeni} style={{ color: 'var(--primary)' }}>İlk duyuruyu oluşturun →</Link>
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
