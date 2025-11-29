export interface LocationData {
  latitude: number;
  longitude: number;
}

export enum AppRoute {
  EXPLORE = 'explore',
  PLAN = 'plan',
  SAVED = 'saved'
}

// Data structures for Itinerary Generation
export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
  locationName: string;
}

export interface DailyPlan {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface FullItinerary {
  id: string;
  destination: string;
  duration: number;
  generatedAt: string;
  days: DailyPlan[];
}

// Data structure for Chat/Map messages
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  // If the model returns grounding chunks (Maps data)
  groundingLinks?: {
    title: string;
    uri: string;
  }[];
}
