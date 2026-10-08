<script setup lang="ts">
import QRCode from 'qrcode'
import type { WaLink } from '#shared/types/link'
import { buildWhatsAppUrl, formatPhone } from '#shared/utils/whatsapp'

const props = defineProps<{ link: WaLink, baseUrl: string }>()
const emit = defineEmits<{ edit: [WaLink], delete: [WaLink] }>()

const shortUrl = computed(() => `${props.baseUrl}/r/${props.link.slug}`)
const waUrl = computed(() => buildWhatsAppUrl(props.link.phone, props.link.message))
const updated = computed(() =>
  new Date(props.link.updatedAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
)

const qrOptions = {
  margin: 2,
  errorCorrectionLevel: 'M' as const,
  color: { dark: '#052e1c', light: '#ffffff' },
}

const qr = ref('')
onMounted(() => {
  watch(shortUrl, async (url) => {
    qr.value = await QRCode.toDataURL(url, { ...qrOptions, width: 1024 })
  }, { immediate: true })
})

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

function downloadPng() {
  download(qr.value, `qrcode-${props.link.slug}.png`)
}

async function downloadSvg() {
  const svg = await QRCode.toString(shortUrl.value, { ...qrOptions, type: 'svg' })
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  download(url, `qrcode-${props.link.slug}.svg`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(shortUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <article class="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-emerald-500/5">
    <div class="flex gap-4">
      <div class="shrink-0 rounded-xl bg-white p-1.5 shadow-lg transition group-hover:scale-[1.03]">
        <img v-if="qr" :src="qr" :alt="`QR Code ${link.name}`" class="size-28">
        <div v-else class="size-28 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div class="min-w-0 flex-1">
        <h3 class="truncate text-base font-semibold" :title="link.name">{{ link.name }}</h3>
        <p class="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
          {{ formatPhone(link.phone) }}
        </p>
        <p v-if="link.message" class="mt-1.5 line-clamp-2 text-xs text-slate-400">“{{ link.message }}”</p>
        <p class="mt-2 text-xs text-slate-500">
          <span class="font-semibold text-slate-300">{{ link.clicks }}</span> {{ link.clicks === 1 ? 'acesso' : 'acessos' }}
          · atualizado {{ updated }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="mt-4 flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-slate-900/80 px-3 py-2 text-left font-mono text-xs text-slate-300 ring-1 ring-white/10 transition hover:ring-emerald-400/40"
      title="Copiar link do QR Code"
      @click="copy"
    >
      <span class="truncate">{{ shortUrl }}</span>
      <span class="shrink-0 font-sans font-medium" :class="copied ? 'text-emerald-300' : 'text-slate-500'">
        {{ copied ? 'Copiado!' : 'Copiar' }}
      </span>
    </button>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <button :id="`edit-${link.slug}`" type="button" class="btn btn-primary col-span-2" @click="emit('edit', link)">
        <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
        Trocar número
      </button>
      <button type="button" class="btn btn-ghost" :disabled="!qr" @click="downloadPng">PNG</button>
      <button type="button" class="btn btn-ghost" @click="downloadSvg">SVG</button>
      <a :href="waUrl" target="_blank" rel="noopener" class="btn btn-ghost">Testar</a>
      <button :id="`delete-${link.slug}`" type="button" class="btn btn-danger" @click="emit('delete', link)">Excluir</button>
    </div>
  </article>
</template>
