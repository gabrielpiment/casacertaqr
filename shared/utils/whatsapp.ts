/**
 * Mantém só dígitos. Se vier um número brasileiro sem DDI (10 ou 11 dígitos),
 * adiciona o 55 automaticamente.
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits
}

/**
 * Link que abre direto a conversa no app do WhatsApp (sem a página
 * intermediária "Continuar para o chat" do wa.me).
 */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const params = new URLSearchParams({ phone })
  const text = message?.trim()
  if (text) params.set('text', text)
  params.set('type', 'phone_number')
  params.set('app_absent', '0')
  return `https://api.whatsapp.com/send/?${params.toString()}`
}

export function formatPhone(phone: string): string {
  const br = phone.match(/^55(\d{2})(\d{4,5})(\d{4})$/)
  if (br) return `+55 (${br[1]}) ${br[2]}-${br[3]}`
  return phone ? `+${phone}` : ''
}
