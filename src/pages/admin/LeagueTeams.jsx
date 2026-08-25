import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../lib/api'

const EMPTY_FORM = { name: '', short_name: '', is_our_team: false, order_index: '' }

export default function LeagueTeams() {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  const load = () => {
    setLoading(true)
    getTeams().then(({ data }) => { setTeams(data || []); setLoading(false) })
  }

  useEffect(load, [])

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setError(null) }

  const startEdit = (t) => {
    setEditId(t.id)
    setForm({ name: t.name, short_name: t.short_name, is_our_team: t.is_our_team, order_index: t.order_index })
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 2500) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.short_name.trim()) return setError('Ad ve kısa ad zorunludur.')
    setSaving(true); setError(null)
    const payload = { ...form, order_index: Number(form.order_index) || 0 }
    const { error: err } = editId ? await updateTeam(editId, payload) : await createTeam(payload)
    setSaving(false)
    if (err) return setError(err.message)
    flash(editId ? 'Takım güncellendi.' : 'Takım eklendi.')
    resetForm(); load()
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" takımını silmek istiyor musunuz?`)) return
    const { error: err } = await deleteTeam(id)
    if (err) return setError(err.message)
    flash('Takım silindi.')
    load()
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">⚽ Lig Takımları</h1>
          <p className="admin-page-subtitle">Sezon başında takımları bir kez girin. Maç girişinde bu listeden seçim yapılır.</p>
        </div>
      </div>

      {/* Form */}
      <div className="data-table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div className="data-table-header">
          <h3 className="heading-sm">{editId ? '✏️ Takımı Düzenle' : '+ Yeni Takım Ekle'}</h3>
          {editId && <button className="btn btn-ghost btn-sm" onClick={resetForm}>İptal</button>}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Takım Adı *</label>
            <input
              className="form-input"
              placeholder="Ergani Yıldız Spor"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kısa Ad *</label>
            <input
              className="form-input"
              placeholder="EYS"
              maxLength={5}
              value={form.short_name}
              onChange={e => setForm(f => ({ ...f, short_name: e.target.value.toUpperCase() }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sıra No</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.order_index}
              onChange={e => setForm(f => ({ ...f, order_index: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.is_our_team}
                onChange={e => setForm(f => ({ ...f, is_our_team: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>⭐ Bu bizim takımımız (tabloda vurgulanır)</span>
            </label>
          </div>

          {error && <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ gridColumn: '1/-1' }}>{success}</div>}

          <div style={{ gridColumn: '1/-1' }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor…' : editId ? 'Güncelle' : '+ Ekle'}
            </button>
          </div>
        </form>
      </div>

      {/* Takım Listesi */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h3 className="heading-sm">Takım Listesi ({teams.length})</h3>
        </div>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 160 }}><div className="spinner" /></div>
        ) : teams.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz takım eklenmedi. Yukarıdaki formu kullanarak ilk takımı ekleyin.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sıra</th><th>Takım Adı</th><th>Kısa Ad</th><th>Durum</th><th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)', width: '60px' }}>{t.order_index}</td>
                  <td>
                    <span className="table-title">
                      {t.is_our_team && '⭐ '}{t.name}
                    </span>
                  </td>
                  <td>
                    <code style={{ background: 'var(--bg-surface)', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                      {t.short_name}
                    </code>
                  </td>
                  <td>
                    {t.is_our_team
                      ? <span className="badge" style={{ background: 'rgba(13,71,161,0.1)', color: 'var(--primary)', border: '1px solid rgba(13,71,161,0.2)' }}>Bizim Takımımız</span>
                      : <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Rakip</span>
                    }
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="action-btn action-btn-edit" onClick={() => startEdit(t)}>Düzenle</button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(t.id, t.name)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
