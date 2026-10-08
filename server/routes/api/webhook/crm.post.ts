import { addTagToTicket, getTagIdByName } from '#server/utils/crm'

/**
 * Webhook receptor do Legendary Hub (CRM).
 * Configurar no painel do CRM para eventos de novos tickets / novas mensagens:
 * URL: https://seu-dominio/api/webhook/crm
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  console.log('[CRM Webhook Received]', JSON.stringify(body, null, 2))

  // Extrair ID do ticket de diferentes formatos comuns de payload do CRM
  const ticketId =
    body?.ticketId ||
    body?.ticket?.id ||
    body?.data?.ticket?.id ||
    body?.data?.id ||
    (body?.event?.includes('ticket') && body?.id) ||
    body?.id

  if (!ticketId) {
    console.warn('[CRM Webhook] Nenhum ticketId identificado no payload recebido.')
    return { ok: false, message: 'Nenhum ticketId encontrado no payload' }
  }

  // Extrair texto da mensagem para conferir se é lead do QR Code
  const messageText =
    body?.message?.body ||
    body?.data?.message?.body ||
    body?.ticket?.lastMessage ||
    body?.lastMessage ||
    body?.body ||
    ''

  try {
    // Buscar o ID da tag 'LEAD QRCODE'
    const tagId = await getTagIdByName('LEAD QRCODE')
    if (!tagId) {
      console.warn('[CRM Webhook] Tag "LEAD QRCODE" não encontrada na lista de tags do CRM.')
      return { ok: false, message: 'Tag "LEAD QRCODE" não encontrada no CRM.' }
    }

    // Associar a tag ao ticket
    const result = await addTagToTicket(ticketId, tagId)
    console.log(`[CRM Webhook] Tag ${tagId} ('LEAD QRCODE') adicionada com sucesso ao ticket ${ticketId}!`, result)

    return {
      success: true,
      ticketId,
      tagId,
      message: 'Tag adicionada ao ticket com sucesso',
    }
  }
  catch (err: any) {
    console.error(`[CRM Webhook Error] Falha ao taguear ticket ${ticketId}:`, err)
    return {
      ok: false,
      error: err.message || 'Erro ao processar webhook do CRM',
    }
  }
})
