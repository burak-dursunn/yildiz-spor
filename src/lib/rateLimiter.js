/**
 * Client-Side Rate Limiter — Brute-force saldırı önleme
 * ───────────────────────────────────────────────────────
 * NOT: Bu önlem botu yavaşlatır, ancak tek başına tam koruma sağlamaz.
 * Gerçek güvenlik için Supabase'in kendi auth sistemi (MFA, email verify)
 * birincil savunma katmanıdır.
 */

const STORAGE_KEY = 'eys_la' // kasıtlı kısa/belirsiz anahtar
const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 15 * 60 * 1000 // 15 dakika

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { count: 0, lockedUntil: null }
  } catch {
    return { count: 0, lockedUntil: null }
  }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

/**
 * Mevcut kısıtlama durumunu döndür
 * @returns {{ locked: boolean, remainingMs: number, attempts: number }}
 */
export function getLockoutStatus() {
  const data = load()
  if (data.lockedUntil) {
    const remaining = data.lockedUntil - Date.now()
    if (remaining > 0) {
      return { locked: true, remainingMs: remaining, attempts: data.count }
    }
    // Lockout süresi doldu — sıfırla
    save({ count: 0, lockedUntil: null })
    return { locked: false, remainingMs: 0, attempts: 0 }
  }
  return { locked: false, remainingMs: 0, attempts: data.count }
}

/**
 * Başarısız giriş denemesini kaydet
 * @returns {{ locked: boolean, remainingMs: number, attempts: number }}
 */
export function recordFailedAttempt() {
  const data = load()
  data.count += 1

  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS
  }

  save(data)
  return getLockoutStatus()
}

/**
 * Başarılı girişte sayacı sıfırla
 */
export function resetAttempts() {
  save({ count: 0, lockedUntil: null })
}

/**
 * Deneme sayısına göre bekleme süresi (ms) — progressive delay
 * Kaba-kuvvet saldırısını yavaşlatmak için her hatada artan gecikme.
 */
export function getDelay(attempts) {
  const delays = [0, 500, 1000, 2000, 3000, 4000]
  return delays[Math.min(attempts, delays.length - 1)]
}
