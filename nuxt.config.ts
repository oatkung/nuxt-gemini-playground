// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    geminiApiKey: '', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      geminiApiKey: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    }
  },
})
