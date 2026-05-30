import React from 'react';
import { Phone, Navigation, Shield, Stethoscope, Car, Activity, Pill, Wrench, Flame, Home } from 'lucide-react';

export default function EmergencyList({ pois, location }) {
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); 
  };

  const sortedPois = [...pois].sort((a, b) => {
    if (!location) return 0;
    const distA = getDistance(location.lat, location.lng, a.lat, a.lng);
    const distB = getDistance(location.lat, location.lng, b.lat, b.lng);
    return distA - distB;
  });

  const getIcon = (category) => {
    switch(category) {
      case 'hospital': return <Stethoscope className="text-red-600 dark:text-red-500" />;
      case 'pharmacy': return <Pill className="text-teal-600 dark:text-teal-400" />;
      case 'police': return <Shield className="text-blue-600 dark:text-blue-500" />;
      case 'fire': return <Flame className="text-orange-600 dark:text-orange-500" />;
      case 'ambulance': return <Activity className="text-green-600 dark:text-green-500" />;
      case 'mechanic': return <Wrench className="text-yellow-600 dark:text-yellow-500" />;
      case 'shelter': return <Home className="text-purple-600 dark:text-purple-500" />;
      default: return <Navigation className="text-gray-500" />;
    }
  };

  const getEmergencyFallback = (category) => {
    switch(category) {
      case 'hospital': return { number: '108', label: 'Ambulance' };
      case 'pharmacy': return { number: '108', label: 'Ambulance' };
      case 'police': return { number: '100', label: 'Police' };
      case 'fire': return { number: '101', label: 'Fire Brigade' };
      case 'ambulance': return { number: '108', label: 'Ambulance' };
      case 'mechanic': return { number: '112', label: 'Emergency' };
      case 'shelter': return { number: '112', label: 'Emergency' };
      default: return { number: '112', label: 'Emergency' };
    }
  };

  if (sortedPois.length === 0) {
    return <div className="p-4 text-center text-gray-500">No services found nearby. Try increasing the radius or check network.</div>;
  }

  return (
    <div className="space-y-3">
      {sortedPois.slice(0, 25).map(poi => {
        const dist = location ? getDistance(location.lat, location.lng, poi.lat, poi.lng).toFixed(1) : '?';
        const fallback = getEmergencyFallback(poi.category);
        const phoneNumber = poi.phone || fallback.number;
        const phoneLabel = poi.phone ? poi.phone : `${fallback.number} (${fallback.label})`;
        const etaMins = Math.round(parseFloat(dist) * 3); // rough ETA: 3 min per km in city

        return (
          <div key={poi.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4" style={{
            borderLeftColor: poi.category === 'hospital' ? '#dc2626' :
                             poi.category === 'pharmacy' ? '#0d9488' :
                             poi.category === 'police' ? '#2563eb' :
                             poi.category === 'fire' ? '#ea580c' :
                             poi.category === 'ambulance' ? '#16a34a' :
                             poi.category === 'mechanic' ? '#ca8a04' :
                             poi.category === 'shelter' ? '#9333ea' : '#9ca3af'
          }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0 mt-0.5">
                  {getIcon(poi.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{poi.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {poi.typeName} • {dist} km • ~{etaMins} min
                  </p>
                  {poi.address && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">📍 {poi.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact bar */}
            <div className="mt-3 flex items-center space-x-2">
              <a 
                href={`tel:${phoneNumber}`} 
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-95 transition-all"
              >
                <Phone size={16} />
                <span>{phoneLabel}</span>
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${location ? `${location.lat},${location.lng}` : ''}&destination=${poi.lat},${poi.lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center space-x-1"
              >
                <Navigation size={16} />
                <span>Go</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
