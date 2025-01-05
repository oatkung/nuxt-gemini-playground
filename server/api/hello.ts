import path from 'path'
import fs from 'fs'
import { downloadFile } from '~/utils/utils'

export default defineEventHandler(async (event) => {

  const body = await downloadFile('https://nuxt-gemini-playground.vercel.app/images/r1.jpg', 'r1.jpg')
  // base64 decode
  return {
    hello: 'world',
  }
})