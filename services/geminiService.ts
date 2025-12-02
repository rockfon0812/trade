// ...existing code...
import { GoogleGenAI, Type } from "@google/genai";
import { FullItinerary } from "../types";

// 正確讀取 Vite 環境變數（保留 VITE_ 前綴）
const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

// 使用 any 避開不同 SDK 型別差異造成的 TS 錯誤
const getClient = (): any => new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

/** Helper: robust text extractor for different SDK response shapes */
const extractText = (resp: any): string | null => {
  if (!resp) return null;
  // common shapes
  if (typeof resp === "string") return resp;
  if (resp.text) return resp.text;
  if (resp.response?.text) {
    try {
      // some SDKs return a function
      const t = resp.response.text;
      return typeof t === "function" ? t() : t;
    } catch {
      return resp.response.text;
    }
  }
  if (resp.candidates?.[0]?.content) {
    // genai-like candidate content
    const c = resp.candidates[0].content;
    if (Array.isArray(c)) {
      const found = c.find((it: any) => typeof it.text === "string");
      if (found) return found.text;
    }
  }
  if (resp.output?.[0]?.content) {
    const c = resp.output[0].content;
    const found = Array.isArray(c) ? c.find((it: any) => typeof it.text === "string") : c;
    if (found) return found?.text ?? null;
  }
  return null;
};

// 1. Discovery Mode: Uses Google Maps Grounding
export const searchPlaces = async (
  query: string,
  userLocation?: { latitude: number; longitude: number }
) => {
  const ai = getClient();

  const tools: any[] = [{ googleMaps: {} }];
  let toolConfig: any = undefined;

  if (userLocation) {
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools,
        toolConfig,
        systemInstruction:
          "You are a knowledgeable travel guide. Provide concise recommendations. When suggesting places, explain their unique value. Always prioritize places with good ratings.",
      },
    });

    const text = extractText(response) ?? "I found some places but couldn't get the details.";

    // Try to get grounding chunks in known locations
    const groundingChunks =
      response?.candidates?.[0]?.groundingMetadata?.groundingChunks ||
      response?.grounding?.chunks ||
      [];

    const links = (groundingChunks || [])
      .filter((chunk: any) => chunk.web?.uri || chunk.maps?.uri)
      .map((chunk: any) => {
        if (chunk.maps) {
          return {
            title: chunk.maps.title,
            uri: chunk.maps.uri,
          };
        }
        return {
          title: chunk.web?.title ?? chunk.title ?? "Link",
          uri: chunk.web?.uri ?? chunk.uri,
        };
      });

    return { text, links };
  } catch (error) {
    console.error("Discovery Error:", error);
    throw error;
  }
};

// 2. Planning Mode: Uses JSON Schema for Structured Itinerary
export const generateItinerary = async (
  destination: string,
  days: number,
  interests: string
): Promise<FullItinerary> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API 金鑰未配置。請檢查 .env 文件中的 VITE_GEMINI_API_KEY");
  }

  const ai = getClient();

  const prompt = `Plan a ${days}-day trip to ${destination}. Interests: ${interests}. Create a realistic, logically routed itinerary. Group nearby activities to minimize travel time. Return a JSON object with a 'days' array where each item has day, theme and activities (time, activity, locationName, description).`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            theme: { type: Type.STRING, description: "Main theme of the day" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["time", "activity", "locationName", "description"],
              },
            },
          },
          required: ["day", "theme", "activities"],
        },
      },
    },
    required: ["days"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      // genai SDK often accepts 'config' — keep as config to match installed package
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      systemInstruction:
        "You are an expert travel planner. Create logical, realistic itineraries. Consider opening hours and travel distances. Ensure output is pure JSON.",
    });

    // robust extraction
    let jsonText = extractText(response);
    if (!jsonText) {
      // fallback: some SDK responses embed string in response.response.text()
      try {
        jsonText = typeof response?.response?.text === "function" ? response.response.text() : response?.response?.text;
      } catch {}
    }
    if (!jsonText) throw new Error("No itinerary generated.");

    // clean and extract JSON
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstOpen = jsonText.indexOf("{");
    const lastClose = jsonText.lastIndexOf("}");
    if (firstOpen !== -1 && lastClose !== -1) {
      jsonText = jsonText.substring(firstOpen, lastClose + 1);
    }

    const parsed = JSON.parse(jsonText);

    return {
      id: Date.now().toString(),
      destination,
      duration: days,
      generatedAt: new Date().toISOString(),
      days: parsed.days,
    };
  } catch (error) {
    console.error("Itinerary Error:", error);
    throw new Error(`Failed to generate itinerary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};