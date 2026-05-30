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
        <strong>{poi.name}</strong><br/>
        {poi.typeName}<br/>
        {poi.phone && <a href={`tel:${poi.phone}`}>{poi.phone}</a>}
      </Popup>
    </Marker>
  );
}

export default function MapWrapper({ location, pois }) {
  const center = location ? [location.lat, location.lng] : [20.5937, 78.9629]; 

  const getMarkerColor = (category) => {
    switch(category) {
      case 'hospital': return '#dc2626'; // red-600
      case 'pharmacy': return '#0d9488'; // teal-600
      case 'police': return '#2563eb';   // blue-600
      case 'fire': return '#ea580c';     // orange-600
      case 'ambulance': return '#16a34a';// green-600
      case 'mechanic': return '#ca8a04'; // yellow-600
      case 'shelter': return '#9333ea';  // purple-600
      default: return 'gray';
    }
  };

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color:${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden shadow-md border-2 border-gray-200 dark:border-gray-700 relative z-0">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {location && (
          <Marker position={[location.lat, location.lng]}>
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
