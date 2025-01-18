import path from 'path'
import fs from 'fs'

// https://nuxt.com/docs/api/configuration/nuxt-config

const ENABLE_SSL = process.env.ENABLE_SSL || false

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@pinia/nuxt', 'nuxt-rate-limit'],
  devServer: {
    port: 8055,
  },

  nuxtRateLimit: {
    routes: {
      '/api/*': {
        maxRequests: 15,
        intervalSeconds: 60,
      },
    },
  },
  
  runtimeConfig: {
    geminiApiKey: '',
    tempPath: '',
    googleCloudCredentials: '',
    public: {
      geminiApiKey: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    }
  },
})