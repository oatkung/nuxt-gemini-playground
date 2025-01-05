

import zod from 'zod'
import { getGenAI } from '~/composables/geminiService'
import axios from 'axios'


export interface SentimentRequest {
  message: string
}
export interface SentimentResponse {
  message: string
}

async function sentiment (text: string): Promise<string> {


  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 2,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          { text: "Analyze the sentiment of the following Tweets and classify them as POSITIVE, NEGATIVE, or NEUTRAL. Only respond with the sentiment and nothing else. \"It's so beautiful today!\"" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "POSITIVE" },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "\"It's so cold today I can't feel my feet...\"" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "NEGATIVE" },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "\"The weather today is perfectly adequate.\"" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "NEUTRAL" },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(text);
  return result.response.text()
}


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // validate
  const schema = zod.object({
    message: zod.string().min(1),
  })

  const parsedBody = schema.safeParse(body)


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