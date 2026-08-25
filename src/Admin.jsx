import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const SL = { pending: 'En attente', approved: 'Validé', rejected: 'Refusé' }
const SC = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState({})

  async function fetchTickets() {
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(data)
    } catch {}
  }

  useEffect(() => { if (authed) fetchTickets() }, [authed])

  async function doLogin(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.ok) { setAuthed(true); setPwErr('') }
      else setPwErr('Mot de passe incorrect.')
    } catch {
      setPwErr('Erreur de connexion au serveur.')
    }
  }

  function doLogout() { setAuthed(false); setTickets([]); setPw('') }

  async function apply(id, status) {
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote: notes[id] || '' }),
      })
      fetchTickets()
    } catch {}
  }

  const vis = tickets.filter((t) => filter === 'all' || t.status === filter)
  const c = {
    all: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    approved: tickets.filter((t) => t.status === 'approved').length,
    rejected: tickets.filter((t) => t.status === 'rejected').length,
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <Link to="/" className="admin-back">← Retour</Link>
        <div className="admin-login-card">
          <div className="admin-login-icon">🔐</div>
          <h2>Administration</h2>
          <p>Connectez-vous pour gérer les tickets.</p>
          <form onSubmit={doLogin}>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input-plain" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
            </div>
            {pwErr && <div className="form-error">{pwErr}</div>}
            <button type="submit" className="form-submit" style={{ marginTop: 8 }}>Se connecter</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Link to="/" className="admin-back">← Retour au site</Link>
      <h1 className="admin-title">Tableau de bord</h1>
      <p className="admin-sub">{c.all} ticket(s) au total</p>

      <div className="filters">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tous' : SL[f]} ({c[f]})
          </button>
        ))}
        <button className="filter-btn" style={{ marginLeft: 'auto', color: '#e53e3e' }} onClick={doLogout}>Déconnexion</button>
      </div>

      {vis.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📭</div>
          <p>Aucun ticket dans cette catégorie.</p>
        </div>
      ) : (
        vis.map((t) => (
          <div className="admin-ticket" key={t.id}>
            <div className="admin-ticket-head">
              <span className="admin-ticket-id">{t.id}</span>
              <span className={`badge ${SC[t.status]}`}>{SL[t.status]}</span>
            </div>
            <div className="admin-ticket-meta">
              {t.type} · {t.ticketCount || 1} ticket(s) · {new Date(t.createdAt).toLocaleString('fr-FR')} · {t.name}
            </div>
            <div className="admin-ticket-codes">
              {Array.isArray(t.codes)
                ? t.codes.map((c, i) => <div key={i}><b>Ticket {i + 1}:</b> {c}</div>)
                : null
              }
            </div>
            {t.email && <div className="admin-ticket-email">Email : {t.email}</div>}

            {t.status === 'pending' ? (
              <>
                <input className="form-input-plain" style={{ marginTop: 12 }} type="text" placeholder="Commentaire admin (optionnel)" value={notes[t.id] || ''} onChange={(e) => setNotes((r) => ({[...]
                <div className="admin-ticket-actions">
                  <button className="btn-accept" onClick={() => apply(t.id, 'approved')}>✓ Valider</button>
                  <button className="btn-reject" onClick={() => apply(t.id, 'rejected')}>✕ Refuser</button>
                </div>
              </>
            ) : (
              t.adminNote && <div className="admin-ticket-note">Avis : {t.adminNote}</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
