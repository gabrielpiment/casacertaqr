import type { WaLink, WaLinkInput } from '#shared/types/link'

export default defineEventHandler(async (event) => {
  const body = await readBody<WaLinkInput>(event)
  const data = validateInput(body)

  let slug = String(body?.slug ?? '').trim().toLowerCase()
  if (slug) {
    if (!SLUG_RE.test(slug))
      throw createError({ statusCode: 400, message: 'Código inválido: use 3 a 40 letras minúsculas, números ou hífen.' })
    if (await getLink(slug))
      throw createError({ statusCode: 409, message: 'Esse código já está em uso.' })
  }
  else {
    do slug = generateSlug()
    while (await getLink(slug))
  }

  const now = new Date().toISOString()
  const link: WaLink = { slug, ...data, clicks: 0, createdAt: now, updatedAt: now }
  await saveLink(link)

  setResponseStatus(event, 201)
  return link
})
