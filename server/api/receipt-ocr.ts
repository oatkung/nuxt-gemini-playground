import zod from 'zod'
import fs from 'fs'
import path from 'path'
import type { H3Event, EventHandlerRequest, MultiPartData } from 'h3'

import { getGenAI, uploadToGemini } from '~/composables/geminiService'
import { extractTextFromImage, writeFileToTmp } from '~/utils/utils'


export interface RecipeGenieRequest {
  file: any,
}
export interface RecipeGenieResponse {
  message: string,
  ocr?: string
}

async function runModel(
  filePath: string, 
  memeType: string, 
  option?: { ocr?: string }
): Promise<string> {
  const sample = {
    path: path.join(process.cwd(), 'public', 'images', 'r1.webp'),
    memeType: 'image/webp'
  }

  if (!fs.existsSync(sample.path)) {
    throw new Error('File not found')
  }
  const files = [
    await uploadToGemini(sample.path, sample.memeType),
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
        totalAmount: 245.00
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
        * **totalAmount**: The total amount for the item and if it is a discount, then it must be negative value
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
          { text: exampleOutput },
        ],
      },
      {
        role: "model",
        parts: [
          { text: JSON.stringify(exampleJson, null, 2) },
        ],
      }
    ],
  });

  let ocrPrompt = ''

  if (option?.ocr) {
    ocrPrompt += 'And use this text that extracted from OCR. It might be useful for the analysis: \n'
    ocrPrompt += `ocr: ${option?.ocr}\n'`
    ocrPrompt += 'If you you found misspelled words , please correct it before use it in with the analysis.\n'
  }

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

          ${ocrPrompt}
        `,
    }
  ], {
    timeout: 30000,
  });
  return result.response.text()
}

async function multipartDataToObject(event: H3Event<EventHandlerRequest>) {
  const files = await readMultipartFormData(event)
  const body = await readBody(event)
  type ItemValue = MultiPartData | string
  const result = {} as { [key: string]: ItemValue | ItemValue[]  }
  if (!files) {
    return result
  }


  for (const part of files) {
    const name = part.name ?? ''

    const isFile = part.type !== undefined
    

    const data = isFile ? part : part.data.toString()
    if (Array.isArray(result[name])) {
      result[name].push(data)
    } else if (!result[name]) {
      result[name] = data
    } else if (result[name]) {
      result[name] = [result[name], data]
    }
  }

  return result

}

export default defineEventHandler(async (event) => {
  
  const body = await multipartDataToObject(event) as {
    file: MultiPartData,
    ocr?: string
  }

  const { file, ocr } = body


  if (!file || !file.filename || !file.data || !file.type) {
    throw new Error('No file found')
  }



  const memeType = file.type
  const filePath = writeFileToTmp(file)

  let textFromOcr = undefined 
  if (ocr === 'true') {
    textFromOcr = await extractTextFromImage(file)
  }

  const result = await runModel(filePath, memeType, {
    ocr: textFromOcr
  })
  return {
    ocr: textFromOcr,
    message: result
  } as RecipeGenieResponse
})