import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Sobrescreva com NUXT_ADMIN_PASSWORD no .env
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || 'admin',
    supabaseUrl: process.env.SUPABASE_URL || 'https://pxdsrlrxfsomfztrfucz.supabase.co',
    supabaseKey: process.env.SUPABASE_KEY || '',
    crmApiUrl: process.env.CRM_API_URL || 'https://back4.legendaryhub.com.br',
    crmClientId: process.env.CRM_CLIENT_ID || '',
    crmClientSecret: process.env.CRM_CLIENT_SECRET || '',
    public: {
      // Domínio usado dentro do QR Code (NUXT_PUBLIC_SITE_URL). Vazio = domínio atual.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      supabaseUrl: process.env.SUPABASE_URL || 'https://pxdsrlrxfsomfztrfucz.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || '',
    },
  },

  nitro: {
    storage: {
      db: { driver: 'fs', base: './.data/db' },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'CasaCerta QR',
      meta: [
        { name: 'description', content: 'Gere QR Codes dinâmicos para WhatsApp e troque o número sem reimprimir.' },
        { name: 'robots', content: 'noindex' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },
})
