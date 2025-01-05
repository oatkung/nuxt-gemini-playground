import fs from 'fs'
import path from 'path'
import vision from '@google-cloud/vision'
import type { MultiPartData } from 'h3'
import { GoogleAuth } from 'google-auth-library'


function getTempPath () {
  const config = useRuntimeConfig()
  if (!config.tempPath) {
    throw new Error('Missing TEMP_PATH environment variable');
  }

  return path.resolve(config.tempPath)
}

export function writeFileToTmp(file: MultiPartData) {
 
  if (!file.filename || !file.data || !file.type) {
    throw new Error('No file found')
  }
  const outputPath = getTempPath()
  const fileName = file.filename 
  const filePath = path.join(outputPath, fileName)

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath)
  }

  fs.writeFileSync(filePath, Buffer.from(file.data.buffer))

  return filePath
}

export function getBase64Decoded(data: string) {
  return JSON.parse(atob(data))
}

export async function extractTextFromImage(file: MultiPartData): Promise<string | undefined> {

  const filePath = writeFileToTmp(file)

  const config = useRuntimeConfig()

  if (!config.googleCloudCredentials) {
    throw new Error('Missing GOOGLE_CLOUD_CREDENTIALS environment variable');
  }
  
  const credentials = getBase64Decoded(config.googleCloudCredentials)

  const auth = new GoogleAuth({
    credentials: credentials as any,
  });
  
  const client = new vision.ImageAnnotatorClient({auth});


  const [page] = await client.textDetection(filePath);

  const textAnnotations = page.textAnnotations || []

  const description = textAnnotations[0].description ?? undefined

  return description
}


export async function downloadFile (url: string, filename: string) {

  const response = await fetch(url)
  const blob = await response.blob()

  const fullPath = path.join(getTempPath(), filename)
  
  fs.writeFileSync(fullPath, Buffer.from(await blob.arrayBuffer()))

  return fullPath

}