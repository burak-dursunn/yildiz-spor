/**
 * Local Mock Storage — Supabase olmadan duyuru test etmek için
 * Tüm veriler localStorage'da saklanır
 */

const STORAGE_KEY = 'eys_announcements'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + generateId().slice(0, 6)
}

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function mockGetAnnouncements() {
  const items = loadAll().filter(a => a.published)
  return {
    data: items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    error: null,
  }
}

export function mockAdminGetAnnouncements() {
  const items = loadAll()
  return {
    data: items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    error: null,
  }
}

export function mockGetAnnouncement(idOrSlug) {
  const items = loadAll()
  const item = items.find(a => a.id === idOrSlug || a.slug === idOrSlug)
  return { data: item || null, error: item ? null : { message: 'Bulunamadı' } }
}

export function mockCreateAnnouncement(payload) {
  const items = loadAll()
  const now = new Date().toISOString()
  const item = {
    ...payload,
    id: generateId(),
    slug: generateSlug(payload.title),
    created_at: now,
    updated_at: now,
    announcement_gallery: [],
  }
  items.unshift(item)
  saveAll(items)
  return { data: item, error: null }
}

export function mockUpdateAnnouncement(id, payload) {
  const items = loadAll()
  const idx = items.findIndex(a => a.id === id)
  if (idx === -1) return { data: null, error: { message: 'Bulunamadı' } }
  items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
  saveAll(items)
  return { data: items[idx], error: null }
}

export function mockDeleteAnnouncement(id) {
  const items = loadAll()
  saveAll(items.filter(a => a.id !== id))
  return { data: null, error: null }
}

export function mockUploadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      // Data URL'yi path olarak saklıyoruz (local test için)
      const path = 'local::' + generateId()
      // Gerçek URL olarak data URL kullanıyoruz
      const publicUrl = dataUrl
      resolve({ data: { path, publicUrl }, error: null })
    }
    reader.onerror = () => resolve({ data: null, error: { message: 'Dosya okunamadı' } })
    reader.readAsDataURL(file)
  })
}

export function mockAddGalleryImage(announcementId, imageUrl, caption, order) {
  const items = loadAll()
  const idx = items.findIndex(a => a.id === announcementId)
  if (idx === -1) return { data: null, error: { message: 'Bulunamadı' } }
  const galleryItem = {
    id: generateId(),
    announcement_id: announcementId,
    image_url: imageUrl,
    caption: caption || '',
    order_index: order || 0,
    created_at: new Date().toISOString(),
  }
  items[idx].announcement_gallery = [...(items[idx].announcement_gallery || []), galleryItem]
  saveAll(items)
  return { data: galleryItem, error: null }
}

export function mockDeleteGalleryImage(galleryId) {
  const items = loadAll()
  items.forEach(a => {
    a.announcement_gallery = (a.announcement_gallery || []).filter(g => g.id !== galleryId)
  })
  saveAll(items)
  return { data: null, error: null }
}

function mockGetPublicUrl(path) {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return path
}

// Supabase bağlantısı var mı kontrol et
export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  return url.includes('.supabase.co') && !url.includes('YOUR_PROJECT')
}

// ============================================================
// LİG MOCK STORAGE — Supabase olmadan lig verilerini test et
// Tüm veriler localStorage'da saklanır
// ============================================================

const TEAMS_KEY   = 'eys_teams'
const MATCHES_KEY = 'eys_matches'

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(TEAMS_KEY) || '[]') } catch { return [] }
}
function saveTeams(items) { localStorage.setItem(TEAMS_KEY, JSON.stringify(items)) }

function loadMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]') } catch { return [] }
}
function saveMatches(items) { localStorage.setItem(MATCHES_KEY, JSON.stringify(items)) }

// ─── TEAMS ───────────────────────────────────────────────────

export function mockGetTeams() {
  const items = loadTeams().sort((a, b) => a.order_index - b.order_index || a.name.localeCompare(b.name))
  return { data: items, error: null }
}

export function mockCreateTeam(payload) {
  const items = loadTeams()
  const item = {
    id: generateId(),
    name: payload.name,
    short_name: payload.short_name,
    logo_url: payload.logo_url || null,
    is_our_team: payload.is_our_team || false,
    order_index: payload.order_index ?? items.length,
    created_at: new Date().toISOString(),
  }
  items.push(item)
  saveTeams(items)
  return { data: item, error: null }
}

export function mockUpdateTeam(id, payload) {
  const items = loadTeams()
  const idx = items.findIndex(t => t.id === id)
  if (idx === -1) return { data: null, error: { message: 'Takım bulunamadı' } }
  items[idx] = { ...items[idx], ...payload }
  saveTeams(items)
  return { data: items[idx], error: null }
}

export function mockDeleteTeam(id) {
  // Maçı olan takım silinemez
  const matches = loadMatches()
  const hasMatches = matches.some(m => m.home_team_id === id || m.away_team_id === id)
  if (hasMatches) return { data: null, error: { message: 'Bu takımın maçları var, önce maçları silin.' } }
  saveTeams(loadTeams().filter(t => t.id !== id))
  return { data: null, error: null }
}

// ─── MATCHES ─────────────────────────────────────────────────

export function mockGetMatches() {
  const matches  = loadMatches()
  const teams    = loadTeams()
  const teamsMap = Object.fromEntries(teams.map(t => [t.id, t]))
  const enriched = matches
    .map(m => ({
      ...m,
      home_team: teamsMap[m.home_team_id] || null,
      away_team: teamsMap[m.away_team_id] || null,
    }))
    .sort((a, b) => b.week - a.week || new Date(b.created_at) - new Date(a.created_at))
  return { data: enriched, error: null }
}

export function mockCreateMatch(payload) {
  const matches = loadMatches()
  // Çift maç engeli
  const duplicate = matches.find(m =>
    m.week === payload.week &&
    ((m.home_team_id === payload.home_team_id && m.away_team_id === payload.away_team_id) ||
     (m.home_team_id === payload.away_team_id && m.away_team_id === payload.home_team_id))
  )
  if (duplicate) return { data: null, error: { message: 'Bu haftada bu iki takım arasında zaten maç kaydı var.' } }
  if (payload.home_team_id === payload.away_team_id) return { data: null, error: { message: 'Ev sahibi ve misafir takım aynı olamaz.' } }

  const item = {
    id: generateId(),
    home_team_id: payload.home_team_id,
    away_team_id: payload.away_team_id,
    home_goals: payload.home_goals,
    away_goals: payload.away_goals,
    week: payload.week,
    played_at: payload.played_at || new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  }
  matches.push(item)
  saveMatches(matches)
  return { data: item, error: null }
}

export function mockUpdateMatch(id, payload) {
  const matches = loadMatches()
  const idx = matches.findIndex(m => m.id === id)
  if (idx === -1) return { data: null, error: { message: 'Maç bulunamadı' } }
  matches[idx] = { ...matches[idx], ...payload }
  saveMatches(matches)
  return { data: matches[idx], error: null }
}

export function mockDeleteMatch(id) {
  saveMatches(loadMatches().filter(m => m.id !== id))
  return { data: null, error: null }
}

// ─── STANDINGS VIEW (mock hesaplama) ─────────────────────────
// Supabase'deki standings_view'ın JavaScript karşılığı.
// Aynı mantıkla puan/averaj/sıralama hesaplar.

export function mockGetStandings() {
  const teams   = loadTeams()
  const matches = loadMatches()

  // Her takım için istatistik başlat
  const stats = {}
  teams.forEach(t => {
    stats[t.id] = { played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 }
  })

  // Maçları işle — her maç iki takımı etkiler
  matches.forEach(m => {
    const { home_team_id, away_team_id, home_goals, away_goals } = m
    if (!stats[home_team_id] || !stats[away_team_id]) return

    stats[home_team_id].played++
    stats[away_team_id].played++
    stats[home_team_id].goals_for      += home_goals
    stats[home_team_id].goals_against  += away_goals
    stats[away_team_id].goals_for      += away_goals
    stats[away_team_id].goals_against  += home_goals

    if (home_goals > away_goals) {
      stats[home_team_id].wins++   ; stats[home_team_id].points += 3
      stats[away_team_id].losses++
    } else if (home_goals === away_goals) {
      stats[home_team_id].draws++  ; stats[home_team_id].points += 1
      stats[away_team_id].draws++  ; stats[away_team_id].points += 1
    } else {
      stats[away_team_id].wins++   ; stats[away_team_id].points += 3
      stats[home_team_id].losses++
    }
  })

  // Sırala ve döndür
  const standings = teams.map(t => ({
    team_id:       t.id,
    name:          t.name,
    short_name:    t.short_name,
    logo_url:      t.logo_url,
    is_our_team:   t.is_our_team,
    ...stats[t.id],
    goal_diff: stats[t.id].goals_for - stats[t.id].goals_against,
  }))
  .sort((a, b) =>
    b.points - a.points ||
    b.goal_diff - a.goal_diff ||
    b.goals_for - a.goals_for ||
    a.name.localeCompare(b.name)
  )
  .map((s, i) => ({ ...s, position: i + 1 }))

  return { data: standings, error: null }
}

// ============================================================
// VISITS TRACKING MOCK
// ============================================================
const VISITS_KEY = 'eys_visits'

function loadVisits() {
  try { return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]') } catch { return [] }
}
function saveVisits(items) { localStorage.setItem(VISITS_KEY, JSON.stringify(items)) }

export async function mockRecordVisit() {
  const visits = loadVisits()
  const today = new Date().toISOString().slice(0, 10)
  
  let ipAddress = 'unknown'
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipRes.json()
    ipAddress = ipData.ip
  } catch (err) {}

  // Bugün bu IP ile zaten ziyaret edildiyse kaydetme (Mock davranışı)
  const hasVisited = visits.some(v => v.date === today && v.ip_address === ipAddress && ipAddress !== 'unknown')
  
  if (!hasVisited) {
    visits.push({ date: today, timestamp: Date.now(), ip_address: ipAddress })
    saveVisits(visits)
  }
  
  return { data: null, error: null }
}

export function mockGetVisitStats() {
  const visits = loadVisits()
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  
  const getUniqueCountByDay = (views) => {
    const uniqueVisits = new Set()
    let unknownCount = 0
    views.forEach(v => {
      if (v.ip_address && v.ip_address !== 'unknown') {
        uniqueVisits.add(`${v.date}-${v.ip_address}`)
      } else {
        unknownCount++
      }
    })
    return uniqueVisits.size + unknownCount
  }
  
  // Bugünü hesapla
  const todayViews = visits.filter(v => v.date === todayStr)
  const todayVisits = getUniqueCountByDay(todayViews)
  
  // Bu haftayı hesapla (son 7 gün)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weeklyViews = visits.filter(v => new Date(v.timestamp) >= oneWeekAgo)
  const weeklyVisits = getUniqueCountByDay(weeklyViews)
  
  const totalVisits = getUniqueCountByDay(visits)
  
  return {
    data: { today: todayVisits, weekly: weeklyVisits, total: totalVisits },
    error: null
  }
}
