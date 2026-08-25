import { Link } from 'react-router-dom'

export default function StaffSection() {
  return (
    <section className="section-md bg-dark text-inverse">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          <div className="w-full md:w-1/2">
            <h2 className="heading-lg mb-6" style={{ color: 'var(--text-on-dark)' }}>Teknik Kadro</h2>
            <h3 className="heading-md" style={{ color: 'var(--accent)' }}>Mehmet Yeşil</h3>
            <p className="text-muted mt-2 mb-6" style={{ color: '#a1a1aa' }}>Teknik Direktör</p>
            
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-on-dark)' }}>
              "Amacımız sadece maç kazanmak değil, Ergani'nin gençlerine spor ahlakını aşılamak ve onları geleceğin profesyonelleri olarak yetiştirmektir. Sahaya çıktığımızda terimizin son damlasına kadar mücadele eden bir takım karakteri oluşturuyoruz."
            </p>
            
            <Link to="/hakkinda" className="btn btn-outline" style={{ borderColor: 'var(--text-on-dark)', color: 'var(--text-on-dark)' }}>
              Kulüp Hakkında
            </Link>
          </div>
          
          <div className="w-full md:w-1/2 relative">
            <div className="staff-image-wrapper">
              <img 
                src="/coach.jpg" 
                alt="Teknik Direktör Mehmet Yeşil" 
                className="w-full h-auto"
                style={{ 
                  borderRadius: '0', 
                  boxShadow: 'var(--shadow-blue)',
                  borderBottom: '4px solid var(--accent)'
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
