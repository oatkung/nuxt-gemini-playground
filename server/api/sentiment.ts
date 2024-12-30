

import zod from 'zod'
import { useGeminiService } from '~/composables/geminiService'



export interface SentimentRequest {
  message: string
}
export interface SentimentResponse {
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // validate
  const schema = zod.object({
    message: zod.string().min(1),
  })

  const parsedBody = schema.safeParse(body)

  const { sentiment } = useGeminiService()

  if (!parsedBody.success) {
    return {
      error: parsedBody.error.message
    }
  }
  const result = await sentiment(parsedBody.data.message)
  return {
    message: result
  }
})