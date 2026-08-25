export const TICKET_TYPES = [
  {
    id: 'pcs',
    name: 'PCS',
    color: '#ff6a3d',
    desc: 'Carte prépayée PCS Mastercard',
    example: 'Ex: 16 chiffres + code au dos',
    fields: [
      { key: 'cardNumber', label: 'Numéro de carte', placeholder: '1234 5678 9012 3456' },
      { key: 'code', label: 'Code de sécurité', placeholder: '1234' },
    ],
  },
  {
    id: 'transcash',
    name: 'Transcash',
    color: '#00b3e6',
    desc: 'Chèque-cadeau Transcash',
    example: 'Ex: code à 14 caractères',
    fields: [
      { key: 'code', label: 'Code du ticket', placeholder: 'TRXXXX-XXXXXX' },
    ],
  },
  {
    id: 'paysafecard',
    name: 'Paysafecard',
    color: '#e60028',
    desc: 'Ticket de paiement Paysafecard',
    example: 'Ex: code PIN de 16 chiffres',
    fields: [
      { key: 'pin', label: 'Code PIN', placeholder: '1234 5678 9012 3456' },
    ],
  },
  {
    id: 'toneo',
    name: 'Toneo',
    color: '#7c3aed',
    desc: 'Carte Toneo First',
    example: 'Ex: n° de carte + code',
    fields: [
      { key: 'cardNumber', label: 'Numéro de carte', placeholder: '1234 5678 9012 3456' },
      { key: 'code', label: 'Code', placeholder: '1234' },
    ],
  },
  {
    id: 'bitnovo',
    name: 'Bitnovo',
    color: '#f7931a',
    desc: 'Bon Bitnovo (crypto)',
    example: 'Ex: code à 16 caractères',
    fields: [
      { key: 'code', label: 'Code du bon', placeholder: 'BITN-XXXX-XXXX' },
    ],
  },
  {
    id: 'neosurf',
    name: 'Neosurf',
    color: '#00a14b',
    desc: 'Voucher Neosurf',
    example: 'Ex: code de 10 caractères',
    fields: [
      { key: 'code', label: 'Code Neosurf', placeholder: 'ABCDE-12345' },
    ],
  },
]

export const TICKET_MAP = Object.fromEntries(TICKET_TYPES.map((t) => [t.id, t]))
