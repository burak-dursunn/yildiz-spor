import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminGetAnnouncements } from '../../lib/api'
import { ANNOUNCEMENT_TYPES } from '../../lib/supabase'
import { ADMIN } from '../../lib/adminConfig'

function AdminSidebar({ announcements, isOpen }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate(ADMIN?.base || '/')
  }

  const isActive = (path) => location.pathname === path

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'A'

  const typeCount = {}
  announcements.forEach(a => {
    typeCount[a.type] = (typeCount[a.type] || 0) + 1
  })

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <p className="sidebar-section-title">Yönetim</p>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link
              to={ADMIN?.panel}
              className={`sidebar-link ${isActive(ADMIN?.panel) ? 'active' : ''}`}
            >
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN?.haberler}
              className={`sidebar-link ${isActive(ADMIN?.haberler) ? 'active' : ''}`}
            >
              <span className="icon">📰</span>
              Duyurular
              <span className="badge-count">{announcements.length}</span>
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN?.haberlerYeni}
              className={`sidebar-link ${isActive(ADMIN?.haberlerYeni) ? 'active' : ''}`}
            >
              <span className="icon">✏️</span>
              Yeni Duyuru
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN?.galeri}
              className={`sidebar-link ${isActive(ADMIN?.galeri) ? 'active' : ''}`}
            >
              <span className="icon">🖼️</span>
              Galeri Yönetimi
            </Link>
          </li>
        </ul>
      </nav>

      <p className="sidebar-section-title">Lig</p>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link
              to={ADMIN?.lig}
              className={`sidebar-link ${isActive(ADMIN?.lig) ? 'active' : ''}`}
            >
              <span className="icon">🏆</span>
              Lig Yönetimi
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN?.ligMacGir}
              className={`sidebar-link ${isActive(ADMIN?.ligMacGir) ? 'active' : ''}`}
            >
              <span className="icon">⚽</span>
              Maç Sonucu Gir
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN?.ligTakimlar}
              className={`sidebar-link ${isActive(ADMIN?.ligTakimlar) ? 'active' : ''}`}
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

      <p className="sidebar-section-title">Sistem</p>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link
              to={ADMIN?.ayarlar}
              className={`sidebar-link ${isActive(ADMIN?.ayarlar) ? 'active' : ''}`}
            >
              <span className="icon">⚙️</span>
              Hesap Ayarları
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.5rem', borderRadius: '8px' }}
          title="Mevcut Kullanıcı"
        >
          <div className="admin-avatar">{userInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    adminGetAnnouncements().then(({ data }) => setAnnouncements(data || []))
  }, [])

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="admin-layout">
      {/* Topbar */}
      <div className="admin-topbar">
        <span className="admin-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="admin-topbar-menu-btn" 
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>
          <img src="/logo.png" alt="Ergani Yıldız Spor Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <span className="hidden-on-mobile">Ergani Yıldız Spor — Yönetim Paneli</span>
        </span>
        <Link to={ADMIN?.haberlerYeni} className="btn btn-primary btn-sm">
          + Yeni Duyuru
        </Link>
      </div>

      <div className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <AdminSidebar announcements={announcements} isOpen={isSidebarOpen} />

      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
