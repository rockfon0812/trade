
import { GoogleGenAI, Type } from "@google/genai";
import { BacktestResult, StrategyParams, AIAnalysisResult, ThemeCandidate, SectorAnalysisResult } from "../types";

// 環境偵測：是否有本地 API Key
const LOCAL_API_KEY = process.env.API_KEY;
const IS_LOCAL_MODE = !!LOCAL_API_KEY;

export const analyzeSectorStrategyWithGemini = async (themeName: string, candidates: ThemeCandidate[], params: StrategyParams): Promise<SectorAnalysisResult> => {
  const sorted = [...candidates].filter(c => c.status === 'NORMAL');
  const representative = [
    ...sorted.slice(0, 5).map(c => ({ name: c.name, return: c.backtest?.totalReturn, winRate: c.backtest?.winRate, status: 'TOP_PERFORMER' })),
    ...sorted.slice(-2).map(c => ({ name: c.name, return: c.backtest?.totalReturn, winRate: c.backtest?.winRate, status: 'LAGGING' }))
  ];

  // 定義本地開發時的邏輯 (Admin Only)
  const localExecution = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
      const prompt = `
        族群: ${themeName}
        回測區間: ${params.startYear} ~ ${params.endYear}
        量化數據摘要: ${JSON.stringify(representative)}
        
        請扮演一位【資深證券投顧研究員】，針對此族群撰寫一份「法人級深度研究報告」。
        內容需包含：趨勢判斷、信心指數、族群概況、市場表現、成分股分析、技術/籌碼/基本面分析、風險與策略。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          systemInstruction: "你是一位頂尖的金融量化分析師。請輸出符合 Schema 定義的嚴謹 JSON 格式報告。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sectorTrend: { type: Type.STRING, description: "BULLISH, BEARISH, or NEUTRAL" },
              trendReason: { type: Type.STRING, description: "趨勢判斷的一句話簡評" },
              confidenceScore: { type: Type.NUMBER, description: "0-100 的信心指數" },
              overview: { type: Type.STRING, description: "1. 族群概況" },
              marketPerformance: { type: Type.STRING, description: "2. 近期表現" },
              componentAnalysis: { type: Type.STRING, description: "3. 成分股分析" },
              technicalAnalysis: { type: Type.STRING, description: "4. 技術面" },
              chipAnalysis: { type: Type.STRING, description: "5. 籌碼面" },
              fundamentalAnalysis: { type: Type.STRING, description: "6. 基本面" },
              riskFactors: { type: Type.STRING, description: "7. 風險因子" },
              strategyAdvice: { type: Type.STRING, description: "8. 操作策略建議" }
            },
            required: ["sectorTrend", "trendReason", "confidenceScore", "overview", "marketPerformance", "componentAnalysis", "technicalAnalysis", "chipAnalysis", "fundamentalAnalysis", "riskFactors", "strategyAdvice"]
          }
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("[AI] Local Sector Analysis failed:", error);
      throw error;
    }
  };

  // 本地模式直接執行，公開模式依賴環境變數配置
  if (IS_LOCAL_MODE) {
    console.log(`[DevMode] Direct Sector Analysis`);
    return localExecution();
  } else {
    console.warn("[PublicMode] Sector Analysis requires GEMINI_API_KEY environment variable. Returning default response.");
    return { 
      sectorTrend: 'NEUTRAL',
      trendReason: '無法進行 AI 分析 - 請在 Vercel 環境變數中設置 GEMINI_API_KEY',
      confidenceScore: 0,
      overview: "分析服務暫時無法使用",
      marketPerformance: "N/A",
      componentAnalysis: "N/A",
      technicalAnalysis: "N/A",
      chipAnalysis: "N/A",
      fundamentalAnalysis: "N/A",
      riskFactors: "N/A",
      strategyAdvice: "請稍後再試",
    };
  }
};

export const analyzeStrategyWithGemini = async (result: BacktestResult, params: StrategyParams): Promise<AIAnalysisResult> => {
  // 定義本地開發時的邏輯 (Admin Only)
  const localExecution = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
      const prompt = `
        請撰寫一份專業的個股投資研究報告。
        標的: ${params.symbol}
        回測區間: ${params.startYear} ~ ${params.endYear}
        回測結果: 總報酬 ${result.totalReturn}%, 勝率 ${result.winRate}%, 最大回撤 ${result.maxDrawdown}%, Sharpe Ratio ${result.sharpeRatio}。
        請模擬券商法人研究報告的語氣，包含：公司簡介、產業地位、財務、成長性、競爭優勢、風險、投資建議、目標區間。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          systemInstruction: "你是一位頂尖的華爾街投資分析師。請輸出符合 Schema 定義的嚴謹 JSON 格式報告。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: {
                type: Type.OBJECT,
                properties: {
                  companyProfile: { type: Type.STRING },
                  industryPosition: { type: Type.STRING },
                  financialAnalysis: { type: Type.STRING },
                  growthPotential: { type: Type.STRING },
                  competitiveAdvantage: { type: Type.STRING },
                  riskFactors: { type: Type.STRING },
                  investmentAdvice: { type: Type.STRING },
                  targetPriceZone: { type: Type.STRING }
                },
                required: ["companyProfile", "industryPosition", "financialAnalysis", "growthPotential", "competitiveAdvantage", "riskFactors", "investmentAdvice", "targetPriceZone"]
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      return { report: undefined };
    }
  };

  // 本地模式直接執行，公開模式依賴環境變數配置
  if (IS_LOCAL_MODE) {
    console.log(`[DevMode] Direct AI Analysis`);
    return localExecution();
  } else {
    console.warn("[PublicMode] AI Analysis requires GEMINI_API_KEY environment variable. Returning default response.");
    return { 
      report: {
        companyProfile: "無法進行 AI 分析 - 請在 Vercel 環境變數中設置 GEMINI_API_KEY",
        industryPosition: "N/A",
        financialAnalysis: "N/A",
        growthPotential: "N/A",
        competitiveAdvantage: "N/A",
        riskFactors: "N/A",
        investmentAdvice: "N/A",
        targetPriceZone: "N/A"
      }
    };
  }
};

export const resolveSymbolFromGemini = async (input: string): Promise<string> => {
  if (!IS_LOCAL_MODE) {
    console.warn("[PublicMode] Symbol resolution requires GEMINI_API_KEY. Please set it in environment variables.");
    return "ERROR";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `將 "${input}" 轉換為 Yahoo Finance 代號（如 2330.TW）。僅回傳代號，不要有其他文字。` 
    });
    return response.text?.trim() || "ERROR";
  } catch (error) {
    console.error("Symbol resolution failed:", error);
    return "ERROR";
  }
};
