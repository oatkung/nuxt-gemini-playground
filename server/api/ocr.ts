import { extractTextFromImage } from "~/utils/utils"





export default eventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  const file = body?.find((part) => part.name === 'file')

  if (!file || !file.filename || !file.data || !file.type) {
    throw new Error('No file found')
  }

  const description = await extractTextFromImage(file)
  return description
})