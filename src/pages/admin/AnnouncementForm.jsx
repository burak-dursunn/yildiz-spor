import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  createAnnouncement, updateAnnouncement, adminGetAnnouncement, deleteAnnouncement,
  uploadImage, deleteImage, addGalleryImage, deleteGalleryImage
} from '../../lib/api'
import { ANNOUNCEMENT_TYPES, getPublicUrl } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { ADMIN } from '../../lib/adminConfig'

const INITIAL_FORM = {
  title: '',
  content: '',
  type: 'genel',
  cover_image: '',
  published: true,
}

function ImageUploadField({ label, value, onChange, onClear }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Sadece görsel dosyaları yükleyebilirsiniz.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Maksimum dosya boyutu 5MB\'dir.')
      return
    }
    setUploading(true)
    const { data, error } = await uploadImage(file)
    if (error) {
      alert('Yükleme başarısız: ' + error.message)
    } else {
      // Mock modda publicUrl = data URL, Supabase modda publicUrl = CDN URL
      // Her iki durumda da görüntülenebilir URL sakla
      onChange(data.publicUrl || data.path)
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // Hem data URL, hem Supabase CDN URL, hem de path desteği
  const resolveUrl = (v) => {
    if (!v) return null
    if (v.startsWith('data:') || v.startsWith('http') || v.startsWith('/')) return v
    return getPublicUrl(v)
  }
  const previewUrl = resolveUrl(value)

  return (
    <div>
      {previewUrl ? (
        <div className="cover-preview">
          <img src={previewUrl} alt="Kapak görseli" />
          <button
            type="button"
            className="cover-preview-remove"
            onClick={() => { onClear(); }}
            title="Görseli kaldır"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">
            {uploading ? <div className="spinner" style={{ margin: '0 auto' }} /> : '🖼️'}
          </div>
          <p className="upload-text">
            {uploading ? 'Yükleniyor...' : 'Kapak görseli seçin veya sürükleyin'}
          </p>
          <p className="upload-hint">JPG, PNG, WebP • Maks. 5MB</p>
        </div>
      )}
    </div>
  )
}

function GalleryField({ announcementId, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(
      f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    )
    if (validFiles.length === 0) return

    setUploading(true)
    for (let i = 0; i < validFiles.length; i++) {
      const { data, error } = await uploadImage(validFiles[i])
      if (data && !error) {
        if (announcementId) {
          const { data: galleryItem } = await addGalleryImage(
            announcementId, data.publicUrl, '', photos.length + i
          )
          if (galleryItem) {
            setPhotos(prev => [...prev, { ...galleryItem, image_url: data.publicUrl }])
          }
        } else {
          setPhotos(prev => [...prev, { id: Date.now() + i, image_url: data.publicUrl, path: data.path }])
        }
      }
    }
    setUploading(false)
  }

  const handleRemove = async (photo) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return
    if (photo.id && announcementId) {
      await deleteGalleryImage(photo.id)
    }
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return (
    <div>
      <div className="gallery-upload-grid">
        {photos.map((photo, index) => (
          <div key={photo.id || index} className="gallery-thumb">
            <img src={photo.image_url} alt={`Fotoğraf ${index + 1}`} loading="lazy" />
            <button
              type="button"
              className="gallery-thumb-remove"
              onClick={() => handleRemove(photo)}
              title="Fotoğrafı kaldır"
            >
              ✕
            </button>
          </div>
        ))}

        <div
          className="gallery-upload-add"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={e => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
          ) : (
            '+'
          )}
        </div>
      </div>
      <p className="upload-hint" style={{ marginTop: '0.5rem' }}>
        Birden fazla fotoğraf seçebilirsiniz. Maks. 5MB/adet
      </p>
    </div>
  )
}

export default function AnnouncementForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(INITIAL_FORM)
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isEditing) return
    adminGetAnnouncement(id).then(({ data, error }) => {
      if (error || !data) {
        setError('Duyuru yüklenemedi.')
      } else {
        setForm({
          title: data.title,
          content: data.content,
          type: data.type,
          cover_image: data.cover_image || '',
          published: data.published,
        })
        setOriginalData(data)
      }
      setLoading(false)
    })
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Başlık zorunludur.'); return }
    if (!form.content.trim()) { setError('İçerik zorunludur.'); return }

    setSaving(true)
    setError('')

    let result
    if (isEditing) {
      result = await updateAnnouncement(id, form)
    } else {
      result = await createAnnouncement(form)
    }

    if (result.error) {
      setError('Kayıt başarısız: ' + result.error.message)
      setSaving(false)
    } else {
      setSaving(false)
      if (!isEditing) {
        setSuccess('Duyuru başarıyla oluşturuldu!')
        setTimeout(() => setSuccess(''), 3000)
        navigate(ADMIN?.haberlerEdit(result.data.id), { replace: true })
      } else {
        setSuccess('Duyuru başarıyla güncellendi!')
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return
    }
    
    setSaving(true)
    setError('')
    
    const { error } = await deleteAnnouncement(id)
    
    if (error) {
      setError('Silme işlemi başarısız: ' + error.message)
      setSaving(false)
    } else {
      // Başarıyla silindi, listeye geri dön
      navigate(ADMIN?.haberler, { replace: true })
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-center" style={{ minHeight: '300px' }}>
          <div className="spinner" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {isEditing ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
          </h1>
          <p className="admin-page-subtitle">
            {isEditing ? 'Duyuru bilgilerini güncelleyin' : 'Yeni bir duyuru veya haber oluşturun'}
          </p>
        </div>
        <Link to={ADMIN?.haberler} className="btn btn-ghost">
          ← Listeye Dön
        </Link>
      </div>

      {error && <div className="alert alert-error mb-6">⚠️ {error}</div>}
      {success && <div className="alert alert-success mb-6">✅ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          {/* Main Content */}
          <div className="flex flex-col gap-6">
            <div className="form-card">
              <p className="form-card-title">Duyuru Bilgileri</p>
              <div className="form-stack">
                <div className="form-group">
                  <label className="form-label">Başlık *</label>
                  <input
                    className="form-input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Duyuru başlığını girin..."
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duyuru Türü *</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {Object.entries(ANNOUNCEMENT_TYPES).map(([key, { label, emoji }]) => (
                      <option key={key} value={key}>
                        {emoji} {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">İçerik *</label>
                  <textarea
                    className="form-textarea"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Duyuru içeriğini buraya yazın..."
                    required
                    style={{ minHeight: '250px' }}
                  />
                  <p className="upload-hint">HTML etiketleri desteklenmektedir.</p>
                </div>
              </div>
            </div>

            {/* Gallery - sadece düzenleme modunda */}
            {isEditing && (
              <div className="form-card">
                <p className="form-card-title">📸 Fotoğraf Galerisi</p>
                <GalleryField
                  announcementId={id}
                  initialPhotos={originalData?.announcement_gallery?.map(g => ({
                    ...g,
                    image_url: g.image_url,
                  })) || []}
                />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  💡 Yeni duyuru kaydedildikten sonra galeri fotoğrafı eklenebilir.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Publish Settings */}
            <div className="form-card">
              <p className="form-card-title">Yayın Ayarları</p>
              <div className="form-stack">
                <label className="toggle-published" style={{ justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {form.published ? '✅ Yayında' : '📁 Taslak'}
                  </span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="published"
                      checked={form.published}
                      onChange={handleChange}
                    />
                    <div className="toggle-slider" />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Kaydediliyor...
                    </>
                  ) : (
                    isEditing ? '💾 Güncelle' : '🚀 Oluştur'
                  )}
                </button>

                {isEditing && (
                  <Link
                    to={`/haberler/${originalData?.slug}`}
                    target="_blank"
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    🌐 Sayfada Gör
                  </Link>
                )}
                
                <a
                  href={ADMIN?.haberlerYeni}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }}
                >
                  + Yeni Duyuru
                </a>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: '#ef4444', marginTop: '0.5rem' }}
                  >
                    🗑️ Bu Duyuruyu Sil
                  </button>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div className="form-card">
              <p className="form-card-title">Kapak Görseli</p>
              <ImageUploadField
                label="Kapak Görseli"
                value={form.cover_image}
                onChange={(path) => setForm(f => ({ ...f, cover_image: path }))}
                onClear={() => setForm(f => ({ ...f, cover_image: '' }))}
              />
            </div>

            {/* Info */}
            {!isEditing && (
              <div className="form-card" style={{ borderColor: 'rgba(245,197,24,0.3)', background: 'rgba(245,197,24,0.05)' }}>
                <p style={{ color: 'var(--accent)', fontSize: '0.8125rem', lineHeight: '1.6' }}>
                  💡 <strong>İpucu:</strong> Duyuruyu oluşturduktan sonra fotoğraf galerisi ekleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
