export default function MatchCenterSection() {
  return (
    <section className="section-md bg-surface">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="heading-lg">Maç Merkezi</h2>
          <p className="text-muted mt-2">Sonuçlar ve gelecek fikstür</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Son Maç */}
          <div className="card" style={{ borderTop: '4px solid var(--primary)', borderRadius: '0' }}>
            <div className="card-body text-center">
              <span className="badge badge-error mb-4">Son Maç</span>
              <div className="flex items-center justify-between mt-4 mb-6">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-alt mx-auto rounded-full flex items-center justify-center mb-2">
                    <img src="/logo.png" alt="Ergani" className="w-10 h-10 object-contain" />
                  </div>
                  <h4 className="font-bold text-lg">Ergani Yıldız Spor</h4>
                </div>
                <div className="px-6">
                  <div className="text-4xl font-black" style={{ color: 'var(--primary)' }}>2 - 1</div>
                  <div className="text-sm text-muted mt-2">MS</div>
                </div>
                <div className="flex-1">
                  <div className="w-16 h-16 bg-alt mx-auto rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl opacity-50">🛡️</span>
                  </div>
                  <h4 className="font-bold text-lg text-muted">Diyarbakır İdman Y.</h4>
                </div>
              </div>
              <p className="text-sm text-muted border-t pt-4">Diyarbakır Amatör Ligi - 12. Hafta</p>
            </div>
          </div>

          {/* Gelecek Maç */}
          <div className="card" style={{ borderTop: '4px solid var(--accent)', borderRadius: '0' }}>
            <div className="card-body text-center">
              <span className="badge badge-success mb-4">Gelecek Maç</span>
              <div className="flex items-center justify-between mt-4 mb-6 opacity-80">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-alt mx-auto rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl opacity-50">🦅</span>
                  </div>
                  <h4 className="font-bold text-lg text-muted">Bağlar Bld. Spor</h4>
                </div>
                <div className="px-6">
                  <div className="text-2xl font-black bg-alt py-2 px-4">V</div>
                  <div className="text-sm text-muted mt-2">26 Ağustos - 14:00</div>
                </div>
                <div className="flex-1">
                  <div className="w-16 h-16 bg-alt mx-auto rounded-full flex items-center justify-center mb-2">
                    <img src="/logo.png" alt="Ergani" className="w-10 h-10 object-contain" />
                  </div>
                  <h4 className="font-bold text-lg">Ergani Yıldız Spor</h4>
                </div>
              </div>
              <p className="text-sm text-muted border-t pt-4">Diyarbakır Amatör Ligi - 13. Hafta (Deplasman)</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
