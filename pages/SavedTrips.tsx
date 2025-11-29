import React, { useState } from 'react';
import { Calendar, Trash2, ChevronRight, Clock, MapPin } from 'lucide-react';
import { FullItinerary } from '../types';

interface SavedTripsProps {
  trips: FullItinerary[];
  onDelete: (id: string) => void;
}

const SavedTrips: React.FC<SavedTripsProps> = ({ trips, onDelete }) => {
  const [selectedTrip, setSelectedTrip] = useState<FullItinerary | null>(null);

  if (selectedTrip) {
    return (
      <div className="pb-24 pt-12 bg-slate-50 min-h-screen">
         <div className="px-6 mb-6">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="text-slate-500 mb-4 hover:text-indigo-600 font-medium text-sm"
            >
              ← Back to Saved
            </button>
            <h1 className="text-3xl font-bold text-slate-800">{selectedTrip.destination}</h1>
            <p className="text-indigo-600 font-medium mt-1">{selectedTrip.duration} Days Trip</p>
         </div>
         
         <div className="space-y-8 px-4">
          {selectedTrip.days.map((day) => (
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
                    <p className="text-slate-600 text-sm mb-2">{act.description}</p>
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

  return (
    <div className="px-6 pt-12 pb-24 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Saved Trips</h1>
      <p className="text-slate-500 mb-8">Your bucket list and upcoming adventures.</p>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-50">
          <Calendar size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">No saved trips yet.</p>
          <p className="text-slate-400 text-sm">Go to Plan to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div 
              key={trip.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div onClick={() => setSelectedTrip(trip)} className="cursor-pointer flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{trip.destination}</h3>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{trip.duration} Days</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(trip.generatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 flex items-center text-indigo-600 text-sm font-semibold">
                    View Itinerary <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;
