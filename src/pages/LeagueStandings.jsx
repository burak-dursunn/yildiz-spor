import { useState, useEffect } from 'react'
import { getStandings, getMatches, getSetting } from '../lib/api'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function LeagueStandings() {
  const [standings, setStandings] = useState([])
  const [matches,   setMatches]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('table')  // 'table' | 'results'
  const [standingsEnabled, setStandingsEnabled] = useState(true)

  useEffect(() => {
    Promise.all([
      getStandings(), 
      getMatches(),
      getSetting('league_standings_enabled', true)
    ]).then(([s, m, set]) => {
      setStandings(s.data || [])
      setMatches(m.data || [])
      setStandingsEnabled(set.data === 'true' || set.data === true)
      setLoading(false)
    })
  }, [])

  // Maçları haftalara göre grupla
  const matchesByWeek = matches.reduce((acc, m) => {
    const wk = m.week
    if (!acc[wk]) acc[wk] = []
    acc[wk].push(m)
    return acc
  }, {})
  const weeks = Object.keys(matchesByWeek).map(Number).sort((a, b) => b - a)

  return (
    <>
      {/* Hero */}
      <section className="page-hero page-hero-sm">
        <div className="container page-hero-content">
          <span className="page-hero-badge">🏆 Lig</span>
          <h1 style={{ fontSize: '2.5rem', fontFamily: "'Oswald', sans-serif", fontWeight: 700, margin: '0.5rem 0 0.75rem' }}>
            Puan Durumu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Güncel lig sıralaması ve maç sonuçları
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Tab Menü */}
        <div className="league-tabs">
          <button
            className={`league-tab ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            📊 Puan Tablosu
          </button>
          <button
            className={`league-tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            ⚽ Maç Sonuçları
          </button>
        </div>

        {loading ? (
          <div className="loading-center" style={{ minHeight: 300 }}>
            <div className="spinner" />
          </div>
        ) : !standingsEnabled ? (
          <div className="league-empty">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h2>Puan Durumu Şimdilik Kapalı</h2>
            <p>Puan durumu ve maç sonuçları şu anlık mevcut değil veya güncelleniyor.</p>
          </div>
        ) : activeTab === 'table' ? (
          /* ── Puan Tablosu ── */
          standings.length === 0 ? (
            <div className="league-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏟️</div>
              <h2>Lig Henüz Başlamadı</h2>
              <p>Maç sonuçları girildikten sonra puan tablosu burada görüntülenecek.</p>
            </div>
          ) : (
            <div className="league-table-wrapper">
              <table className="league-table">
                <thead>
                  <tr>
                    <th className="col-pos">#</th>
                    <th className="col-team">Takım</th>
                    <th className="col-stat" title="Oynanan">O</th>
                    <th className="col-stat" title="Galibiyet">G</th>
                    <th className="col-stat" title="Beraberlik">B</th>
                    <th className="col-stat" title="Mağlubiyet">M</th>
                    <th className="col-stat" title="Atılan Gol">AG</th>
                    <th className="col-stat" title="Yenilen Gol">YG</th>
                    <th className="col-stat" title="Averaj">Av</th>
                    <th className="col-pts">P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map(s => (
                    <tr
                      key={s.team_id}
                      className="league-row"
                    >
                      <td className="col-pos">
                        <span className={`position-badge ${s.position <= 3 ? `pos-${s.position}` : ''}`}>
                          {s.position}
                        </span>
                      </td>
                      <td className="col-team">
                        {s.logo_url
                          ? <img src={s.logo_url} alt={s.name} className="team-logo" />
                          : <span className="team-logo-placeholder">⚽</span>
                        }
                        <div className="team-name-cell">
                          <span className="team-name">{s.name}</span>
                        </div>
                      </td>
                      <td className="col-stat">{s.played}</td>
                      <td className="col-stat col-wins">{s.wins}</td>
                      <td className="col-stat">{s.draws}</td>
                      <td className="col-stat col-losses">{s.losses}</td>
                      <td className="col-stat">{s.goals_for}</td>
                      <td className="col-stat">{s.goals_against}</td>
                      <td className="col-stat col-diff">
                        {s.goal_diff >= 0 ? '+' : ''}{s.goal_diff}
                      </td>
                      <td className="col-pts">
                        <strong>{s.points}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="league-table-legend">
                <span className="legend-item">Sıralama: Puan → Averaj → Atılan Gol</span>
              </div>
            </div>
          )
        ) : (
          /* ── Maç Sonuçları ── */
          weeks.length === 0 ? (
            <div className="league-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
              <h2>Henüz Maç Oynanmadı</h2>
              <p>Maç sonuçları girildikten sonra burada görüntülenecek.</p>
            </div>
          ) : (
            <div className="league-results">
              {weeks.map(wk => (
                <div key={wk} className="league-week">
                  <h3 className="league-week-title">Hafta {wk}</h3>
                  <div className="league-week-matches">
                    {matchesByWeek[wk].map(m => {
                      const homeWin = m.home_goals > m.away_goals
                      const awayWin = m.away_goals > m.home_goals
                      return (
                        <div key={m.id} className="match-card">
                          <div className={`match-card-team ${homeWin ? 'match-winner' : ''}`}>
                            <span className="match-team-name">{m.home_team?.name || '—'}</span>
                          </div>
                          <div className="match-card-score">
                            <span className={homeWin ? 'score-bold' : ''}>{m.home_goals}</span>
                            <span className="score-dash">—</span>
                            <span className={awayWin ? 'score-bold' : ''}>{m.away_goals}</span>
                          </div>
                          <div className={`match-card-team match-card-team-away ${awayWin ? 'match-winner' : ''}`}>
                            <span className="match-team-name">{m.away_team?.name || '—'}</span>
                          </div>
                          <div className="match-card-date">{fmtDate(m.played_at)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  )
}
