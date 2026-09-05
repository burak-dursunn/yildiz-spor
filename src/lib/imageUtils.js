/**
 * imageUtils.js — Resim Optimizasyon Yardımcıları
 *
 * Bu dosya iki temel görevi üstlenir:
 *
 * 1. convertToWebP(file, options)
 *    Admin panelinde bir resim yüklenmeden ÖNCE çağrılır.
 *    Tarayıcının Canvas API'sini kullanarak JPG/PNG → WebP dönüşümü yapar.
 *    Sunucu gerektirmez, ek maliyet yoktur, her Supabase planında çalışır.
 *
 * 2. preloadImage(url) / preloadGalleryImages(images, currentIndex)
 *    GallerySlider'da aktif fotoğraf gösterilirken,
 *    bir sonraki fotoğrafı arka planda sessizce indirir.
 *    Kullanıcı "ileri" tıkladığında resim zaten tarayıcı önbelleğinde (cache) hazırdır.
 */

/**
 * Tarayıcıda bir resim dosyasını WebP formatına çevirir.
 *
 * @param {File} file - Kullanıcının seçtiği orijinal dosya (JPG, PNG, vs.)
 * @param {object} options
 * @param {number} options.quality    - WebP sıkıştırma kalitesi (0-1 arası). Default: 0.82
 * @param {number} options.maxWidth   - Maksimum genişlik (piksel). Büyük resimler bu değere ölçeklenir. Default: 1920
 * @param {number} options.maxHeight  - Maksimum yükseklik (piksel). Default: 1080
 * @returns {Promise<File>} - WebP formatında yeni bir File nesnesi
 *
 * Nasıl çalışır?
 * 1. Tarayıcıda görünmez bir <img> elementi oluşturulur, dosya ona yüklenir
 * 2. Görünmez bir <canvas> (tuval) oluşturulur
 * 3. Resim canvas üzerine çizilir (gerekirse ölçeklenerek)
 * 4. Canvas'tan WebP formatında Blob üretilir
 * 5. Bu Blob'dan yeni bir File nesnesi oluşturulur ve döndürülür
 */
export async function convertToWebP(file, { quality = 0.82, maxWidth = 1920, maxHeight = 1080 } = {}) {
  // Eğer zaten WebP ise dönüştürme, olduğu gibi döndür
  if (file.type === 'image/webp') return file

  // GIF animasyonlarını desteklemek mümkün olmadığından olduğu gibi bırak
  if (file.type === 'image/gif') return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl) // Bellek temizliği

      // Ölçekleme hesabı:
      // Resim maxWidth veya maxHeight'tan büyükse orantılı küçült
      let { width, height } = img
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = Math.round(width / aspectRatio)
      }
      if (height > maxHeight) {
        height = maxHeight
        width = Math.round(height * aspectRatio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      // Yüksek kaliteli görüntü işleme
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Canvas WebP üretemezse orijinal dosyayı kullan
            console.warn('[imageUtils] WebP dönüşümü başarısız, orijinal dosya kullanılıyor.')
            resolve(file)
            return
          }

          // Yeni dosya adını .webp uzantısıyla oluştur
          const originalName = file.name.replace(/\.[^.]+$/, '') // uzantıyı at
          const webpFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          })

          resolve(webpFile)
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Resim yüklenemezse orijinal dosyayı kullan
      console.warn('[imageUtils] Resim yüklenemedi, orijinal dosya kullanılıyor.')
      resolve(file)
    }

    img.src = objectUrl
  })
}

/**
 * Bir resim URL'ini tarayıcı önbelleğine önceden yükler.
 * DOM'a hiçbir şey eklenmez; sadece tarayıcı cache'ini doldurur.
 * Bir sonraki gösterimde anında görünür.
 *
 * @param {string} url - Önceden yüklenecek resmin URL'i
 * @returns {Promise<void>}
 */
export function preloadImage(url) {
  if (!url) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve // Hata olsa bile devam et
    img.src = url
  })
}

/**
 * Galeri slider'ı için akıllı preload stratejisi.
 * Aktif resmin bir sonrakini (ve öncekini) önceden yükler.
 * Döngüsel yapıyı destekler (son resimden sonra ilk resme geçer).
 *
 * @param {Array}  images       - Galeri resimlerinin dizisi ({ image_url, ... })
 * @param {number} currentIndex - Şu an gösterilen resmin index'i
 */
export function preloadGalleryImages(images, currentIndex) {
  if (!images || images.length <= 1) return

  const nextIndex = (currentIndex + 1) % images.length
  const prevIndex = (currentIndex - 1 + images.length) % images.length

  // Bir sonraki ve bir önceki resmi arka planda sessizce indir
  preloadImage(images[nextIndex]?.image_url)
  preloadImage(images[prevIndex]?.image_url)
}
