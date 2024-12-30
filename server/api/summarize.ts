import zod from 'zod'
import { useGeminiService } from '~/composables/geminiService'



export interface SummarizeRequest {
  url: string
}
export interface SummarizeResponse {
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // validate
  const schema = zod.object({
    url: zod.string().min(1),
  })
console.log('sdf')
  const parsedBody = schema.safeParse(body)

  const { summarizeFromUrl } = useGeminiService()

  if (!parsedBody.success) {
    return {
      error: parsedBody.error.message
    }
  }
  const result = await summarizeFromUrl(parsedBody.data.url)
  return {
    message:  result
  } as SummarizeResponse
})