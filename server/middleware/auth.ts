// Protege toda a API de gerenciamento. O redirecionamento /r/:slug continua público.
export default defineEventHandler((event) => {
  if (event.path.startsWith('/api/links')) requireAuth(event)
})
