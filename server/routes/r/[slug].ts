import { buildWhatsAppUrl } from '#shared/utils/whatsapp'

/**
 * Endereço que fica DENTRO do QR Code: /r/:slug
 * Ele busca o número atual no banco e redireciona para o WhatsApp.
 * Usa 302 (temporário) + no-store para que celulares/navegadores nunca
 * guardem o destino em cache — assim a troca de número vale na hora.
 */
export default defineEventHandler(async (event) => {
  const slug = (getRouterParam(event, 'slug') ?? '').toLowerCase()
  const link = await getLink(slug)

  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')

  if (!link) {
    setResponseStatus(event, 404)
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link não encontrado</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui;background:#020617;color:#e2e8f0;text-align:center">
<div><div style="font-size:48px">🔗</div><h1 style="font-size:20px">Link não encontrado</h1><p style="color:#94a3b8">Este QR Code não está mais ativo.</p></div></body></html>`
  }

  link.clicks = (link.clicks ?? 0) + 1
  await saveLink(link)

  return sendRedirect(event, buildWhatsAppUrl(link.phone, link.message), 302)
})
