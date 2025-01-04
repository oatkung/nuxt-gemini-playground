import zod from 'zod'
import fs from 'fs'
import path from 'path'

import { getGenAI, uploadToGemini } from '~/composables/geminiService'
import { geminiStreamToReadStream } from '~/utils/gemini'


export interface RecipeGenieRequest {
  file: any,
}
export interface RecipeGenieResponse {
  message: string
}

async function recipeGenie (filePath: string, memeType: string): Promise<ReadableStream> {
    console.info('Begin')
    const sample = {
      path: path.join(path.resolve(), 'server/api/images', 'cookie.jpg'),
      memeType: 'image/jpeg'
    }
    const files = [
      // await uploadToGemini(sample.path, sample.memeType),
      await uploadToGemini(filePath, memeType),
    ];
  
    const model = getGenAI().getGenerativeModel({
      model: "gemini-1.5-pro",
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
        text: "Accurately identify the food in the image and provide an appropriate recipe consistent with your analysis. Answer in Thai only.",
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
    const outputPath = path.resolve('tmp')
      const fileName = file.filename
      const filePath = path.join(outputPath, fileName)

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath)
    }

    fs.writeFileSync(filePath, Buffer.from(file.data.buffer))

    const result = await recipeGenie(filePath, memeType)
    return sendStream(event, result)
})