import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, MapPin, Shield } from 'lucide-react';
import { getNearbyBlackSpots } from '../services/blackSpots';

export default function AccidentHotspots({ location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    if (location) {
      let nearby = getNearbyBlackSpots(location.lat, location.lng, 500);
      if (nearby.length === 0) {
        // Show closest 5 spots from anywhere as reference
        nearby = getNearbyBlackSpots(location.lat, location.lng, 99999).slice(0, 5);
      }
      setSpots(nearby);
    }
  }, [location]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-full relative">
            <AlertTriangle size={20} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {spots.length}
            </span>
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white text-sm">⚠️ Accident Prone Zones</p>
            <p className="text-xs text-gray-500">{spots.length} black spots near you — drive carefully!</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2 border-t dark:border-gray-700 pt-3 max-h-[400px] overflow-y-auto">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
            📊 Source: NHAI & Ministry of Road Transport Data
          </p>

          {spots.map((spot, idx) => (
            <div 
              key={idx} 
              className={`rounded-xl p-3 border ${getSeverityColor(spot.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-bold text-sm">{spot.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getSeverityBadge(spot.severity)}`}>
                      {spot.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mb-1.5">{spot.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] opacity-70">
                    <span className="flex items-center space-x-1">
                      <MapPin size={10} />
                      <span>{spot.city} • {spot.distance.toFixed(1)} km away</span>
                    </span>
                    {spot.accidents && (
                      <span className="flex items-center space-x-1">
                        <Shield size={10} />
                        <span>{spot.accidents} reported incidents</span>
                      </span>
                    )}
                  </div>
                </div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 p-2 bg-white/50 dark:bg-gray-900/50 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition shrink-0"
                  title="View on Maps"
                >
                  <MapPin size={14} />
                </a>
              </div>
            </div>
          ))}

          <p className="text-[10px] text-gray-400 text-center pt-2 italic">
            💡 Slow down and stay alert when approaching these zones
          </p>
        </div>
      )}
    </div>
  );
}
