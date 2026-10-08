export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!(await getLink(slug))) throw createError({ statusCode: 404, message: 'QR Code não encontrado.' })
  await deleteLink(slug)
  return { ok: true }
})
