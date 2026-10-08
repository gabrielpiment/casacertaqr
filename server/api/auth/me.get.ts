export default defineEventHandler(event => ({ authenticated: isAuthenticated(event) }))
