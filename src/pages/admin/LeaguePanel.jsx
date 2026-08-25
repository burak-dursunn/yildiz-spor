import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getStandings, getMatches, getTeams, deleteMatch } from '../../lib/api'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function LeaguePanel() {
  const [standings, setStandings] = useState([])
  const [matches,   setMatches]   = useState([])
  const [teamCount, setTeamCount] = useState(0)
  const [loading,   setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([getStandings(), getMatches(), getTeams()]).then(([s, m, t]) => {
      setStandings(s.data || [])
      setMatches(m.data || [])
      setTeamCount((t.data || []).length)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const handleDeleteMatch = async (id, label) => {
    if (!window.confirm(`"${label}" maçını silmek istiyor musunuz?`)) return
    await deleteMatch(id)
    load()
  }

  const topTeam = standings[0]

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏆 Lig Yönetimi</h1>
          <p className="admin-page-subtitle">Takımları ve maç sonuçlarını buradan yönetin.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/panel/lig/mac-gir" className="btn btn-accent">+ Maç Sonucu Gir</Link>
          <Link to="/admin/panel/lig/takimlar" className="btn btn-ghost">Takımları Düzenle</Link>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">👥</div>
          <div className="stat-value">{teamCount}</div>
          <div className="stat-label">Takım</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">⚽</div>
          <div className="stat-value">{matches.length}</div>
          <div className="stat-label">Oynanan Maç</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">📅</div>
          <div className="stat-value">
            {matches.length > 0 ? `Hf ${Math.max(...matches.map(m => m.week))}` : '—'}
          </div>
          <div className="stat-label">Son Hafta</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">🥇</div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>
            {topTeam ? topTeam.short_name : '—'}
          </div>
          <div className="stat-label">Lider ({topTeam?.points ?? 0} P)</div>
        </div>
      </div>

      {/* Mini Puan Tablosu */}
      <div className="data-table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div className="data-table-header">
          <h3 className="heading-sm">Puan Tablosu (Özet)</h3>
          <Link to="/lig-puan-durumu" target="_blank" className="btn btn-ghost btn-sm">Siteyi Gör ↗</Link>
        </div>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 120 }}><div className="spinner"/></div>
        ) : standings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz takım veya maç eklenmedi.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>Av</th><th>P</th></tr>
            </thead>
            <tbody>
              {standings.slice(0, 8).map(s => (
                <tr key={s.team_id} style={s.is_our_team ? { background: 'rgba(13,71,161,0.05)' } : {}}>
                  <td style={{ fontWeight: 700, width: '36px' }}>{s.position}</td>
                  <td>
                    <span className="table-title" style={s.is_our_team ? { color: 'var(--primary)' } : {}}>
                      {s.is_our_team && '⭐ '}{s.name}
                    </span>
                  </td>
                  <td>{s.played}</td>
                  <td style={{ color: 'var(--green-400)', fontWeight: 600 }}>{s.wins}</td>
                  <td>{s.draws}</td>
                  <td style={{ color: 'var(--red, #e53e3e)' }}>{s.losses}</td>
                  <td style={{ color: s.goal_diff >= 0 ? 'var(--green-400)' : '#e53e3e' }}>
                    {s.goal_diff >= 0 ? '+' : ''}{s.goal_diff}
                  </td>
                  <td style={{ fontWeight: 700 }}>{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Son Girilen Maçlar */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h3 className="heading-sm">Son Girilen Maçlar</h3>
        </div>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 120 }}><div className="spinner"/></div>
        ) : matches.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz maç girişi yapılmadı.{' '}
            <Link to="/admin/panel/lig/mac-gir" style={{ color: 'var(--primary)' }}>İlk maçı girin →</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Hf</th><th>Tarih</th><th>Ev Sahibi</th><th>Skor</th><th>Misafir</th><th>İşlem</th></tr>
            </thead>
            <tbody>
              {matches.map(m => {
                const homeLabel = m.home_team?.name || '—'
                const awayLabel = m.away_team?.name || '—'
                const label = `Hf${m.week} ${homeLabel} ${m.home_goals}-${m.away_goals} ${awayLabel}`
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700, width: '48px' }}>Hf{m.week}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(m.played_at)}</td>
                    <td style={m.home_team?.is_our_team ? { fontWeight: 700, color: 'var(--primary)' } : {}}>
                      {m.home_team?.is_our_team && '⭐ '}{homeLabel}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem',
                        background: 'var(--bg-surface)', padding: '0.2rem 0.75rem',
                        border: '1px solid var(--border)'
                      }}>
                        {m.home_goals} — {m.away_goals}
                      </span>
                    </td>
                    <td style={m.away_team?.is_our_team ? { fontWeight: 700, color: 'var(--primary)' } : {}}>
                      {m.away_team?.is_our_team && '⭐ '}{awayLabel}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/panel/lig/mac-gir/${m.id}`} className="action-btn action-btn-edit">Düzenle</Link>
                      <button className="action-btn action-btn-delete" onClick={() => handleDeleteMatch(m.id, label)}>Sil</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
