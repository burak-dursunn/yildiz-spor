import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/mockStorage'

const AuthContext = createContext(null)

const USE_MOCK = !isSupabaseConfigured()

// Mock kimlik bilgileri .env.local'den okunur — kaynak kodda hardcode edilmez.
// Supabase aktifken bu değerler hiç kullanılmaz.
const MOCK_SESSION_KEY     = 'eys_s'          // kasıtlı kısa/belirsiz anahtar
const MOCK_SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 saat
const INACTIVITY_TIMEOUT   = 60 * 60 * 1000     // 1 saat hareketsizlik

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

      // Mock modda da inactivity timeout çalışsın
      const checkMockTimeout = () => {
        const lastActivity = sessionStorage.getItem('eys_la_ts')
        if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_TIMEOUT) {
          sessionStorage.removeItem(MOCK_SESSION_KEY)
          setUser(null)
        }
        sessionStorage.setItem('eys_la_ts', Date.now().toString())
      }

      checkMockTimeout()
      const interval = setInterval(checkMockTimeout, 60 * 1000)

      const updateActivity = () => sessionStorage.setItem('eys_la_ts', Date.now().toString())
      window.addEventListener('mousemove', updateActivity, { passive: true })
      window.addEventListener('keydown', updateActivity, { passive: true })
      window.addEventListener('click', updateActivity, { passive: true })

      return () => {
        clearInterval(interval)
        window.removeEventListener('mousemove', updateActivity)
        window.removeEventListener('keydown', updateActivity)
        window.removeEventListener('click', updateActivity)
      }
    }

    // ── Supabase modu ──────────────────────────────────────────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    const checkTimeout = () => {
      const lastActivity = sessionStorage.getItem('eys_la_ts')
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_TIMEOUT) {
        supabase.auth.signOut()
      }
      sessionStorage.setItem('eys_la_ts', Date.now().toString())
    }

    checkTimeout()
    const interval = setInterval(checkTimeout, 60 * 1000)

    const updateActivity = () => sessionStorage.setItem('eys_la_ts', Date.now().toString())
    window.addEventListener('mousemove', updateActivity, { passive: true })
    window.addEventListener('keydown', updateActivity, { passive: true })
    window.addEventListener('click', updateActivity, { passive: true })
    window.addEventListener('scroll', updateActivity, { passive: true })

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
      // Kimlik bilgileri env'den okunur — kaynak kodda yoktur
      const validEmail = import.meta.env.VITE_MOCK_ADMIN_EMAIL
      const validPass  = import.meta.env.VITE_MOCK_ADMIN_PASS

      // Env tanımlı değilse mock moda izin verme
      if (!validEmail || !validPass) {
        return { data: null, error: { message: 'Sistem yapılandırması eksik. Lütfen yöneticiyle iletişime geçin.' } }
      }

      if (email === validEmail && password === validPass) {
        const mockUser = { id: 'mock-admin', email, role: 'admin' }
        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser, timestamp: Date.now() }))
        sessionStorage.setItem('eys_la_ts', Date.now().toString())
        setUser(mockUser)
        return { data: mockUser, error: null }
      }

      return { data: null, error: { message: 'Hatalı kimlik bilgileri.' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) sessionStorage.setItem('eys_la_ts', Date.now().toString())
    return { data, error }
  }

  const signOut = async () => {
    if (USE_MOCK) {
      sessionStorage.removeItem(MOCK_SESSION_KEY)
      sessionStorage.removeItem('eys_la_ts')
      setUser(null)
      return
    }
    sessionStorage.removeItem('eys_la_ts')
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
