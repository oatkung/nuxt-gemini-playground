import axios from 'axios'
import zod from 'zod'
import { getGenAI } from '~/composables/geminiService'



export interface SummarizeRequest {
  url: string
}
export interface SummarizeResponse {
  message: string
}
async function summarizeFromUrl (url: string): Promise<string> {
  console.info('Begin')

  const { data } = await axios.get(url)

  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  
  const prompt = "Given the following html code and text, Summarize it into 4 sentences or fewer in Thai: " + data;
  const result = await model.generateContent(prompt);
  console.info('AI processing')
  console.info('Completed', result.response.text())
  return result.response.text()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // validate
  const schema = zod.object({
    url: zod.string().min(1),
  })
console.log('sdf')
  const parsedBody = schema.safeParse(body)


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