declare module 'nuxt/schema' {
  interface RuntimeConfig {
    geminiApiKey: string,
    tempPath: string,
    googleCloudCredentials
  }
  interface PublicRuntimeConfig {
    geminiApiKey: string
  }
}
// It is always important to ensure you import/export something when augmenting a type
export { }