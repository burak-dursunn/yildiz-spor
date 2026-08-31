import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ADMIN, ADMIN_ENABLED } from '../lib/adminConfig'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  // Admin paneli env'de tanımlı değilse erişimi tamamen engelle
  if (!ADMIN_ENABLED) {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return <Navigate to={ADMIN.base} replace />
  }

  return children
}
