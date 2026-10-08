<script setup lang="ts">
import type { WaLink } from '#shared/types/link'
import { buildWhatsAppUrl, normalizePhone } from '#shared/utils/whatsapp'

const props = defineProps<{ open: boolean, link: WaLink | null, baseUrl: string }>()
const emit = defineEmits<{ close: [], saved: [] }>()

const form = reactive({ name: '', phone: '', message: '', slug: '' })
const saving = ref(false)
const error = ref('')

const isEdit = computed(() => !!props.link)
const preview = computed(() => {
  const phone = normalizePhone(form.phone)
  return phone ? buildWhatsAppUrl(phone, form.message) : ''
})

watch(() => props.open, (open) => {
  if (!open) return
  error.value = ''
  form.name = props.link?.name ?? ''
  form.phone = props.link?.phone ?? ''
  form.message = props.link?.message ?? ''
  form.slug = ''
}, { immediate: true })

async function submit() {
  error.value = ''
  saving.value = true
  try {
    if (props.link) {
      await $fetch(`/api/links/${props.link.slug}`, {
        method: 'PUT',
        body: { name: form.name, phone: form.phone, message: form.message },
      })
    }
    else {
      await $fetch('/api/links', { method: 'POST', body: { ...form } })
    }
    emit('saved')
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Erro ao salvar.'
  }
  finally {
    saving.value = false
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm" @click.self="emit('close')">
        <form
          class="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8"
          @submit.prevent="submit"
        >
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold">{{ isEdit ? 'Editar QR Code' : 'Novo QR Code' }}</h2>
              <p class="mt-1 text-sm text-slate-400">
                {{ isEdit ? 'Troque o número à vontade — o QR Code impresso continua o mesmo.' : 'Crie um QR Code que aponta para o seu WhatsApp.' }}
              </p>
            </div>
            <button type="button" class="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar" @click="emit('close')">
              <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="isEdit" class="mb-5 rounded-xl bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 ring-1 ring-emerald-500/20">
            🔒 Link fixo do QR: <span class="font-mono">{{ baseUrl }}/r/{{ link?.slug }}</span>
          </div>

          <div class="space-y-4">
            <div>
              <label for="f-name" class="label">Nome / identificação</label>
              <input id="f-name" v-model="form.name" class="input" placeholder="Ex: Placa fachada, Panfleto loja 1" maxlength="80" required>
            </div>

            <div>
              <label for="f-phone" class="label">Número do WhatsApp</label>
              <input id="f-phone" v-model="form.phone" class="input" inputmode="tel" placeholder="(11) 91234-5678" required>
              <p class="mt-1.5 text-xs text-slate-500">DDD + número. Para outros países, inclua o DDI (ex: 351…).</p>
            </div>

            <div>
              <label for="f-message" class="label">Mensagem inicial <span class="font-normal text-slate-500">(opcional)</span></label>
              <textarea id="f-message" v-model="form.message" rows="3" class="input resize-none" placeholder="Olá! Vim pelo QR Code e gostaria de mais informações." maxlength="1000" />
            </div>

            <div v-if="!isEdit">
              <label for="f-slug" class="label">Código personalizado <span class="font-normal text-slate-500">(opcional)</span></label>
              <div class="flex items-center rounded-xl bg-slate-900/80 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-emerald-400/60">
                <span class="truncate pl-4 text-sm text-slate-500">/r/</span>
                <input id="f-slug" v-model="form.slug" class="w-full bg-transparent py-3 pr-4 text-sm outline-none placeholder:text-slate-600" placeholder="gerado automaticamente" pattern="[a-z0-9\-]{3,40}">
              </div>
              <p class="mt-1.5 text-xs text-slate-500">Não poderá ser alterado depois. Letras minúsculas, números e hífen.</p>
            </div>
          </div>

          <a v-if="preview" :href="preview" target="_blank" rel="noopener" class="mt-5 block truncate text-xs text-slate-500 hover:text-emerald-300">
            Destino: {{ preview }}
          </a>

          <p v-if="error" class="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ error }}</p>

          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Cancelar</button>
            <button id="form-submit" type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar QR Code' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>
