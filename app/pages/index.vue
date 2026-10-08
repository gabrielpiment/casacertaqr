<script setup lang="ts">
import type { WaLink } from '#shared/types/link'

useHead({ title: 'Painel · CasaCerta QR' })

const baseUrl = useShortUrlBase()
const { data: links, refresh } = await useFetch<WaLink[]>('/api/links', { default: () => [] })

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return links.value
  return links.value.filter(l => [l.name, l.slug, l.phone].some(v => v.toLowerCase().includes(q)))
})
const totalClicks = computed(() => links.value.reduce((sum, l) => sum + (l.clicks || 0), 0))

const formOpen = ref(false)
const editing = ref<WaLink | null>(null)

function openCreate() {
  editing.value = null
  formOpen.value = true
}
function openEdit(link: WaLink) {
  editing.value = link
  formOpen.value = true
}
async function onSaved() {
  formOpen.value = false
  await refresh()
}
async function onDelete(link: WaLink) {
  if (!confirm(`Excluir "${link.name}"?\n\nQR Codes já impressos com este link vão parar de funcionar.`)) return
  await $fetch(`/api/links/${link.slug}`, { method: 'DELETE' })
  await refresh()
}
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="relative min-h-screen">
    <div class="pointer-events-none fixed inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_65%)]" />

    <header class="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <div class="flex items-center gap-3">
          <AppLogo class="size-10" />
          <div class="leading-tight">
            <p class="font-semibold">CasaCerta QR</p>
            <p class="text-xs text-slate-400">QR Codes dinâmicos para WhatsApp</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="new-qr" type="button" class="btn btn-primary" @click="openCreate">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" /></svg>
            <span class="hidden sm:inline">Novo QR Code</span>
          </button>
          <button id="logout" type="button" class="btn btn-ghost" @click="logout">Sair</button>
        </div>
      </div>
    </header>

    <main class="relative mx-auto max-w-6xl px-4 py-10">
      <section class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Seus QR Codes
        </h1>
        <p class="mt-2 max-w-2xl text-slate-400">
          O QR Code aponta para um link fixo seu. Se o número cair, é só clicar em
          <span class="font-medium text-emerald-300">Trocar número</span> — nada precisa ser reimpresso.
        </p>
      </section>

      <section class="mb-8 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p class="text-sm text-slate-400">QR Codes ativos</p>
          <p class="mt-1 text-3xl font-bold">{{ links.length }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p class="text-sm text-slate-400">Acessos totais</p>
          <p class="mt-1 text-3xl font-bold text-emerald-300">{{ totalClicks }}</p>
        </div>
        <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-100/80">
          <p class="font-semibold text-emerald-200">Como funciona</p>
          <p class="mt-1">QR → <span class="font-mono text-xs">/r/código</span> → número atual no WhatsApp.</p>
        </div>
      </section>

      <div v-if="links.length" class="mb-6">
        <input id="search" v-model="search" type="search" class="input max-w-sm" placeholder="Buscar por nome, código ou número…">
      </div>

      <TransitionGroup
        v-if="filtered.length"
        tag="section"
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        enter-active-class="transition duration-300"
        enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-200"
        leave-to-class="opacity-0 scale-95"
      >
        <LinkCard
          v-for="link in filtered"
          :key="link.slug"
          :link="link"
          :base-url="baseUrl"
          @edit="openEdit"
          @delete="onDelete"
        />
      </TransitionGroup>

      <section v-else-if="!links.length" class="flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">
        <AppLogo class="mb-5 size-16 opacity-90" />
        <h2 class="text-xl font-semibold">Nenhum QR Code ainda</h2>
        <p class="mt-2 max-w-sm text-sm text-slate-400">Crie o primeiro e imprima sem medo: você poderá trocar o número quando quiser.</p>
        <button type="button" class="btn btn-primary mt-6" @click="openCreate">Criar primeiro QR Code</button>
      </section>

      <p v-else class="py-16 text-center text-slate-400">Nada encontrado para “{{ search }}”.</p>
    </main>

    <LinkForm :open="formOpen" :link="editing" :base-url="baseUrl" @close="formOpen = false" @saved="onSaved" />
  </div>
</template>
