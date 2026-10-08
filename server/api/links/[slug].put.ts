import type { WaLink } from '#shared/types/link'

// Atualiza nome/número/mensagem. O slug (e portanto o QR Code) NUNCA muda.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const existing = await getLink(slug)
  if (!existing) throw createError({ statusCode: 404, message: 'QR Code não encontrado.' })

  const data = validateInput(await readBody(event))
  const updated: WaLink = { ...existing, ...data, updatedAt: new Date().toISOString() }
  await saveLink(updated)
  return updated
})
