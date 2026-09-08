import { supabase, getPublicUrl, STORAGE_BUCKET } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { convertToWebP } from './imageUtils'
import {
  isSupabaseConfigured,
  mockGetAnnouncements,
  mockAdminGetAnnouncements,
  mockGetAnnouncement,
  mockCreateAnnouncement,
  mockUpdateAnnouncement,
  mockDeleteAnnouncement,
  mockUploadImage,
  mockAddGalleryImage,
  mockDeleteGalleryImage,
} from './mockStorage'

const USE_MOCK = !isSupabaseConfigured()

if (USE_MOCK) {
  console.info('[EYS] Supabase bağlantısı yok — Local mock modu aktif. Veriler localStorage\'da saklanır.')
}

// Slug oluşturma (Türkçe karakter desteği)
function createSlug(text) {
  const trMap = { ç:'c', ğ:'g', ı:'i', ö:'o', ş:'s', ü:'u', Ç:'c', Ğ:'g', İ:'i', Ö:'o', Ş:'s', Ü:'u' }
  return text
    .replace(/[çğışöüÇĞİŞÖÜ]/g, c => trMap[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Tüm duyuruları getir (public)
export async function getAnnouncements({ type, limit = 20, offset = 0 } = {}) {
  if (USE_MOCK) {
    const { data, error } = mockGetAnnouncements()
    let filtered = data || []
    if (type && type !== 'all') filtered = filtered.filter(a => a.type === type)
    return { data: filtered.slice(offset, offset + limit), error, count: filtered.length }
  }

  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query
  return { data, error, count }
}

// Tek duyuru getir (slug ile)
export async function getAnnouncementBySlug(slug) {
  if (USE_MOCK) {
    const { data, error } = mockGetAnnouncement(slug)
    return { data, error }
  }

  const { data, error } = await supabase
    .from('announcements')
    .select(`*, announcement_gallery (id, image_url, caption, order_index)`)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  return { data, error }
}

// Admin: tüm duyuruları getir
export async function adminGetAnnouncements() {
  if (USE_MOCK) return mockAdminGetAnnouncements()

  const { data, error } = await supabase
    .from('announcements')
    .select(`*, announcement_gallery (count)`)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Admin: tek duyuru getir (id ile)
export async function adminGetAnnouncement(id) {
  if (USE_MOCK) return mockGetAnnouncement(id)

  const { data, error } = await supabase
    .from('announcements')
    .select(`*, announcement_gallery (id, image_url, caption, order_index)`)
    .eq('id', id)
    .single()

  return { data, error }
}

// Görsel yükleme — WebP'ye çevirerek yükle
export async function uploadImage(file) {
  if (USE_MOCK) return mockUploadImage(file)

  // Upload öncesi WebP dönüşümü (tarayıcıda, sıfır maliyet)
  // Başarısız olursa orijinal dosyayı kullanır
  const optimizedFile = await convertToWebP(file)

  const fileName = `${uuidv4()}.webp`
  const filePath = `${new Date().getFullYear()}/${fileName}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, optimizedFile, {
      cacheControl: '31536000', // 1 yıl cache — WebP sabit, değişmez
      upsert: false,
      contentType: 'image/webp',
    })

  if (error) return { data: null, error }
  return { data: { path: data.path, publicUrl: getPublicUrl(data.path) }, error: null }
}

// Görsel silme
export async function deleteImage(path) {
  if (USE_MOCK) return { error: null }
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  return { error }
}

// Duyuru oluştur
export async function createAnnouncement(formData) {
  if (USE_MOCK) return mockCreateAnnouncement(formData)

  const slug = createSlug(formData.title) + '-' + Date.now().toString(36)
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: formData.title,
      slug,
      content: formData.content,
      type: formData.type,
      cover_image: formData.cover_image || null,
      published: formData.published ?? true,
    })
    .select()
    .single()

  return { data, error }
}

// Duyuru güncelle
export async function updateAnnouncement(id, formData) {
  if (USE_MOCK) return mockUpdateAnnouncement(id, formData)

  const { data, error } = await supabase
    .from('announcements')
    .update({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      cover_image: formData.cover_image,
      published: formData.published,
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// URL'den storage path'ini çıkarma yardımcı fonksiyonu (örn: https://.../public/announcement-images/2026/resim.webp -> 2026/resim.webp)
export function extractPathFromUrl(url) {
  if (!url) return null
  const parts = url.split(`${STORAGE_BUCKET}/`)
  return parts.length > 1 ? parts[1] : null
}

// Duyuru sil
export async function deleteAnnouncement(id) {
  if (USE_MOCK) return mockDeleteAnnouncement(id)

  try {
    // 1. Önce silinecek duyuruyu ve ana resmini al
    const { data: announcement } = await supabase
      .from('announcements')
      .select('cover_image')
      .eq('id', id)
      .single()

    // 2. Bu duyuruya ait tüm galeri resimlerini al
    const { data: galleryItems } = await supabase
      .from('announcement_gallery')
      .select('image_url')
      .eq('announcement_id', id)

    // 3. Tüm URL'leri topla ve Storage yoluna (path) dönüştür
    const pathsToDelete = []
    
    if (announcement?.cover_image) {
      const path = extractPathFromUrl(announcement.cover_image)
      if (path) pathsToDelete.push(path)
    }

    if (galleryItems && galleryItems.length > 0) {
      galleryItems.forEach(item => {
        const path = extractPathFromUrl(item.image_url)
        if (path) pathsToDelete.push(path)
      })
    }

    // 4. Storage'dan (Storage Bucket) dosyaları sil
    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(pathsToDelete)
        
      if (storageError) console.error('Resimler storage alanından silinirken hata oluştu:', storageError)
    }

    // 5. En son veritabanından (Database) duyuruyu sil
    // (Galeri verileri veritabanında cascade ayarlıdır, o yüzden otomatik silinecektir)
    const { error: dbError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    return { error: dbError }
  } catch (error) {
    console.error('Silme işlemi hatası:', error)
    return { error }
  }
}

// Galeri fotoğrafı ekle
export async function addGalleryImage(announcementId, imageUrl, caption = '', orderIndex = 0) {
  if (USE_MOCK) return mockAddGalleryImage(announcementId, imageUrl, caption, orderIndex)

  const { data, error } = await supabase
    .from('announcement_gallery')
    .insert({ announcement_id: announcementId, image_url: imageUrl, caption, order_index: orderIndex })
    .select()
    .single()

  return { data, error }
}

// Galeri fotoğrafı sil
export async function deleteGalleryImage(id) {
  if (USE_MOCK) return mockDeleteGalleryImage(id)
  const { error } = await supabase.from('announcement_gallery').delete().eq('id', id)
  return { error }
}

// Son N duyuruyu getir (Ana sayfa için)
export async function getLatestAnnouncements(limit = 3) {
  if (USE_MOCK) {
    const { data } = mockGetAnnouncements()
    return { data: (data || []).slice(0, limit), error: null }
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, slug, type, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}



// ============================================================
// LİG API — Supabase veya Mock Storage
// ============================================================

import {
  mockGetTeams,
  mockCreateTeam,
  mockUpdateTeam,
  mockDeleteTeam,
  mockGetMatches,
  mockCreateMatch,
  mockUpdateMatch,
  mockDeleteMatch,
  mockGetStandings,
  mockRecordVisit,
  mockGetVisitStats,
} from './mockStorage'

// ─── TEAMS ───────────────────────────────────────────────────

/** Tüm takımları getir (public + admin) */
export async function getTeams() {
  if (USE_MOCK) return mockGetTeams()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('order_index', { ascending: true })
    .order('name', { ascending: true })
  return { data, error }
}

/** Takım oluştur */
export async function createTeam(payload) {
  if (USE_MOCK) return mockCreateTeam(payload)
  const { data, error } = await supabase
    .from('teams')
    .insert(payload)
    .select()
    .single()
  return { data, error }
}

/** Takım güncelle */
export async function updateTeam(id, payload) {
  if (USE_MOCK) return mockUpdateTeam(id, payload)
  const { data, error } = await supabase
    .from('teams')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

/** Takım sil */
export async function deleteTeam(id) {
  if (USE_MOCK) return mockDeleteTeam(id)
  const { error } = await supabase.from('teams').delete().eq('id', id)
  return { error }
}

// ─── MATCHES ─────────────────────────────────────────────────

/** Tüm maçları getir (takım bilgileriyle birlikte) */
export async function getMatches() {
  if (USE_MOCK) return mockGetMatches()
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(id, name, short_name, logo_url, is_our_team),
      away_team:teams!away_team_id(id, name, short_name, logo_url, is_our_team)
    `)
    .order('week', { ascending: false })
    .order('played_at', { ascending: false })
  return { data, error }
}

/** Tek maç getir */
export async function getMatch(id) {
  if (USE_MOCK) {
    const { data } = mockGetMatches()
    const item = (data || []).find(m => m.id === id)
    return { data: item || null, error: item ? null : { message: 'Bulunamadı' } }
  }
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(id, name, short_name, logo_url, is_our_team),
      away_team:teams!away_team_id(id, name, short_name, logo_url, is_our_team)
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

/** Maç sonucu kaydet */
export async function createMatch(payload) {
  if (USE_MOCK) return mockCreateMatch(payload)
  const { data, error } = await supabase
    .from('matches')
    .insert({
      home_team_id: payload.home_team_id,
      away_team_id: payload.away_team_id,
      home_goals:   payload.home_goals,
      away_goals:   payload.away_goals,
      week:         payload.week,
      played_at:    payload.played_at,
    })
    .select()
    .single()
  return { data, error }
}

/** Maç güncelle */
export async function updateMatch(id, payload) {
  if (USE_MOCK) return mockUpdateMatch(id, payload)
  const { data, error } = await supabase
    .from('matches')
    .update({
      home_goals: payload.home_goals,
      away_goals: payload.away_goals,
      week:       payload.week,
      played_at:  payload.played_at,
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

/** Maç sil */
export async function deleteMatch(id) {
  if (USE_MOCK) return mockDeleteMatch(id)
  const { error } = await supabase.from('matches').delete().eq('id', id)
  return { error }
}

// ─── STANDINGS ───────────────────────────────────────────────

/**
 * Puan tablosunu getir.
 * Supabase'de standings_view üzerinden hesaplanır.
 * Mock modda JavaScript'te hesaplanır (aynı mantık).
 */
export async function getStandings() {
  if (USE_MOCK) return mockGetStandings()
  const { data, error } = await supabase
    .from('standings_view')
    .select('*')
    .order('position', { ascending: true })
  return { data, error }
}

// ─── VISITS ──────────────────────────────────────────────────

/** Ziyaret kaydet */
export async function recordVisit() {
  if (USE_MOCK) return mockRecordVisit()
  
  // Gerçek Supabase'de tablo eklenecek:
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('page_views')
    .insert({ date: today, path: window.location.pathname })
  return { data, error }
}

/** Ziyaret istatistiklerini getir */
export async function getVisitStats() {
  if (USE_MOCK) return mockGetVisitStats()
  
  // Supabase tarafında özel bir RPC (Remote Procedure Call) veya view ile çözülebilir.
  // Şimdilik basitçe tümünü çekip gruplayacağız. (Performans için DB'de çözülmeli)
  const { data, error } = await supabase.from('page_views').select('date, created_at')
  if (error) return { data: null, error }
  
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const todayVisits = data.filter(v => v.date === todayStr).length
  
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weeklyVisits = data.filter(v => new Date(v.created_at) >= oneWeekAgo).length
  
  return { 
    data: { today: todayVisits, weekly: weeklyVisits, total: data.length },
    error: null 
  }
}

// ==========================================
// Gallery API
// ==========================================

export async function getClubGalleryImages(category = 'u-13') {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('category', category)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function addClubGalleryImage(imageUrl, category = 'u-13') {
  const { data, error } = await supabase
    .from('gallery')
    .insert([{ image_url: imageUrl, category }])
    .select()
    .single()
  
  return { data, error }
}

export async function removeClubGalleryImage(id) {
  if (USE_MOCK) {
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    return { error }
  }

  // 1. Önce silinecek resmin URL'sini al
  const { data: image } = await supabase
    .from('gallery')
    .select('image_url')
    .eq('id', id)
    .single()

  // 2. Eğer URL varsa ve Supabase Storage içindeyse, fiziksel dosyayı da sil
  if (image?.image_url) {
    const path = extractPathFromUrl(image.image_url)
    if (path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path])
    }
  }

  // 3. Veritabanından (gallery tablosundan) kaydı sil
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id)
  
  return { error }
}

export async function updateClubGalleryOrder(id, orderIndex) {
  const { data, error } = await supabase
    .from('gallery')
    .update({ order_index: orderIndex })
    .eq('id', id)
    
  return { data, error }
}

// ==========================================
// Settings API
// ==========================================

export async function getSetting(id, defaultValue = null) {
  if (USE_MOCK) return { data: defaultValue, error: null }
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('id', id)
    .single()
  
  // If not found, return defaultValue
  if (error && error.code === 'PGRST116') {
    return { data: defaultValue, error: null }
  }
  return { data: data ? data.value : defaultValue, error }
}

export async function updateSetting(id, value) {
  if (USE_MOCK) return { data: value, error: null }
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ id, value, updated_at: new Date().toISOString() })
    .select()
    .single()
    
  return { data: data ? data.value : null, error }
}
