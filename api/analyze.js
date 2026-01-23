import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.AIzaSyCiFQZYP-NJIyn6T9wnePNfh5fhQs5PLtQ)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const { symbol, years } = req.body

  const model = genAI.getGenerativeModel({
    model: "gemini 3 Pro Preview"
  })

  const prompt = `
  請以專業投資研究報告格式
  分析股票 ${symbol}
  回測最近 ${years} 年
  提供趨勢、風險與投資建議
  `

  const result = await model.generateContent(prompt)

  res.status(200).json({
    result: result.response.text()
  })
}
