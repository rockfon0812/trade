import React, { useState } from 'react';
import { Plus, Minus, Wand2, Clock, MapPin, ArrowLeft, Save, Loader2, Copy, Check } from 'lucide-react';
import { generateItinerary } from '../services/geminiService';
import { FullItinerary } from '../types';

interface ItineraryPlannerProps {
  onSave: (itinerary: FullItinerary) => void;
}

const INTEREST_TAGS = [
  "📸 Sightseeing", "🍜 Local Food", "🖼 Museums", 
  "🛍 Shopping", "🌳 Nature", "☕ Cafes", 
  "🧗 Adventure", "🏰 History", "🌃 Nightlife"
];

const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ onSave }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  
  // Form State
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState('');
  
  // Result State
  const [generatedItinerary, setGeneratedItinerary] = useState<FullItinerary | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!destination) return;
    
    setStep('loading');
    try {
      const result = await generateItinerary(destination, days, interests);
      setGeneratedItinerary(result);
      setStep('result');
    } catch (e) {
      alert("Failed to generate plan. Please try again.");
      setStep('form');
    }
  };

  const handleSaveAndReset = () => {
    if (generatedItinerary) {
      onSave(generatedItinerary);
      // Reset
      setDestination('');
      setDays(3);
      setInterests('');
      setGeneratedItinerary(null);
      setStep('form');
    }
  };

  const handleAddInterest = (tag: string) => {
    if (interests.includes(tag)) return;
    setInterests(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleCopy = async () => {
    if (!generatedItinerary) return;

    let text = `✈️ Trip to ${generatedItinerary.destination} (${generatedItinerary.duration} Days)\n\n`;
    
    generatedItinerary.days.forEach(day => {
      text += `📅 Day ${day.day}: ${day.theme}\n`;
      day.activities.forEach(act => {
        text += `• ${act.time} - ${act.activity} @ ${act.locationName}\n  (${act.description})\n`;
      });
      text += `\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-200 blur-xl opacity-50 rounded-full animate-pulse"></div>
          <div className="relative bg-white p-4 rounded-2xl shadow-xl mb-6">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Planning your Trip to {destination}</h2>
        <p className="text-slate-500">Curating the best spots, calculating routes, and checking details...</p>
      </div>
    );
  }

  if (step === 'result' && generatedItinerary) {
    return (
      <div className="pb-24 pt-12 px-0 bg-slate-50 min-h-screen">
        <div className="px-6 mb-6">
          <button 
            onClick={() => setStep('form')}
            className="flex items-center text-slate-500 mb-4 hover:text-indigo-600"
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{destination}</h1>
              <p className="text-indigo-600 font-medium">{days} Days • {generatedItinerary.days.length} Daily Plans</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="p-3 bg-white text-slate-600 border border-slate-200 rounded-full shadow-sm active:scale-95 transition-transform"
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
              </button>
              <button 
                onClick={handleSaveAndReset}
                className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                title="Save Trip"
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-4">
          {generatedItinerary.days.map((day) => (
            <div key={day.day} className="relative pl-4 border-l-2 border-indigo-100">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Day {day.day}</h3>
              <p className="text-sm text-indigo-500 font-medium mb-4 uppercase tracking-wider">{day.theme}</p>
              
              <div className="space-y-3">
                {day.activities.map((act, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center text-slate-400 text-xs font-semibold mb-2">
                      <Clock size={12} className="mr-1" />
                      {act.time}
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{act.activity}</h4>
                    <p className="text-slate-600 text-sm mb-2 leading-relaxed">{act.description}</p>
                    <div className="flex items-center text-indigo-600 text-xs font-medium bg-indigo-50 w-fit px-2 py-1 rounded">
                      <MapPin size={10} className="mr-1" />
                      {act.locationName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="px-6 pt-12 h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Plan a new Trip</h1>
      <p className="text-slate-500 mb-8">Let AI design your perfect itinerary in seconds.</p>

      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Where do you want to go?</label>
          <input 
            type="text" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Paris, Kyoto, New York"
            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Days Counter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">How many days?</label>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={() => setDays(Math.max(1, days - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Minus size={18} />
            </button>
            <span className="text-xl font-bold text-slate-800 w-8 text-center">{days}</span>
            <button 
              onClick={() => setDays(Math.min(14, days + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Interests or Preferences</label>
          <textarea 
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. History, Food, Hiking..."
            rows={3}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm resize-none mb-3"
          />
          
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleAddInterest(tag)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-full text-xs font-medium transition-colors border border-transparent hover:border-indigo-100"
              >
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-8 fixed bottom-20 left-6 right-6 z-10">
        <button
          onClick={handleGenerate}
          disabled={!destination}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          <Wand2 className="mr-2" />
          Generate Itinerary
        </button>
      </div>
    </div>
  );
};

export default ItineraryPlanner;