import express from 'express'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import emailConfig from './email.config.js'
  
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
})

function generateEmailHTML(data) {
  const ticketRows = data.codes
    .map((code, i) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;">Ticket ${i + 1}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;">${code}</td></tr>`)
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Inter,system-ui,sans-serif;background:#f5f7fb;padding:40px 20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:#2563eb;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">ticketverif</h1>
        </div>
        <div style="padding:32px 28px;">
          <h2 style="margin:0 0 8px;font-size:20px;">✅ Ticket soumis avec succès</h2>
          <p style="color:#4a5568;font-size:14px;line-height:1.6;margin:0 0 20px;">
            Bonjour <strong>${data.name}</strong>,<br><br>
            Votre demande de vérification a bien été enregistrée. Un administrateur l'analysera dans les plus brefs délais.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#4a5568;">N° de suivi</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;">${data.id}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#4a5568;">Type</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;">${data.type}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#4a5568;">Nombre de tickets</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;">${data.ticketCount}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#4a5568;">Date</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${new Date(data.createdAt).toLocaleString('fr-FR')}</td></tr>
          </table>
          <h3 style="margin:0 0 8px;font-size:14px;color:#4a5568;">Codes soumis :</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr style="background:#f5f7fb;"><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px;">Ticket</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px;">Code</th></tr>
            ${ticketRows}
          </table>
          <p style="color:#a0aec0;font-size:12px;text-align:center;margin:0;">
            Vos informations sont sécurisées et confidentielles.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

app.post('/api/submit', async (req, res) => {
  try {
    const data = req.body

    const record = {
      id: `TV-${Date.now().toString(36).toUpperCase()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    }

    // Sauvegarder en mémoire (pour un vrai usage, utiliser une BDD)
    if (!global.tickets) global.tickets = []
    global.tickets.unshift(record)

    // Envoyer l'email de confirmation
    await transporter.sendMail({
      from: emailConfig.from,
      to: data.email,
      subject: `TicketVerif — Confirmation de votre demande ${record.id}`,
      html: generateEmailHTML({ ...record, codes: data.codes }),
    })

    res.json({ success: true, id: record.id })
  } catch (err) {
    console.error('Erreur:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/tickets', (req, res) => {
  res.json(global.tickets || [])
})

app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params
  const { status, adminNote } = req.body
  const tickets = global.tickets || []
  const idx = tickets.findIndex((t) => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  tickets[idx] = { ...tickets[idx], status, adminNote, reviewedAt: new Date().toISOString() }
  global.tickets = tickets
  res.json(tickets[idx])
})

// Admin login (simple)
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === 'admin123') {
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
})

// Servir le frontend pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n  ✅  TicketVerif démarré sur http://localhost:${PORT}`)
  console.log(`  📧  Emails vers : ${emailConfig.auth.user}`)
  console.log(`  🔐  Admin : /admin (mot de passe: admin123)\n`)
})
