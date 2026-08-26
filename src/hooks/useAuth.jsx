import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/mockStorage'

const AuthContext = createContext(null)

const USE_MOCK = !isSupabaseConfigured()

// Mock auth: sessionStorage tabanlı basit oturum (Zaman aşımı kontrolü ile)
const MOCK_ADMIN_EMAIL = 'admin@erganiyildizspor.com'
const MOCK_ADMIN_PASS  = 'admin1234'
const MOCK_SESSION_KEY = 'eys_admin_session'
const MOCK_SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 saat

function getMockUser() {
  try {
    const data = JSON.parse(sessionStorage.getItem(MOCK_SESSION_KEY))
    if (!data) return null
    if (Date.now() - data.timestamp > MOCK_SESSION_TIMEOUT) {
      sessionStorage.removeItem(MOCK_SESSION_KEY)
      return null
    }
    return data.user
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      setUser(getMockUser())
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    // Activity Timeout Logic (1 hour)
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000
    
    const checkTimeout = () => {
      const lastActivity = sessionStorage.getItem('admin_last_activity')
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_TIMEOUT) {
        // If inactive for too long, force sign out
        if (USE_MOCK) {
          sessionStorage.removeItem(MOCK_SESSION_KEY)
          setUser(null)
        } else {
          supabase.auth.signOut()
        }
      }
      sessionStorage.setItem('admin_last_activity', Date.now().toString())
    }

    checkTimeout()
    const interval = setInterval(checkTimeout, 60 * 1000) // Check every minute

    const updateActivity = () => {
      sessionStorage.setItem('admin_last_activity', Date.now().toString())
    }

    window.addEventListener('mousemove', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('click', updateActivity)
    window.addEventListener('scroll', updateActivity)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
      window.removeEventListener('mousemove', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
    }
  }, [])

  const signIn = async (email, password) => {
    if (USE_MOCK) {
      if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASS) {
        const mockUser = { id: 'mock-admin', email, role: 'admin' }
        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser, timestamp: Date.now() }))
        setUser(mockUser)
        return { data: mockUser, error: null }
      }
      return { data: null, error: { message: 'Hatalı e-posta veya şifre' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    if (USE_MOCK) {
      sessionStorage.removeItem(MOCK_SESSION_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
