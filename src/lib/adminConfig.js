/**
 * Admin Panel Yol Yapılandırması
 * ─────────────────────────────
 * Admin panelinin URL endpoint'i VITE_ADMIN_PATH environment variable'ından gelir.
 * Bu sayede kaynak kodda (GitHub'da) admin yolu görünmez.
 *
 * .env.local dosyanıza şunu ekleyin:
 *   VITE_ADMIN_PATH=/kendi-gizli-yolunuz
 *
 * VITE_ADMIN_PATH tanımlı değilse admin paneli tamamen erişilemez hale gelir.
 */

const _base = import.meta.env.VITE_ADMIN_PATH || null

/**
 * Admin paneli aktif mi?
 * VITE_ADMIN_PATH yoksa route'lar hiç register edilmez → 404
 */
export const ADMIN_ENABLED = Boolean(_base)

/**
 * Tüm admin route path'leri — tek doğruluk kaynağı.
 * App.jsx, AdminLayout, ve tüm admin sayfalarda buradan import edin.
 */
export const ADMIN = _base
  ? {
      // Login sayfası (base endpoint)
      base: _base,

      // Alt sayfalar
      panel:             `${_base}/panel`,
      haberler:          `${_base}/panel/haberler`,
      haberlerYeni:      `${_base}/panel/haberler/yeni`,
      haberlerEditRoute: `${_base}/panel/haberler/:id`,
      haberlerEdit:      (id) => `${_base}/panel/haberler/${id}`,
      lig:               `${_base}/panel/lig`,
      ligMacGir:         `${_base}/panel/lig/mac-gir`,
      ligMacGirRoute:    `${_base}/panel/lig/mac-gir`,
      ligMacEditRoute:   `${_base}/panel/lig/mac-gir/:id`,
      ligMacEdit:        (id) => `${_base}/panel/lig/mac-gir/${id}`,
      ligTakimlar:       `${_base}/panel/lig/takimlar`,
      galeri:            `${_base}/panel/galeri`,
      ayarlar:           `${_base}/panel/ayarlar`,
    }
  : null
