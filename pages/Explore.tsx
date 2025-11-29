import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Navigation, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, LocationData } from '../types';
import { searchPlaces } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ExploreProps {
  location: LocationData | null;
  onRequestLocation: () => void;
}

const SUGGESTIONS = [
  "☕ Best Coffee nearby",
  "🍝 Authentic local food",
  "📸 Top sightseeing spots",
  "💎 Hidden gems",
];

const Explore: React.FC<ExploreProps> = ({ location, onRequestLocation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "Hi! I'm WanderAI. I can help you find restaurants, museums, or hidden gems nearby. Try asking 'Best sushi nearby' or 'Parks in Tokyo'." 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userText = text || inputValue;
    if (!userText.trim() || isLoading) return;

    setInputValue('');
    
    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await searchPlaces(userText, location || undefined);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingLinks: response.links
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I had trouble connecting to the travel network. Please check your API key or try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Explore</h1>
            <p className="text-slate-500 text-sm">Discover places around you</p>
          </div>
          <button 
            onClick={onRequestLocation}
            className={`p-2 rounded-full ${location ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
          >
            <Navigation size={20} className={location ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-100 text-slate-700 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="prose prose-sm prose-indigo max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}

              {/* Map Links / Grounding */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  {msg.groundingLinks.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      <MapPin size={12} className="mr-1" />
                      {link.title || 'View on Map'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Quick Suggestions for Empty/Start State */}
        {messages.length === 1 && !isLoading && (
          <div className="grid grid-cols-2 gap-2 px-2 mt-4">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="p-3 text-left bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-sm text-slate-600 flex items-center"
              >
                <Sparkles size={14} className="text-indigo-400 mr-2 flex-shrink-0" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
              <span className="text-sm text-slate-500">Searching nearby...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={location ? "What's nearby?" : "Search for a city..."}
            className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Explore;