

import path from 'path'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai'
import axios from 'axios';
import { GoogleAIFileManager }  from "@google/generative-ai/server"

export function getApiKey() {
  const config = useRuntimeConfig()
  if (!config.geminiApiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  return config.geminiApiKey
}

export async function uploadToGemini(path: string, mimeType: string) {

  const fileManager = new GoogleAIFileManager(getApiKey());
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

export  function getGenAI () {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI
}
