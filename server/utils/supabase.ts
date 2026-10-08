import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export function useSupabase() {
  if (client) return client

  const config = useRuntimeConfig()
  const url = (config.supabaseUrl as string) || process.env.SUPABASE_URL || 'https://pxdsrlrxfsomfztrfucz.supabase.co'
  const key = (config.supabaseKey as string) || process.env.SUPABASE_KEY || ''

  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return client
}
