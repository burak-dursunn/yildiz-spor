import { useState, useEffect } from 'react'
import { getClubGalleryImages, uploadImage, addClubGalleryImage, removeClubGalleryImage, updateClubGalleryOrder } from '../../lib/api'
import AdminLayout from './AdminLayout'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [error, setError] = useState(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unsavedChanges])

  async function fetchImages() {
    setLoading(true)
    const { data, error } = await getClubGalleryImages('u-13')
    if (error) {
      setError(error.message)
    } else {
      setImages(data || [])
      setDeletedIds([])
      setUnsavedChanges(false)
    }
    setLoading(false)
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    setError(null)
    
    let newUploads = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`${i + 1} / ${files.length} yükleniyor...`)
      
      // Resimleri hemen buluta yüklüyoruz, ama veritabanına Kaydet'e basınca ekleyeceğiz.
      const { data: uploadData, error: uploadError } = await uploadImage(file)
      
      if (uploadError) {
        setError(`${file.name} yüklenirken hata: ` + uploadError.message)
        continue 
      }

      newUploads.push({
        id: `temp-${Date.now()}-${i}`, // geçici ID
        image_url: uploadData.publicUrl,
        isNew: true
      })
    }
    
    if (newUploads.length > 0) {
      setImages(prev => [...newUploads, ...prev])
      setUnsavedChanges(true)
    }
    
    setUploading(false)
    setUploadProgress(null)
    e.target.value = '' // reset input
  }

  function handleDelete(id) {
    if (!window.confirm('Bu resmi silmek istediğinize emin misiniz?')) return

    setImages(prev => prev.filter(img => img.id !== id))
    
    // Sadece daha önceden veritabanında olanları silinecekler listesine ekle
    if (!String(id).startsWith('temp-')) {
      setDeletedIds(prev => [...prev, id])
    } else {
      // Eğer temp- (henüz DB'ye kaydedilmemiş) ise, bu dosya çoktan Storage'a yüklendi.
      // Boşuna yer kaplamaması için hemen Storage'dan silelim.
      const imageObj = images.find(img => img.id === id)
      if (imageObj && imageObj.image_url) {
        import('../../lib/api').then(({ deleteImage, extractPathFromUrl }) => {
          const path = extractPathFromUrl(imageObj.image_url)
          if (path) {
            deleteImage(path)
          }
        })
      }
    }
    
    setUnsavedChanges(true)
  }

  function moveItem(index, direction) {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const swapIndex = index + direction;
    
    // Local array içinde yer değiştir
    const temp = newImages[index];
    newImages[index] = newImages[swapIndex];
    newImages[swapIndex] = temp;
    
    setImages(newImages);
    setUnsavedChanges(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      // 1. Silinenleri veritabanından sil
      for (const id of deletedIds) {
        const { error: err } = await removeClubGalleryImage(id)
        if (err) throw new Error(`Resim silinirken hata: ${err.message}`)
      }

      // 2. Yeni eklenenleri veritabanına kaydet ve ID'lerini güncelle
      let currentImages = [...images]
      for (let i = 0; i < currentImages.length; i++) {
        let img = currentImages[i]
        if (img.isNew) {
          const { data: newDbImage, error: dbError } = await addClubGalleryImage(img.image_url, 'u-13')
          if (dbError) throw new Error(`Yeni resim kaydedilemedi: ${dbError.message}`)
          
          currentImages[i] = { ...newDbImage } // ID güncellenmiş oldu
        }
      }

      // 3. Tüm resimlerin sıralamasını (order_index) güncelle
      // currentImages artık tamamen gerçek veritabanı ID'lerine sahip
      for (let i = 0; i < currentImages.length; i++) {
        const { error: err } = await updateClubGalleryOrder(currentImages[i].id, i)
        if (err) throw new Error(`Sıralama güncellenirken hata: ${err.message}`)
      }

      // İşlem bitti, state'i sıfırla
      setUnsavedChanges(false)
      setDeletedIds([])
      await fetchImages() // En güncel haliyle yeniden çek
      alert('Tüm değişiklikler başarıyla kaydedildi!')

    } catch (err) {
      setError(err.message || 'Kaydetme sırasında bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!window.confirm('Kaydedilmemiş tüm değişiklikler geri alınacak. Emin misiniz?')) return
    setError(null)
    await fetchImages()
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="heading-lg">Galeri Yönetimi</h1>
          <p style={{ color: 'var(--text-muted)' }}>Fotoğrafları ekleyin, silin veya sıralarını değiştirin.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label className="btn" style={{ cursor: 'pointer', minWidth: '180px', textAlign: 'center', background: '#3b82f6', color: 'white' }}>
            {uploading ? uploadProgress : '+ Fotoğraf Yükle'}
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange} 
              disabled={uploading || saving}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* İpucu - Sarı Arka Planlı */}
      <div style={{
        background: '#fef9c3',
        color: '#854d0e',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #eab308',
        fontWeight: '500'
      }}>
        💡 İpucu: İşlemleriniz bittikten sonra "Değişiklikleri Kaydet" butonuna basmayı unutmayın.
      </div>

      {/* Kaydedilmemiş değişiklikler uyarı çubuğu */}
      {unsavedChanges && (
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: '#fffbeb', 
          border: '1px solid #fef3c7',
          borderLeft: '4px solid #f59e0b',
          color: '#92400e', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div>
            <strong>Kaydedilmemiş değişiklikler var!</strong> 
            <span style={{ marginLeft: '8px' }}>Yaptığınız sıralama, ekleme veya silme işlemlerinin geçerli olması için kaydetmeniz gerekmektedir.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleCancel}
              className="btn" 
              style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none' }}
              disabled={saving}
            >
              İptal Et
            </button>
            <button 
              onClick={handleSave}
              className="btn" 
              style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none' }}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '8px' }}>
          Galeride henüz hiç fotoğraf yok.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {images.map((img, index) => (
            <div key={img.id} style={{ 
              position: 'relative', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              background: '#fff', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid var(--border)',
              opacity: deletedIds.includes(img.id) ? 0.3 : 1
            }}>
              <img 
                src={img.image_url} 
                alt="Galeri Resmi" 
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
              
              {img.isNew && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  YENİ
                </div>
              )}

              <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '1.1rem', opacity: index === 0 ? 0.3 : 1 }}
                    title="Öne Al"
                  >
                    ⬅️
                  </button>
                  <button 
                    onClick={() => moveItem(index, 1)}
                    disabled={index === images.length - 1}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '1.1rem', opacity: index === images.length - 1 ? 0.3 : 1 }}
                    title="Geriye Al"
                  >
                    ➡️
                  </button>
                </div>

                <button 
                  onClick={() => handleDelete(img.id)}
                  className="btn"
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
