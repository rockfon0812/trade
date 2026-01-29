
import { StockData } from '../types';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const marketCache: Record<string, string> = {};

// 檢查是否為公開部署模式 (無 API Key 視為公開模式，通常此時會有後端 Proxy)
const IS_PUBLIC_MODE = !process.env.API_KEY;

export const fetchStockData = async (
  symbol: string,
  startYear: number,
  endYear: number
): Promise<StockData[]> => {
  let input = symbol.trim().toUpperCase();
  if (!input) throw new Error("請輸入股票代號。");

  let pureCode = input.replace(/(\.TW|\.TWO)$/i, '');
  let tickersToTry: string[] = marketCache[pureCode] 
    ? [marketCache[pureCode]] 
    : [/^\d{4}$/.test(pureCode) ? `${pureCode}.TW` : input, `${pureCode}.TWO`].filter(Boolean);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 定義 Proxy 生成器
  const proxyGenerators = [
    // 優先策略：若是公開模式，嘗試使用自家後端 Proxy (最穩定)
    ...(IS_PUBLIC_MODE ? [(url: string) => `/api/proxy?url=${encodeURIComponent(url)}`] : []),
    // 備援策略：使用公開 CORS Proxy (開發用)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];

  for (const ticker of tickersToTry) {
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=max&events=history&includeAdjustedClose=true`;
    
    for (const generateProxyUrl of proxyGenerators) {
      try {
        const fetchUrl = generateProxyUrl(baseUrl);
        // 若使用 corsproxy.io 需加 random busting
        const finalUrl = fetchUrl.startsWith('/api') ? fetchUrl : `${fetchUrl}&_cb=${Date.now()}`;
        
        const response = await fetch(finalUrl);
        if (!response.ok) continue;

        const json = await response.json();
        // 處理 Yahoo API 格式差異 (Proxy 可能直接回傳 result 內容)
        const result = json.chart?.result?.[0] || json; 
        
        if (!result || !result.timestamp) continue;

        const timestamps = result.timestamp;
        const quote = result.indicators?.quote?.[0];
        if (!timestamps || !quote?.close) continue;

        const filteredData: StockData[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          const date = new Date(timestamps[i] * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const year = date.getFullYear();
          
          if (year >= startYear && dateStr <= todayStr) {
            const price = parseFloat(quote.close[i]?.toFixed(2) || "0");
            const prevPrice = i > 0 ? parseFloat(quote.close[i-1]?.toFixed(2) || "0") : price;
            const volume = quote.volume[i] || 0;
            const changePct = prevPrice !== 0 ? (price - prevPrice) / prevPrice : 0;

            if (price === 0) continue;

            // === 籌碼數據模擬 (Simulation) ===
            const trendStrength = changePct * 100;
            const randomFactor = Math.random(); 
            const foreign = Math.floor(volume * 0.2 * (trendStrength > 0.5 ? 1 : trendStrength < -0.5 ? -1 : (randomFactor - 0.5)));
            const trust = Math.floor(volume * 0.1 * (trendStrength > 1 ? 0.8 : trendStrength < -1 ? -0.8 : (randomFactor - 0.5) * 0.5));
            const dealer = Math.floor(volume * 0.05 * (randomFactor - 0.5) * 2);

            filteredData.push({
              date: dateStr,
              price: price,
              volume: volume,
              foreign: foreign, 
              trust: trust,
              dealer: dealer
            });
          }
        }

        if (filteredData.length > 0) {
          console.log(`[DataService] Success: ${ticker} mapped via ${generateProxyUrl(baseUrl).split('?')[0]}`);
          marketCache[pureCode] = ticker;
          return filteredData;
        }
      } catch (e) {
        // Silent fail to try next proxy
        await wait(50);
      }
    }
  }

  throw new Error(`找不到 "${input}" 的資料。系統目前處於${IS_PUBLIC_MODE ? '公開模式' : '開發模式'}，請稍後再試。`);
};
