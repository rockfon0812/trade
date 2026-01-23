
import { ThemeStock } from "../types";

export interface ThemeDefinition {
    id: string;
    name: string;
    description: string;
    stocks: ThemeStock[];
}

export const THEME_LIST: ThemeDefinition[] = [
    // === 半導體核心 ===
    {
        id: "IC_DESIGN",
        name: "IC 設計 (IC Design)",
        description: "高毛利、高成長，受惠於消費電子與 AI 晶片需求。",
        stocks: [
            { symbol: "2454.TW", name: "聯發科", market: "上市" },
            { symbol: "3034.TW", name: "聯詠", market: "上市" },
            { symbol: "2379.TW", name: "瑞昱", market: "上市" },
            { symbol: "3661.TW", name: "世芯-KY", market: "上市" },
            { symbol: "3443.TW", name: "創意", market: "上市" },
            { symbol: "3035.TW", name: "智原", market: "上市" }
        ]
    },
    {
        id: "FOUNDRY_PACKAGING",
        name: "晶圓代工與封測",
        description: "半導體製造中下游，包含先進封裝 CoWoS 概念。",
        stocks: [
            { symbol: "2330.TW", name: "台積電", market: "上市" },
            { symbol: "2303.TW", name: "聯電", market: "上市" },
            { symbol: "2311.TW", name: "日月光投控", market: "上市" },
            { symbol: "6147.TWO", name: "頎邦", market: "上櫃" },
            { symbol: "3374.TWO", name: "精材", market: "上櫃" }
        ]
    },
    {
        id: "MEMORY_WAFER",
        name: "記憶體與矽晶圓",
        description: "景氣循環強烈，主要受報價波動影響。",
        stocks: [
            { symbol: "2408.TW", name: "南亞科", market: "上市" },
            { symbol: "2344.TW", name: "華邦電", market: "上市" },
            { symbol: "2337.TW", name: "旺宏", market: "上市" },
            { symbol: "6488.TWO", name: "環球晶", market: "上櫃" },
            { symbol: "3532.TW", name: "台勝科", market: "上市" }
        ]
    },
    // === AI 與 高效能運算 ===
    {
        id: "AI_SERVER_COOLING",
        name: "AI 伺服器與散熱",
        description: "HPC 關鍵組件，包含組裝廠與高瓦數散熱方案。",
        stocks: [
            { symbol: "2382.TW", name: "廣達", market: "上市" },
            { symbol: "3231.TW", name: "緯創", market: "上市" },
            { symbol: "6669.TW", name: "緯穎", market: "上市" },
            { symbol: "3017.TW", name: "奇鋐", market: "上市" },
            { symbol: "3324.TWO", name: "雙鴻", market: "上櫃" },
            { symbol: "2376.TW", name: "技嘉", market: "上市" }
        ]
    },
    // === 電子關鍵組件 ===
    {
        id: "PCB_PASSIVE",
        name: "PCB 與 被動元件",
        description: "電子工業之母，包含 ABF 載板與 MLCC。",
        stocks: [
            { symbol: "3037.TW", name: "欣興", market: "上市" },
            { symbol: "8046.TW", name: "南電", market: "上市" },
            { symbol: "2327.TW", name: "國巨", market: "上市" },
            { symbol: "2492.TW", name: "華新科", market: "上市" },
            { symbol: "2367.TW", name: "燿華", market: "上市" }
        ]
    },
    {
        id: "NETWORKING_5G",
        name: "網通與 5G 設備",
        description: "雲端基礎建設、低軌衛星與 5G 基地台。",
        stocks: [
            { symbol: "2345.TW", name: "智邦", market: "上市" },
            { symbol: "5388.TW", name: "中磊", market: "上市" },
            { symbol: "6285.TW", name: "啟碁", market: "上市" },
            { symbol: "2314.TW", name: "台揚", market: "上市" }
        ]
    },
    {
        id: "SOFTWARE_CLOUD",
        name: "軟體與雲端服務",
        description: "資安、系統整合與 SaaS 服務，輕資產高獲利。",
        stocks: [
            { symbol: "6214.TW", name: "精誠", market: "上市" },
            { symbol: "3029.TW", name: "零壹", market: "上市" },
            { symbol: "2471.TW", name: "資通", market: "上市" },
            { symbol: "5203.TW", name: "訊連", market: "上市" },
            { symbol: "6183.TWO", name: "關貿", market: "上櫃" }
        ]
    },
    // === 車用與綠能 ===
    {
        id: "AUTO_ELECTRONICS",
        name: "車用電子與 EV",
        description: "電動車供應鏈，包含功率元件與電池正負極材料。",
        stocks: [
            { symbol: "2317.TW", name: "鴻海", market: "上市" },
            { symbol: "1536.TW", name: "和大", market: "上市" },
            { symbol: "4721.TWO", name: "美琪瑪", market: "上櫃" },
            { symbol: "4739.TW", name: "康普", market: "上市" },
            { symbol: "2497.TW", name: "怡利電", market: "上市" }
        ]
    },
    {
        id: "GREEN_ENERGY",
        name: "綠能與重電",
        description: "政策扶持，包含風電、太陽能與台電強韌電網計畫。",
        stocks: [
            { symbol: "1513.TW", name: "中興電", market: "上市" },
            { symbol: "1519.TW", name: "華城", market: "上市" },
            { symbol: "9958.TW", name: "世紀鋼", market: "上市" },
            { symbol: "6806.TW", name: "森崴能源", market: "上市" },
            { symbol: "6443.TW", name: "元晶", market: "上市" }
        ]
    },
    // === 傳產與其他 ===
    {
        id: "BIOTECH",
        name: "生技醫療",
        description: "新藥研發、CDMO 與高階醫材，防禦型與爆發型兼具。",
        stocks: [
            { symbol: "6446.TWO", name: "藥華藥", market: "上櫃" },
            { symbol: "1795.TW", name: "美時", market: "上市" },
            { symbol: "4162.TWO", name: "智擎", market: "上櫃" },
            { symbol: "1760.TW", name: "寶齡富錦", market: "上市" },
            { symbol: "4105.TWO", name: "東洋", market: "上櫃" }
        ]
    },
    {
        id: "MILITARY_AEROSPACE",
        name: "軍工與航太",
        description: "地緣政治升溫與航太復甦概念。",
        stocks: [
            { symbol: "2634.TW", name: "漢翔", market: "上市" },
            { symbol: "8033.TW", name: "雷虎", market: "上市" },
            { symbol: "2645.TW", name: "長榮航太", market: "上市" },
            { symbol: "5284.TW", name: "jpp-KY", market: "上市" }
        ]
    },
    {
        id: "FINANCIAL_ALL",
        name: "金融金控",
        description: "穩定配息、低波動，受升息與市場景氣影響。",
        stocks: [
            { symbol: "2881.TW", name: "富邦金", market: "上市" },
            { symbol: "2882.TW", name: "國泰金", market: "上市" },
            { symbol: "2886.TW", name: "兆豐金", market: "上市" },
            { symbol: "2891.TW", name: "中信金", market: "上市" },
            { symbol: "2884.TW", name: "玉山金", market: "上市" }
        ]
    },
    {
        id: "SHIPPING_TRANSPORT",
        name: "航運與物流",
        description: "貨櫃三雄與航空雙雄，受運價與燃油成本驅動。",
        stocks: [
            { symbol: "2603.TW", name: "長榮", market: "上市" },
            { symbol: "2609.TW", name: "陽明", market: "上市" },
            { symbol: "2615.TW", name: "萬海", market: "上市" },
            { symbol: "2618.TW", name: "長榮航", market: "上市" },
            { symbol: "2610.TW", name: "華航", market: "上市" }
        ]
    },
    {
        id: "STEEL_CEMENT",
        name: "鋼鐵與水泥",
        description: "基礎建設概念股，抗通膨與資產活化特質。",
        stocks: [
            { symbol: "2002.TW", name: "中鋼", market: "上市" },
            { symbol: "2014.TW", name: "中鴻", market: "上市" },
            { symbol: "1101.TW", name: "台泥", market: "上市" },
            { symbol: "1102.TW", name: "亞泥", market: "上市" }
        ]
    },
    {
        id: "TOURISM_RETAIL",
        name: "觀光與內需零售",
        description: "疫後復甦、解封概念，包含飯店、旅行社與百貨。",
        stocks: [
            { symbol: "2707.TW", name: "晶華", market: "上市" },
            { symbol: "2731.TW", name: "雄獅", market: "上市" },
            { symbol: "2912.TW", name: "統一超", market: "上市" },
            { symbol: "2727.TW", name: "王品", market: "上市" }
        ]
    }
];
