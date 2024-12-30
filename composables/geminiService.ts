


import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold, } from '@google/generative-ai'

import axios from 'axios'


function getGenAI () {
  const config = useRuntimeConfig()
  if (!config.geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  return genAI
}


async function sentiment (text: string): Promise<string> {

  console.log(text)

  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-pro",
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



async function summarizeFromUrl (url: string): Promise<string> {
  console.info('Begin')
  console.log('API KEY: ' + useRuntimeConfig().geminiApiKey)

  const { data } = await axios.get(url)

  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  console.log(data)
  
  const prompt = "Given the following html code and text, Summarize it into 4 sentences or fewer in Thai: " + data;
  const result = await model.generateContent(prompt);
  console.info('AI processing')
  console.info('Completed', result.response.text())
  return result.response.text()
}

export const useGeminiService = () => {
  return {
    sentiment,
    summarizeFromUrl
  }
}