import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/mockStorage'

const AuthContext = createContext(null)

const USE_MOCK = !isSupabaseConfigured()

// Mock auth: localStorage tabanlı basit oturum
const MOCK_ADMIN_EMAIL = 'admin@erganiyildizspor.com'
const MOCK_ADMIN_PASS  = 'admin1234'
const MOCK_SESSION_KEY = 'eys_admin_session'

function getMockUser() {
  try {
    return JSON.parse(sessionStorage.getItem(MOCK_SESSION_KEY) || 'null')
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
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (USE_MOCK) {
      if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASS) {
        const mockUser = { id: 'mock-admin', email, role: 'admin' }
        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser))
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
