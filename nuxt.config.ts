import path from 'path'
import fs from 'fs'

// https://nuxt.com/docs/api/configuration/nuxt-config

const ENABLE_SSL = process.env.ENABLE_SSL || false

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-markdown-render',
  ],
  devServer: {
    port: 8055,
    https: ENABLE_SSL ? {
      key: fs.readFileSync(path.resolve(__dirname, 'server.key'), 'utf8'),
      cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'), 'utf8')
    } : false
  },
  
  runtimeConfig: {
    geminiApiKey: '', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      geminiApiKey: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    }
  },
})
