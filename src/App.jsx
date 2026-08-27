import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './hooks/useAuth'
import { recordVisit } from './lib/api'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import PublicGallery from './pages/PublicGallery'
import Contact from './pages/Contact'
import LeagueStandings from './pages/LeagueStandings'

// Admin Pages
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AnnouncementList from './pages/admin/AnnouncementList'
import AnnouncementForm from './pages/admin/AnnouncementForm'
import LeaguePanel from './pages/admin/LeaguePanel'
import LeagueMatchForm from './pages/admin/LeagueMatchForm'
import LeagueTeams from './pages/admin/LeagueTeams'
import Gallery from './pages/admin/Gallery'

import './styles/globals.css'
import './styles/components.css'
import './styles/admin.css'
import './styles/pages.css'
import './styles/slider.css'
import './styles/home.css'

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="public-main">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  useEffect(() => {
    // Sadece bu oturumda (sekmede) ilk açılışta say
    if (!sessionStorage.getItem('eys_visited')) {
      recordVisit().catch(console.error)
      sessionStorage.setItem('eys_visited', 'true')
    }
  }, [])

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/panel"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/haberler"
              element={
                <ProtectedRoute>
                  <AnnouncementList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/haberler/yeni"
              element={
                <ProtectedRoute>
                  <AnnouncementForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/haberler/:id"
              element={
                <ProtectedRoute>
                  <AnnouncementForm />
                </ProtectedRoute>
              }
            />

            {/* League Admin Routes */}
            <Route
              path="/admin/panel/lig"
              element={
                <ProtectedRoute>
                  <LeaguePanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/lig/mac-gir"
              element={
                <ProtectedRoute>
                  <LeagueMatchForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/lig/mac-gir/:id"
              element={
                <ProtectedRoute>
                  <LeagueMatchForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/lig/takimlar"
              element={
                <ProtectedRoute>
                  <LeagueTeams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/panel/galeri"
              element={
                <ProtectedRoute>
                  <Gallery />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout><Home /></PublicLayout>
            } />
            <Route path="/hakkinda" element={
              <PublicLayout><About /></PublicLayout>
            } />
            <Route path="/haberler" element={
              <PublicLayout><News /></PublicLayout>
            } />
            <Route path="/haberler/:slug" element={
              <PublicLayout><NewsDetail /></PublicLayout>
            } />
            <Route path="/galeri" element={
              <PublicLayout><PublicGallery /></PublicLayout>
            } />
            <Route path="/iletisim" element={
              <PublicLayout><Contact /></PublicLayout>
            } />
            <Route path="/lig-puan-durumu" element={
              <PublicLayout><LeagueStandings /></PublicLayout>
            } />

            {/* 404 */}
            <Route path="*" element={
              <PublicLayout>
                <div className="container text-center" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚽</div>
                  <h1 className="heading-lg">404 — Sayfa Bulunamadı</h1>
                  <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
                    Aradığınız sayfa mevcut değil.
                  </p>
                  <a href="/" className="btn btn-primary">Ana Sayfaya Dön</a>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}

