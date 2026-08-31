import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getTeams, createMatch, updateMatch, getMatch, getMatches } from '../../lib/api'
import { ADMIN } from '../../lib/adminConfig'

function getResult(homeGoals, awayGoals) {
  if (homeGoals === '' || awayGoals === '') return null
  const h = Number(homeGoals), a = Number(awayGoals)
  if (h > a)  return { home: 'GALİBİYET', away: 'MAĞLUP',    homeClass: 'win', awayClass: 'loss' }
  if (h === a) return { home: 'BERABERLİK', away: 'BERABERLİK', homeClass: 'draw', awayClass: 'draw' }
  return       { home: 'MAĞLUP',     away: 'GALİBİYET', homeClass: 'loss', awayClass: 'win' }
}

export default function LeagueMatchForm() {
  const { id }    = useParams()    // id varsa düzenleme, yoksa yeni kayıt
  const navigate  = useNavigate()
  const isEdit    = !!id

  const [teams,   setTeams]   = useState([])
  const [form,    setForm]    = useState({
    home_team_id: '',
    away_team_id: '',
    home_goals:   '',
    away_goals:   '',
    week:         '',
    played_at:    new Date().toISOString().slice(0, 10),
  })
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getTeams().then(({ data }) => {
      setTeams(data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getMatch(id).then(({ data }) => {
      if (!data) return navigate(ADMIN?.lig)
      setForm({
        home_team_id: data.home_team_id,
        away_team_id: data.away_team_id,
        home_goals:   String(data.home_goals),
        away_goals:   String(data.away_goals),
        week:         String(data.week),
        played_at:    data.played_at,
      })
    })
  }, [id, isEdit, navigate])

  const result = getResult(form.home_goals, form.away_goals)
  const homeTeam = teams.find(t => t.id === form.home_team_id)
  const awayTeam = teams.find(t => t.id === form.away_team_id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.home_team_id || !form.away_team_id) return setError('Ev sahibi ve misafir takımı seçin.')
    if (form.home_team_id === form.away_team_id)  return setError('Ev sahibi ve misafir aynı olamaz.')
    if (form.home_goals === '' || form.away_goals === '') return setError('Skoru girin.')
    if (!form.week || Number(form.week) < 1) return setError('Geçerli bir hafta numarası girin.')
    
    setError(null); setSaving(true)
    
    // Aynı hafta kontrolü
    const { data: allMatches } = await getMatches()
    if (allMatches) {
      const homeTeamMatches = allMatches.filter(m => 
        Number(m.week) === Number(form.week) && 
        (m.home_team_id === form.home_team_id || m.away_team_id === form.home_team_id) &&
        String(m.id) !== String(id)
      )
      if (homeTeamMatches.length > 0) {
        setSaving(false)
        return setError('Ev sahibi takım bu hafta zaten başka bir maç oynamış.')
      }

      const awayTeamMatches = allMatches.filter(m => 
        Number(m.week) === Number(form.week) && 
        (m.home_team_id === form.away_team_id || m.away_team_id === form.away_team_id) &&
        String(m.id) !== String(id)
      )
      if (awayTeamMatches.length > 0) {
        setSaving(false)
        return setError('Misafir takım bu hafta zaten başka bir maç oynamış.')
      }
    }

    const payload = {
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      home_goals:   Number(form.home_goals),
      away_goals:   Number(form.away_goals),
      week:         Number(form.week),
      played_at:    form.played_at,
    }
    const { error: err } = isEdit ? await updateMatch(id, payload) : await createMatch(payload)
    setSaving(false)
    if (err) return setError(err.message)
    navigate(ADMIN?.lig)
  }

  if (loading) return <AdminLayout><div className="loading-center"><div className="spinner"/></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{isEdit ? '✏️ Maç Düzenle' : '⚽ Maç Sonucu Gir'}</h1>
          <p className="admin-page-subtitle">Ev sahibi ve misafir takımı seçin, skoru girin. Sistem puanları otomatik hesaplar.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(ADMIN?.lig)}>← Geri</button>
      </div>

      <div className="data-table-wrapper">
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>

          {/* Hafta + Tarih */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Hafta *</label>
              <input
                className="form-input"
                type="number" min="1" max="99"
                placeholder="7"
                value={form.week}
                onChange={e => setForm(f => ({ ...f, week: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maç Tarihi</label>
              <input
                className="form-input"
                type="date"
                value={form.played_at}
                onChange={e => setForm(f => ({ ...f, played_at: e.target.value }))}
              />
            </div>
          </div>

          {/* Skor Giriş Arayüzü */}
          <div className="match-score-entry">
            {/* Ev Sahibi */}
            <div className="match-score-team">
              <label className="form-label" style={{ textAlign: 'center' }}>Ev Sahibi</label>
              <select
                className="form-select"
                value={form.home_team_id}
                onChange={e => setForm(f => ({ ...f, home_team_id: e.target.value }))}
              >
                <option value="">— Takım Seç —</option>
                {teams
                  .filter(t => t.id !== form.away_team_id)
                  .map(t => <option key={t.id} value={t.id}>{t.is_our_team ? '⭐ ' : ''}{t.name}</option>)
                }
              </select>
              {result && (
                <span className={`match-result-badge match-result-${result.homeClass}`}>
                  {result.home}
                </span>
              )}
            </div>

            {/* Skor */}
            <div className="match-score-center">
              <div className="match-score-inputs">
                <input
                  className="match-score-input"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={form.home_goals}
                  onChange={e => setForm(f => ({ ...f, home_goals: e.target.value }))}
                />
                <span className="match-score-sep">—</span>
                <input
                  className="match-score-input"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={form.away_goals}
                  onChange={e => setForm(f => ({ ...f, away_goals: e.target.value }))}
                />
              </div>
              {homeTeam && awayTeam && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {homeTeam.short_name} — {awayTeam.short_name}
                </div>
              )}
            </div>

            {/* Misafir */}
            <div className="match-score-team">
              <label className="form-label" style={{ textAlign: 'center' }}>Misafir</label>
              <select
                className="form-select"
                value={form.away_team_id}
                onChange={e => setForm(f => ({ ...f, away_team_id: e.target.value }))}
              >
                <option value="">— Takım Seç —</option>
                {teams
                  .filter(t => t.id !== form.home_team_id)
                  .map(t => <option key={t.id} value={t.id}>{t.is_our_team ? '⭐ ' : ''}{t.name}</option>)
                }
              </select>
              {result && (
                <span className={`match-result-badge match-result-${result.awayClass}`}>
                  {result.away}
                </span>
              )}
            </div>
          </div>

          {/* Önizleme */}
          {result && homeTeam && awayTeam && (
            <div className="match-preview">
              <div className={`match-preview-row match-preview-${result.homeClass}`}>
                <strong>{homeTeam.name}</strong>
                <span>{result.homeClass === 'win' ? '+3P' : result.homeClass === 'draw' ? '+1P' : '+0P'}</span>
                <span>Av {Number(form.home_goals) - Number(form.away_goals) >= 0 ? '+' : ''}{Number(form.home_goals) - Number(form.away_goals)}</span>
              </div>
              <div className={`match-preview-row match-preview-${result.awayClass}`}>
                <strong>{awayTeam.name}</strong>
                <span>{result.awayClass === 'win' ? '+3P' : result.awayClass === 'draw' ? '+1P' : '+0P'}</span>
                <span>Av {Number(form.away_goals) - Number(form.home_goals) >= 0 ? '+' : ''}{Number(form.away_goals) - Number(form.home_goals)}</span>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Kaydediliyor…' : isEdit ? '💾 Güncelle' : '💾 Kaydet'}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(ADMIN?.lig)}>
              İptal
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
