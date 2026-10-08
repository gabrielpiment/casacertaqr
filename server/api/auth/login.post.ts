export default defineEventHandler(async (event) => {
  const { password } = (await readBody<{ password?: string }>(event)) ?? {}
  const { adminPassword } = useRuntimeConfig()

  if (!password || password !== adminPassword)
    throw createError({ statusCode: 401, message: 'Senha incorreta.' })

  setCookie(event, AUTH_COOKIE, authToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestProtocol(event) === 'https',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return { ok: true }
})
