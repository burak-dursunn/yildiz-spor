import { useState, useEffect } from 'react'
import { getClubGalleryImages } from '../lib/api'
import SEO from '../components/SEO'

export default function PublicGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getClubGalleryImages('u-13').then(({ data, error }) => {
      if (!error && data) {
        setImages(data)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className="page-wrapper" style={{ padding: '6rem 0' }}>
      <SEO 
        title="Resim Galerisi" 
        description="Ergani Yıldız Spor kulübünün maçlarından, antrenmanlarından ve etkinliklerinden kareler. Takım fotoğrafları ve unutulmaz anlar." 
      />
      
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="heading-xl" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Resim Galerimiz</h1>
          <p className="body-lg" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Kulübümüzün unutulmaz anları, takım ruhumuz ve geleceğin yıldızlarının saha içindeki mücadeleleri.
          </p>
        </div>

        {loading ? (
          <div className="loading-center" style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner" />
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px' }}>
            <h3 className="heading-lg" style={{ color: 'var(--text-muted)' }}>Henüz fotoğraf eklenmemiş.</h3>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {images.map(img => (
              <div 
                key={img.id} 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img 
                  src={img.image_url} 
                  alt="Galeri Resmi" 
                  style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                  loading="lazy" 
                  decoding="async"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
