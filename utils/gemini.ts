import type { EnhancedGenerateContentResponse } from "@google/generative-ai";


export  function geminiStreamToReadStream(s: AsyncGenerator<EnhancedGenerateContentResponse, any, any>) {

  const stream = new ReadableStream({
    async start(controller) {

      for await (const item of s) {
        if (item.candidates) {
          controller.enqueue(item.candidates[0].content.parts[0].text);
        }
      }
      controller.close();
    },
    cancel() {
    },
  });

  return stream
}