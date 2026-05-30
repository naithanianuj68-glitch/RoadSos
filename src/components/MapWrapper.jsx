import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5, easeLinearity: 0.25 });
  }, [center, map]);
  return null;
}

function ClickableMarker({ poi, icon }) {
  const map = useMap();
  return (
    <Marker 
      position={[poi.lat, poi.lng]}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.flyTo([poi.lat, poi.lng], 17, { duration: 1 });
        }
      }}
    >
      <Popup>
        <div className="text-slate-900 font-sans p-1">
          <strong className="text-sm font-bold text-red-600 block mb-0.5">{poi.name}</strong>
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold mb-1">{poi.typeName}</span>
          {poi.phone && (
            <a 
              href={`tel:${poi.phone}`} 
              className="inline-block text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold hover:bg-red-700 transition"
            >
              📞 Call: {poi.phone}
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapWrapper({ location, pois, isFullBleed }) {
  const center = location ? [location.lat, location.lng] : [20.5937, 78.9629]; 

  const getMarkerColor = (category) => {
    switch(category) {
      case 'hospital': return '#ef4444'; // red
      case 'pharmacy': return '#0d9488'; // teal
      case 'police': return '#3b82f6';   // blue
      case 'fire': return '#f97316';     // orange
      case 'ambulance': return '#10b981';// green
      case 'mechanic': return '#eab308'; // yellow
      default: return '#ef4444';
    }
  };

  // Create custom marker matching the mockup style
  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            background-color: ${color}; 
            opacity: 0.25; 
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
          "></div>
          <div style="
            position: relative; 
            background-color: ${color}; 
            width: 14px; 
            height: 14px; 
            border-radius: 50%; 
            border: 2px solid #ffffff; 
            box-shadow: 0 0 8px ${color};
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const currentIcon = L.divIcon({
    className: 'current-location-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background-color: #3b82f6; 
          opacity: 0.3; 
          animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        "></div>
        <div style="
          position: relative; 
          background-color: #3b82f6; 
          width: 16px; 
          height: 16px; 
          border-radius: 50%; 
          border: 2.5px solid #ffffff; 
          box-shadow: 0 0 10px #3b82f6;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className={`w-full ${isFullBleed ? 'h-full' : 'h-64 rounded-2xl'} overflow-hidden relative z-0`}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={!isFullBleed}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {location && (
          <Marker position={[location.lat, location.lng]} icon={currentIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {pois.map((poi) => (
          <ClickableMarker 
            key={poi.id} 
            poi={poi}
            icon={createCustomIcon(getMarkerColor(poi.category))}
          />
        ))}
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}
