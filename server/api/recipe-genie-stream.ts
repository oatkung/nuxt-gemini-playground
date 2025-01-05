import zod from 'zod'
import fs from 'fs'
import path from 'path'

import { getGenAI, uploadToGemini } from '~/composables/geminiService'
import { geminiStreamToReadStream } from '~/utils/gemini'
import { writeFileToTmp } from '~/utils/utils'


export interface RecipeGenieRequest {
  file: any,
}
export interface RecipeGenieResponse {
  message: string
}

async function recipeGenie(filePath: string, memeType: string): Promise<ReadableStream> {
  
  const files = [
    await uploadToGemini(filePath, memeType),
  ];

  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
  });



  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };


  const chatSession = model.startChat({
    generationConfig,
    //   history: [
    //     // {
    //     //   role: "user",
    //     //   parts: [
    //     //     {
    //     //       fileData: {
    //     //         mimeType: files[0].mimeType,
    //     //         fileUri: files[0].uri,
    //     //       },
    //     //     },
    //     //     {text: "Accurately identify the baked good in the image and provide an appropriate recipe consistent with your analysis. "},
    //     //   ],
    //     // },
    //   ],
  });

  const result = await chatSession.sendMessageStream([
    {
      fileData: {
        mimeType: files[0].mimeType,
        fileUri: files[0].uri,
      },
    },
    {
      text: `
      Accurately identify the food in the image and provide an appropriate recipe consistent with your analysis.
      If picture that is not a food, just say I don't know.
      เขียนออกมาในภาษาไทย ในสไตล์อาจารย์ยิ่งศักดิ์ ที่ชอบพูด เช่น “มีอะไรก็ใส่ๆเข้าไปเถอะ ออกมาก็อร่อยหมดแหละคุณผู้ชม!”
“อยากกินอะไรก็ใส่ไปเถอะ กินได้ก็กิน กินไม่ได้ก็เททิ้งไป

      
      `,
    }
  ], {
    timeout: 30000,
  });


  const stream = geminiStreamToReadStream(result.stream)


  return stream
}


export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  const file = body?.find((part) => part.name === 'file')

  if (!file || !file.filename || !file.data || !file.type) {
    throw new Error('No file found')
  }

  const memeType = file.type

  const filePath = writeFileToTmp(file)
  
  const result = await recipeGenie(filePath, memeType)
  return sendStream(event, result)
})