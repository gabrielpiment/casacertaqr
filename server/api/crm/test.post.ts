import { addTagToTicket, getCrmToken, getTagIdByName } from '#server/utils/crm'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = (await readBody<{ ticketId?: string | number }>(event)) || {}

  try {
    // 1. Testar autenticação e pegar token
    const token = await getCrmToken()

    // 2. Buscar ID da tag 'LEAD QRCODE'
    const tagId = await getTagIdByName('LEAD QRCODE')

    let tagResult = null
    if (body.ticketId && tagId) {
      tagResult = await addTagToTicket(body.ticketId, tagId)
    }

    return {
      authenticated: !!token,
      tagFound: !!tagId,
      tagId,
      ticketTagged: tagResult,
      message: tagId
        ? `Tag "LEAD QRCODE" localizada com ID ${tagId}`
        : 'Aviso: Tag "LEAD QRCODE" não foi encontrada no CRM. Verifique se o nome está idêntico.',
    }
  }
  catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro ao conectar no CRM',
    }
  }
})
