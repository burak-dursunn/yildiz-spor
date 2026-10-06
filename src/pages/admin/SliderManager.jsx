import { useEffect, useRef, useState } from 'react'
import AdminLayout from './AdminLayout'
import { addHomeSliderImage, deleteImage, extractPathFromUrl, getHomeSliderImages, removeHomeSliderImage, uploadImage } from '../../lib/api'

export default function SliderManager() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function refresh() {
    setLoading(true)
    const { data, error: fetchError } = await getHomeSliderImages()
    setImages(data || [])
    setError(fetchError?.message || '')
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function addFiles(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    for (const file of files) {
      const { data: uploaded, error: uploadError } = await uploadImage(file)
      if (uploadError) { setError(`${file.name}: ${uploadError.message}`); continue }
      const { error: saveError } = await addHomeSliderImage(uploaded.publicUrl)
      if (saveError) {
        setError(`${file.name} kaydedilemedi: ${saveError.message}`)
        if (uploaded.path) await deleteImage(uploaded.path)
      }
    }
    await refresh()
    setUploading(false)
    event.target.value = ''
  }

  async function remove(image) {
    if (!window.confirm('Bu görseli ana sayfa sliderından kaldırmak istiyor musunuz?')) return
    const { error: removeError } = await removeHomeSliderImage(image.id)
    if (removeError) { setError(removeError.message); return }
    const path = extractPathFromUrl(image.image_url)
    if (path) await deleteImage(path)
    setImages(items => items.filter(item => item.id !== image.id))
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🎞️ Ana Sayfa Sliderı</h1>
          <p className="admin-page-subtitle">Giriş sayfasındaki görselleri ekleyin veya kaldırın.</p></div>
        <button className="btn btn-accent" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Yükleniyor…' : '+ Görsel Ekle'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {loading ? <div className="loading-center"><div className="spinner" /></div> : images.length === 0 ? (
        <div className="empty-state"><p>Sliderda henüz görsel yok. “Görsel Ekle” ile başlayın.</p></div>
      ) : (
        <div className="slider-admin-grid">
          {images.map((image, index) => <article className="slider-admin-card" key={image.id}>
            <img src={image.image_url} alt={`Slider görseli ${index + 1}`} />
            <div className="slider-admin-card-footer"><span>Görsel {index + 1}</span>
              <button className="btn btn-danger btn-sm" onClick={() => remove(image)}>Kaldır</button></div>
          </article>)}
        </div>
      )}
    </AdminLayout>
  )
}
