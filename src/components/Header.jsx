import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'


export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const navItems = [
    { to: '/', label: 'Ana Sayfa' },
    { to: '/hakkinda', label: 'Kulüp' },
    { to: '/haberler', label: 'Haberler' },
    { to: '/galeri', label: 'Galeri' },
    { to: '/lig-puan-durumu', label: 'Puan Durumu' },
    { to: '/iletisim', label: 'İletişim' },
  ]

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="Ergani Yıldız Spor Logo" className="logo-emblem" style={{ height: '70px', width: 'auto' }} />
            <div className="logo-text">
              <span className="club-name">ERGANİ YILDIZ SPOR</span>
              <span className="club-sub">FUTBOL KULÜBÜ</span>
            </div>
          </Link>

          <nav>
            <ul className="nav-links">
              {navItems.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menüyü aç/kapat"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
