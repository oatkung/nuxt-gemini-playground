import zod from 'zod'
import fs from 'fs'
import path from 'path'

import { getGenAI, uploadToGemini } from '~/composables/geminiService'


export interface RecipeGenieRequest {
  file: any,
}
export interface RecipeGenieResponse {
  message: string
}

async function runModel (filePath: string, memeType: string): Promise<string> {
    console.info('Begin')
    const sample = {
      path: path.join(path.resolve(), 'server/api/images', 'r1.webp'),
      memeType: 'image/webp'
    }
    const files = [
      await uploadToGemini(sample.path, sample.memeType),
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

    const exampleJson = {
      storeName: 'After You -Central Ladprao',
      tell: '02-937-1547',
      date: '15/09/13 17:36',
      receiptNo: 'RC07092556/00351',
      cashier: '5050 Trainee Cashier',
      items: [
        {
          name: 'Ferrero Toast',
          amount: 1,
          totalAmout: 245.00
        }
      ],
      total: 245.00
    }
  
    const exampleOutput = `
      Analyze the provided receipt image. 
      Extract the following information and present it in a JSON format:
    
      **Example JSON output:**
      * **storeName**: The name of the store
      * **tell**: The store's telephone number
      * **date**: The date and time of the transaction
      * **receiptNo**: The receipt number
      * **cashier**: The name of the cashier
      * **items**: An array of objects containing the following fields:
        *  **name**: The name of the item
        * **amount**: The quantity of the item
        * **totalAmount**: The total amount for the item
      * **total**: The total amount of the transaction
      
      ${JSON.stringify(exampleJson, null, 2)}

      **Note:** Ensure the JSON output is well-formatted and adheres to the specified structure.
      Do not include any additional information in the output.
      If you are unable to extract any of the information, leave the corresponding field null.
    `

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: files[0].mimeType,
                fileUri: files[0].uri,
              },
            },
            {text: exampleOutput},
          ],
        },
        {
          role: "model",
          parts: [
            { text: JSON.stringify(exampleJson, null, 2)},
          ],
        }
      ],
    });
  
    const result = await chatSession.sendMessage([
      {
        fileData: {
          mimeType: files[1].mimeType,
          fileUri: files[1].uri,
        },
      },
      {
        text: `
          Analyze the provided receipt image.
          Extract the following information and present it in a JSON format:

          Do the job same as the example above
        `,
      }
    ], {
      timeout: 30000,
    });
    return result.response.text()
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

    const result = await runModel(filePath, memeType)
    return {
        message:  result
    } as RecipeGenieResponse
})