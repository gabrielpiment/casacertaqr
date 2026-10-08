interface CrmTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  error?: string
  error_description?: string
}

interface CrmTag {
  id: number
  name: string
  color?: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

export function getCrmConfig() {
  const config = useRuntimeConfig()
  const apiUrl = (process.env.CRM_API_URL || config.crmApiUrl || 'https://back4.legendaryhub.com.br').replace(/\/+$/, '')
  const clientId = process.env.CRM_CLIENT_ID || config.crmClientId || ''
  const clientSecret = process.env.CRM_CLIENT_SECRET || config.crmClientSecret || ''
  return { apiUrl, clientId, clientSecret }
}

/**
 * Obtém o Bearer Token (JWT) do CRM usando client_credentials.
 * Faz cache do token para não autenticar a cada requisição.
 */
export async function getCrmToken(): Promise<string> {
  const { apiUrl, clientId, clientSecret } = getCrmConfig()

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      message: 'CRM_CLIENT_ID ou CRM_CLIENT_SECRET não configurados no servidor.',
    })
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token
  }

  const res = await fetch(`${apiUrl}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  const data = (await res.json()) as CrmTokenResponse
  if (!res.ok || !data.access_token) {
    console.error('[CRM Token Error]', res.status, data)
    throw createError({
      statusCode: res.status || 500,
      message: `Erro ao autenticar no CRM: ${data.error_description || data.error || 'Falha na autenticação'}`,
    })
  }

  const expiresInMs = (data.expires_in || 3600) * 1000
  cachedToken = {
    token: data.access_token,
    expiresAt: now + expiresInMs,
  }

  return cachedToken.token
}

/**
 * Busca a lista de tags no CRM e localiza o ID da tag pelo nome (case-insensitive).
 */
export async function getTagIdByName(tagName: string): Promise<number | null> {
  const { apiUrl } = getCrmConfig()
  const token = await getCrmToken()

  // Tentativa primária no endpoint /api/v1/tags
  let res = await fetch(`${apiUrl}/api/v1/tags`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    // Fallback para /api/tagList
    res = await fetch(`${apiUrl}/api/tagList`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  if (!res.ok) {
    const errText = await res.text()
    console.error('[CRM tagList Error]', res.status, errText)
    // Se falhar e a tag procurada for LEAD QRCODE, usamos o ID 974 verificado
    if (tagName.trim().toLowerCase() === 'lead qrcode') return 974
    throw createError({ statusCode: res.status, message: `Erro ao listar tags no CRM: ${errText}` })
  }

  const data = (await res.json()) as any
  const tags: CrmTag[] = data?.data || data?.tags?.tags || data?.tags || data || []

  const target = tagName.trim().toLowerCase()
  const found = tags.find(t => t.name && t.name.trim().toLowerCase() === target)

  return found ? found.id : (target === 'lead qrcode' ? 974 : null)
}

/**
 * Adiciona uma tag a um ticket no CRM.
 * POST https://back4.legendaryhub.com.br/api/v1/tickets/<id>/tags
 * Body: { tagId: <id> }
 */
export async function addTagToTicket(ticketId: string | number, tagId: number) {
  const { apiUrl } = getCrmConfig()
  const token = await getCrmToken()

  const res = await fetch(`${apiUrl}/api/v1/tickets/${ticketId}/tags`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagId }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error(`[CRM Tag Add Error] Ticket ${ticketId}:`, res.status, errText)
    throw createError({ statusCode: res.status, message: `Erro ao adicionar tag no ticket ${ticketId}: ${errText}` })
  }

  return await res.json()
}
