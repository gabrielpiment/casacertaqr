export default defineEventHandler((event) => {
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
  return { ok: true }
})
