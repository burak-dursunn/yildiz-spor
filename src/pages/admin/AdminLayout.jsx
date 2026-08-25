import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminGetAnnouncements } from '../../lib/api'
import { ANNOUNCEMENT_TYPES } from '../../lib/supabase'

function AdminSidebar({ announcements }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  const isActive = (path) => location.pathname === path

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'A'

  const typeCount = {}
  announcements.forEach(a => {
    typeCount[a.type] = (typeCount[a.type] || 0) + 1
  })

  return (
    <aside className="admin-sidebar">
      <p className="sidebar-section-title">Yönetim</p>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link
              to="/admin/panel"
              className={`sidebar-link ${isActive('/admin/panel') ? 'active' : ''}`}
            >
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/panel/haberler"
              className={`sidebar-link ${isActive('/admin/panel/haberler') ? 'active' : ''}`}
            >
              <span className="icon">📰</span>
              Duyurular
              <span className="badge-count">{announcements.length}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/panel/haberler/yeni"
              className={`sidebar-link ${isActive('/admin/panel/haberler/yeni') ? 'active' : ''}`}
            >
              <span className="icon">✏️</span>
              Yeni Duyuru
            </Link>
          </li>
        </ul>
      </nav>

      <p className="sidebar-section-title">Lig</p>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link
              to="/admin/panel/lig"
              className={`sidebar-link ${isActive('/admin/panel/lig') ? 'active' : ''}`}
            >
              <span className="icon">🏆</span>
              Lig Yönetimi
            </Link>
          </li>
          <li>
            <Link
              to="/admin/panel/lig/mac-gir"
              className={`sidebar-link ${isActive('/admin/panel/lig/mac-gir') ? 'active' : ''}`}
            >
              <span className="icon">⚽</span>
              Maç Sonucu Gir
            </Link>
          </li>
          <li>
            <Link
              to="/admin/panel/lig/takimlar"
              className={`sidebar-link ${isActive('/admin/panel/lig/takimlar') ? 'active' : ''}`}
            >
              <span className="icon">👥</span>
              Takımlar
            </Link>
          </li>
        </ul>
      </nav>

      <p className="sidebar-section-title">Türlere Göre</p>
      <nav>
        <ul className="sidebar-nav">
          {Object.entries(ANNOUNCEMENT_TYPES).map(([key, { label, emoji }]) => (
            <li key={key}>
              <div className="sidebar-link" style={{ cursor: 'default', opacity: 0.8 }}>
                <span className="icon">{emoji}</span>
                <span style={{ fontSize: '0.8125rem' }}>{label}</span>
                <span className="badge-count">{typeCount[key] || 0}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
          <div className="admin-avatar">{userInitial}</div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" target="_blank" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            🌐 Site
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleSignOut} style={{ flex: 1 }}>
            Çıkış
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }) {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    adminGetAnnouncements().then(({ data }) => setAnnouncements(data || []))
  }, [])

  return (
    <div className="admin-layout">
      {/* Topbar */}
      <div className="admin-topbar">
        <span className="admin-topbar-title">⚽ Ergani Yıldız Spor — Yönetim Paneli</span>
        <Link to="/admin/panel/haberler/yeni" className="btn btn-primary btn-sm">
          + Yeni Duyuru
        </Link>
      </div>

      <AdminSidebar announcements={announcements} />

      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
