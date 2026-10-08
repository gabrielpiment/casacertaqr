<script setup lang="ts">
useHead({ title: 'Entrar · CasaCerta QR' })

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/')
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Não foi possível entrar.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden px-4">
    <div class="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

    <form
      class="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl"
      @submit.prevent="submit"
    >
      <div class="mb-8 flex flex-col items-center text-center">
        <AppLogo class="mb-4 size-14" />
        <h1 class="text-2xl font-bold">CasaCerta QR</h1>
        <p class="mt-1 text-sm text-slate-400">QR Codes dinâmicos para WhatsApp</p>
      </div>

      <label for="password" class="label">Senha</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="input"
        placeholder="••••••••"
        autofocus
        required
      >

      <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>

      <button id="login-submit" type="submit" class="btn btn-primary mt-6 w-full" :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  </main>
</template>
