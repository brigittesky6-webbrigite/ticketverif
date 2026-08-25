const TICKETS_KEY = 'ticketverif_tickets'
const SESSION_KEY = 'ticketverif_admin'

export function getTickets() {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY)) || []
  } catch {
    return []
  }
}

export function saveTickets(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
}

export function addTicket(ticket) {
  const tickets = getTickets()
  const record = {
    id: `TV-${Date.now().toString(36).toUpperCase()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...ticket,
  }
  tickets.unshift(record)
  saveTickets(tickets)
  return record
}

export function updateTicketStatus(id, status, note) {
  const tickets = getTickets()
  const idx = tickets.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tickets[idx] = {
    ...tickets[idx],
    status,
    adminNote: note || tickets[idx].adminNote || '',
    reviewedAt: new Date().toISOString(),
  }
  saveTickets(tickets)
  return tickets[idx]
}

export function isAdmin() {
  return localStorage.getItem(SESSION_KEY) === 'true'
}

export function login(password) {
  const ADMIN_PASSWORD = 'admin123'
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, 'true')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
