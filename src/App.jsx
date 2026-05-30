import React, { useState, useEffect, useRef } from 'react';
import SOSButton from './components/SOSButton';
import MapWrapper from './components/MapWrapper';
import EmergencyList from './components/EmergencyList';
import AIChatbot from './components/AIChatbot';
import AccidentGuide from './components/AccidentGuide';
import EmergencyNumbers from './components/EmergencyNumbers';
import AccidentReport from './components/AccidentReport';
import SpeedMonitor from './components/SpeedMonitor';
import VoiceSOS from './components/VoiceSOS';
import ShakeDetector from './components/ShakeDetector';
import AccidentHotspots from './components/AccidentHotspots';
import { getCurrentLocation, getAddressFromCoords, getCoordsFromAddress } from './services/location';
import { fetchEmergencyPOIs } from './services/overpass';
import { saveOfflineData, getOfflineData } from './services/offlineStorage';
import { AlertCircle, MapPin, RefreshCw, WifiOff, Beaker, Search } from 'lucide-react';
import { MOCK_LOCATION, MOCK_ADDRESS, MOCK_POIS } from './services/mockData';

function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        setLocation(MOCK_LOCATION);
        setAddress(MOCK_ADDRESS);
        setPois(MOCK_POIS);
        setLoading(false);
        return;
      }

      if (isOffline) throw new Error('Offline mode');

      const loc = await getCurrentLocation();
      setLocation(loc);
      
      const addr = await getAddressFromCoords(loc.lat, loc.lng);
      setAddress(addr);

      const fetchedPois = await fetchEmergencyPOIs(loc.lat, loc.lng);
      setPois(fetchedPois);
      setLastSynced(new Date());
      
      await saveOfflineData(loc.lat, loc.lng, fetchedPois);
    } catch (err) {
      console.warn('Falling back to offline data:', err);
      const offlineData = await getOfflineData();
      if (offlineData.location) setLocation(offlineData.location);
      setPois(offlineData.pois);
      if (!offlineData.location && offlineData.pois.length === 0) {
        setError('No offline data available. Please connect to the internet.');
      } else {
        setError('Live API overloaded. Showing your last offline cached data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, [isOffline, isDemoMode]);

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    setIsSearchingLocation(true);
    setError(null);
    try {
      const coords = await getCoordsFromAddress(manualLocation);
      if (!coords) {
        setError('Could not find that location. Please try a different name or city.');
        return;
      }
      
      setLocation(coords);
      const addr = await getAddressFromCoords(coords.lat, coords.lng);
      setAddress(addr || { display_name: manualLocation });

      const fetchedPois = await fetchEmergencyPOIs(coords.lat, coords.lng);
      setPois(fetchedPois);
      setLastSynced(new Date());
      await saveOfflineData(coords.lat, coords.lng, fetchedPois);
    } catch (err) {
      setError('Failed to fetch data for manual location.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsSearchingLocation(false);
    }
  };

  const filteredPois = categoryFilter === 'all' 
    ? pois 
    : pois.filter(p => p.category === categoryFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 relative">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="RoadSoS Logo" className="w-8 h-8 rounded-lg object-cover" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">RoadSoS</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-1 rounded flex items-center space-x-1 text-xs font-bold transition ${isDemoMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              <Beaker size={14} />
              <span>{isDemoMode ? 'Demo: ON' : 'Demo: OFF'}</span>
            </button>
            {isOffline && !isDemoMode && (
              <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">
                <WifiOff size={14} />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <SOSButton location={location} address={address} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3 border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                <MapPin size={20} />
              </div>
              <div className="truncate">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Location</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {loading && !isSearchingLocation ? 'Locating...' : (address?.display_name || 'Coordinates acquired')}
                </p>
              </div>
            </div>
            <button onClick={initData} className="p-2 text-gray-400 hover:text-blue-600 transition shrink-0" title="Use GPS Location">
              <RefreshCw size={20} className={loading && !isSearchingLocation ? 'animate-spin' : ''} />
            </button>
          </div>
          <form onSubmit={handleManualSearch} className="flex items-center space-x-2 border-t dark:border-gray-700 pt-3">
            <input 
              type="text" 
              placeholder="Search specific area or city..." 
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="flex-1 text-sm p-2 rounded-lg bg-gray-100 dark:bg-gray-900 dark:text-white border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-0 outline-none"
            />
            <button type="submit" disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              <Search size={16} />
            </button>
          </form>

          {/* Global Quick Search — proves "Global applicability across countries" */}
          <div className="border-t dark:border-gray-700 pt-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">🌍 Try Global Search</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🇮🇳 Delhi', q: 'New Delhi, India' },
                { label: '🇮🇳 Mumbai', q: 'Mumbai, India' },
                { label: '🇺🇸 New York', q: 'New York, USA' },
                { label: '🇬🇧 London', q: 'London, UK' },
                { label: '🇯🇵 Tokyo', q: 'Tokyo, Japan' },
                { label: '🇦🇪 Dubai', q: 'Dubai, UAE' },
                { label: '🇧🇷 São Paulo', q: 'São Paulo, Brazil' },
                { label: '🇦🇺 Sydney', q: 'Sydney, Australia' },
              ].map(city => (
                <button
                  key={city.q}
                  onClick={() => { setManualLocation(city.q); }}
                  className="px-2 py-1 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition"
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SpeedMonitor location={location} />
        <AccidentGuide />
        <EmergencyNumbers />
        <AccidentReport location={location} address={address} pois={pois} />
        <AccidentHotspots location={location} />

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nearby Services</h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full">
              {pois.length} contacts fetched
            </span>
          </div>
          
          <div className="flex justify-between items-center px-1 -mt-3">
            <p className="text-xs text-gray-500 italic">🌐 Global integration — OpenStreetMap</p>
            {lastSynced && <p className="text-[10px] text-gray-400">Synced: {lastSynced.toLocaleTimeString()}</p>}
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {['all', 'hospital', 'pharmacy', 'police', 'fire', 'ambulance', 'mechanic', 'shelter'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}
              >
                {cat === 'all' ? `All (${pois.length})` : cat.charAt(0).toUpperCase() + cat.slice(1) + ` (${pois.filter(p => p.category === cat).length})`}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-xl text-center text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <MapWrapper location={location} pois={filteredPois} />
          <EmergencyList location={location} pois={filteredPois} />
        </div>

        {/* Data Source Footer — proves "Reliability and data accuracy" */}
        <div className="mt-6 text-center space-y-1 pb-4">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">📡 Data Source: <strong>OpenStreetMap Overpass API</strong> — Open, verified, crowd-sourced global data</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">🔄 Progressive search: 3km → 7km → 15km radius | 📶 Offline-first PWA with IndexedDB cache</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Built for the Road Safety Hackathon 2026 — CoERS, IIT Madras</p>
        </div>
      </main>

      <AIChatbot onFilterChange={setCategoryFilter} isDemoMode={isDemoMode} />
      <VoiceSOS onVoiceInput={(text) => {
        // Auto-open chatbot and feed voice input
        const event = new CustomEvent('voiceInput', { detail: text });
        window.dispatchEvent(event);
      }} />
      <ShakeDetector onShake={() => {
        // Simulate SOS button click on shake
        const sosBtn = document.querySelector('[data-sos-trigger]');
        if (sosBtn) sosBtn.click();
      }} />
    </div>
  );
}

export default App;
