import type { WaLink, WaLinkInput } from '#shared/types/link'
import { normalizePhone } from '#shared/utils/whatsapp'

export const SLUG_RE = /^[a-z0-9-]{3,40}$/

// Fallback local caso a tabela ainda não tenha sido criada no Supabase
const localDb = () => useStorage<WaLink>('db')
const localKey = (slug: string) => `links:${slug}`

function mapFromDb(row: any): WaLink {
  return {
    slug: row.slug,
    name: row.name,
    phone: row.phone,
    message: row.message ?? '',
    clicks: Number(row.clicks ?? 0),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  }
}

function mapToDb(link: WaLink) {
  return {
    slug: link.slug,
    name: link.name,
    phone: link.phone,
    message: link.message ?? '',
    clicks: link.clicks ?? 0,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  }
}

function isTableMissingError(error: any) {
  return error?.code === 'PGRST205' || error?.message?.includes('schema cache') || error?.message?.includes('does not exist')
}

export async function listLinks(): Promise<WaLink[]> {
  try {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] Tabela "links" ainda não encontrada no Supabase. Usando armazenamento local temporário. Crie a tabela com supabase/schema.sql.')
        const keys = await localDb().getKeys('links')
        const items = await Promise.all(keys.map(k => localDb().getItem(k)))
        return items.filter((l): l is WaLink => !!l).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      }
      throw error
    }

    return (data || []).map(mapFromDb)
  }
  catch (err: any) {
    if (isTableMissingError(err)) {
      const keys = await localDb().getKeys('links')
      const items = await Promise.all(keys.map(k => localDb().getItem(k)))
      return items.filter((l): l is WaLink => !!l).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
    console.error('[Supabase listLinks error]', err)
    throw createError({ statusCode: 500, message: `Erro ao buscar links no Supabase: ${err.message}` })
  }
}

export async function getLink(slug: string): Promise<WaLink | null> {
  try {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      if (isTableMissingError(error)) {
        return (await localDb().getItem(localKey(slug))) ?? null
      }
      throw error
    }

    return data ? mapFromDb(data) : null
  }
  catch (err: any) {
    if (isTableMissingError(err)) {
      return (await localDb().getItem(localKey(slug))) ?? null
    }
    console.error('[Supabase getLink error]', err)
    return null
  }
}

export async function saveLink(link: WaLink): Promise<WaLink> {
  try {
    const supabase = useSupabase()
    const payload = mapToDb(link)
    const { error } = await supabase
      .from('links')
      .upsert(payload, { onConflict: 'slug' })

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] Tabela "links" não encontrada. Salvando no armazenamento local temporário.')
        await localDb().setItem(localKey(link.slug), link)
        return link
      }
      throw error
    }

    return link
  }
  catch (err: any) {
    if (isTableMissingError(err)) {
      await localDb().setItem(localKey(link.slug), link)
      return link
    }
    console.error('[Supabase saveLink error]', err)
    throw createError({ statusCode: 500, message: `Erro ao salvar no Supabase: ${err.message}` })
  }
}

export async function deleteLink(slug: string): Promise<void> {
  try {
    const supabase = useSupabase()
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('slug', slug)

    if (error) {
      if (isTableMissingError(error)) {
        await localDb().removeItem(localKey(slug))
        return
      }
      throw error
    }

    // Limpa também local se houver
    await localDb().removeItem(localKey(slug)).catch(() => {})
  }
  catch (err: any) {
    if (isTableMissingError(err)) {
      await localDb().removeItem(localKey(slug))
      return
    }
    console.error('[Supabase deleteLink error]', err)
    throw createError({ statusCode: 500, message: `Erro ao excluir no Supabase: ${err.message}` })
  }
}

export function generateSlug(size = 6): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(bytes, b => chars[b % chars.length]).join('')
}

export function validateInput(body: Partial<WaLinkInput> | undefined) {
  const name = String(body?.name ?? '').trim()
  const phone = normalizePhone(String(body?.phone ?? ''))
  const message = String(body?.message ?? '').trim()

  if (!name) throw createError({ statusCode: 400, message: 'Informe um nome para o QR Code.' })
  if (name.length > 80) throw createError({ statusCode: 400, message: 'Nome muito longo (máx. 80).' })
  if (phone.length < 12 || phone.length > 15)
    throw createError({ statusCode: 400, message: 'Número inválido. Use DDD + número, ex: 11 91234-5678.' })
  if (message.length > 1000) throw createError({ statusCode: 400, message: 'Mensagem muito longa (máx. 1000).' })

  return { name, phone, message }
}
