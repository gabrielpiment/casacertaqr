export default defineNuxtRouteMiddleware(async (to) => {
  const { authenticated } = await useRequestFetch()<{ authenticated: boolean }>('/api/auth/me')

  if (!authenticated && to.path !== '/login') return navigateTo('/login')
  if (authenticated && to.path === '/login') return navigateTo('/')
})
