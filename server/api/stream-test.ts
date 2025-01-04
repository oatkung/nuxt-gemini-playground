import {
  defineEventHandler,
  sendStream,
  setResponseHeader,
} from "h3";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/html");
  setResponseHeader(event, "Cache-Control", "no-cache");
  setResponseHeader(event, "Transfer-Encoding", "chunked")

  const text = ['hello', 'hello 2', 'hello 3', 'hello 4', 'hello 5', 'hello 6', 'hello 7', 'hello 8', 'hello 9', 'hello 10']
  
  const stream = new ReadableStream({
    async start(controller) {
      

      for (let i = 0; i < text.length; i++) {
        controller.enqueue(new TextEncoder().encode(text[i]));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      controller.close();
      

    },
    cancel() {
    },
  });

  // stream.push(null)
  return sendStream(event, stream)
  
})