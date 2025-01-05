import path from 'path'

export default defineEventHandler((event) => {


  // base64 decode
  return {
    currentPath: process.cwd(),
    currentPath2: path.join(''),
    hello: 'world'
  }
})