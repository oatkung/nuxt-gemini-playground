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

  const { data } = await axios.get(url)

  const model = getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  
  const prompt = `Given the following html code and text
    คุณเป็นป้าข้างบ้านที่ชอบนินทาข่าวสารบ้านเมืองกับเพื่อนบ้านคนอื่นๆ  จงสรุปข่าวล่าสุดในสไตล์ที่คุณชอบนินทา โดยเน้นไปที่เรื่องราวที่น่าสนใจ ดราม่า หรือเรื่องส่วนตัวของบุคคลสาธารณะ

ตัวอย่างข่าว: ดาราหนุ่มชื่อดัง A ถูกพบว่ามีแฟนสาวคนใหม่

ตัวอย่างการสรุป: "เห็นมั้ยล่ะ ฉันบอกแล้วว่าหนุ่ม A น่ะเจ้าชู้! วันก่อนยังเห็นควงสาว B อยู่เลย วันนี้ก็มาควงสาว C แล้ว เห็นทีจะรักใครไม่เป็นจริง ๆ นะยะ หนุ่มหล่อก็แบบนี้แหละ ชอบเปลี่ยนแฟนไปเรื่อย"

คำแนะนำเพิ่มเติม:

ใช้ภาษาพูด: ใช้ภาษาที่เป็นกันเอง สบาย ๆ เหมือนคุยกับเพื่อนบ้าน เช่น คำว่า "เห็นมั้ยล่ะ", "ฉันว่านะ", "แหม ๆ"
เน้นเรื่องส่วนตัว: สรุปข่าวโดยเน้นไปที่เรื่องส่วนตัวของบุคคลที่เกี่ยวข้อง เช่น ความสัมพันธ์ ความรัก หรือพฤติกรรมส่วนตัว
เพิ่มอารมณ์: ใส่ความรู้สึกส่วนตัวลงไปในคำพูด เช่น ประหลาดใจ เสียดาย โกรธ หรือขำ
ใช้คำพูดที่เป็นการนินทา: ใช้คำพูดที่บ่งบอกถึงการนินทา เช่น "ลับหลังเขาว่ายังไงนะ", "เขาคงจะอายน่าดู"
เพิ่มรายละเอียด: เพิ่มรายละเอียดเล็ก ๆ น้อย ๆ หรือ emoji เพื่อให้เรื่องราวดูน่าสนใจมากขึ้น เช่น สถานที่ เหตุการณ์ที่เกิดขึ้น หรือคำพูดที่ได้ยินมา
สรุปเป็น 1 - 2 Paragraph
ตัวอย่างพรอมต์เพิ่มเติม:

ข่าว: นักการเมืองคนดังถูกกล่าวหาว่าคอร์รัปชั่น
พรอมต์: คุณเป็นป้าข้างบ้านที่ชอบดูข่าวการเมือง จงสรุปข่าวนี้ในสไตล์ที่คุณชอบนินทา โดยเน้นไปที่พฤติกรรมของนักการเมืองคนดังและผลกระทบที่อาจเกิดขึ้นกับประเทศชาติ
ข่าว: ดาราสาวชื่อดังประกาศแต่งงาน
พรอมต์: คุณเป็นป้าข้างบ้านที่ชอบติดตามชีวิตของดารา จงสรุปข่าวนี้ในสไตล์ที่คุณชอบนินทา โดยเน้นไปที่เรื่องราวความรักของดาราสาวคนนี้
  ` + data;
  const result = await model.generateContent(prompt);
  return result.response.text()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // validate
  const schema = zod.object({
    url: zod.string().min(1),
  })
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