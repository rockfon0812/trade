import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FullItinerary } from "../types";

// Declare process to satisfy TypeScript in browser environment where Vite replaces process.env
declare const process: { env: { API_KEY: string } };

// Helper to get client (creates new instance to ensure key freshness if needed)
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Discovery Mode: Uses Google Maps Grounding
export const searchPlaces = async (
  query: string,
  userLocation?: { latitude: number; longitude: number }
) => {
  const ai = getClient();
  
  // Configure tools
  const tools: any[] = [{ googleMaps: {} }];
  let toolConfig: any = undefined;

  // Pass location if available for better relevance
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
        systemInstruction: "You are a knowledgeable travel guide. Provide concise recommendations. When suggesting places, explain their unique value. Always prioritize places with good ratings."
      },
    });

    const text = response.text || "I found some places but couldn't get the details.";
    
    // Extract Maps Grounding Data
    // The SDK structure for grounding chunks:
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links = groundingChunks
      .filter((chunk: any) => chunk.web?.uri || chunk.maps?.uri) // Handle both web and maps chunks
      .map((chunk: any) => {
        if (chunk.maps) {
           return {
             title: chunk.maps.title,
             uri: chunk.maps.uri // Usually a Google Maps link
           };
        }
        return {
          title: chunk.web.title,
          uri: chunk.web.uri
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
  const ai = getClient();

  const prompt = `Plan a ${days}-day trip to ${destination}. 
  Interests: ${interests}. 
  Create a realistic, logically routed itinerary. Group nearby activities to minimize travel time.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            theme: { type: Type.STRING, description: "Main theme of the day (e.g. Historic Center, Nature Walk)" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "e.g. 09:00 AM" },
                  activity: { type: Type.STRING, description: "Short title of activity" },
                  locationName: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Brief details. Mention why it fits the interest." },
                },
                required: ["time", "activity", "locationName", "description"]
              }
            }
          },
          required: ["day", "theme", "activities"]
        }
      }
    },
    required: ["days"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert travel planner. Create logical, realistic itineraries. Consider opening hours and travel distances."
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No itinerary generated.");

    // Clean Markdown code blocks if present (e.g. ```json ... ```)
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    const parsed = JSON.parse(jsonText);
    
    return {
      id: Date.now().toString(),
      destination,
      duration: days,
      generatedAt: new Date().toISOString(),
      days: parsed.days
    };

  } catch (error) {
    console.error("Itinerary Error:", error);
    throw error;
  }
};