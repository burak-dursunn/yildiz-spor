import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env değişkenleri eksik. .env.local dosyasını kontrol edin.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
)

// Haber türleri
export const ANNOUNCEMENT_TYPES = {
  'mac-sonucu': { label: 'Maç Sonucu', color: '#ef4444', emoji: '⚽' },
  'mac-duyurusu': { label: 'Maç Duyurusu', color: '#f59e0b', emoji: '📣' },
  'antrenman': { label: 'Antrenmandan Kareler', color: '#10b981', emoji: '🏃' },
  'genel': { label: 'Genel Duyuru', color: '#3b82f6', emoji: '📢' },
  'kulup-haberleri': { label: 'Kulüp Haberleri', color: '#8b5cf6', emoji: '🏆' },
}

// Storage bucket adı
export const STORAGE_BUCKET = 'announcement-images'

// Public URL helper
export const getPublicUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
