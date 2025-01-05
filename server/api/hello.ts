import path from 'path'
import fs from 'fs'

export default defineEventHandler((event) => {


  // base64 decode
  return {
    currentPath: process.cwd(),
    currentPath2: path.join(''),
    hello: 'world',
    dir: fs.readdirSync(process.cwd())
  }
})