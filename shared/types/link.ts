export interface WaLink {
  /** Identificador fixo usado no QR Code (/r/:slug). Nunca muda. */
  slug: string
  name: string
  /** Somente dígitos, com DDI. Ex: 5511912345678 */
  phone: string
  message: string
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface WaLinkInput {
  name: string
  phone: string
  message?: string
  slug?: string
}
