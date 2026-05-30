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
import { AlertCircle, MapPin, RefreshCw, WifiOff, Beaker, Search, ShieldAlert, Cpu } from 'lucide-react';
import { MOCK_LOCATION, MOCK_ADDRESS, MOCK_POIS } from './services/mockData';

function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDemoMode, setIsDemoMode] = useState(true); // Default ON to show mockups instantly
  const [manualLocation, setManualLocation] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  
  // Custom alerts matching the mockup
  const [mockAlerts] = useState([
    { id: 1, title: 'OAK ST FIRE', type: 'fire', detail: 'Structural hazard reported' },
    { id: 2, title: 'MEDICAL AID - 5TH AVE', type: 'medical', detail: 'Critical paramedic dispatch' },
    { id: 3, title: 'POLICE ACTIVITY', type: 'police', detail: 'Active traffic redirection' }
  ]);

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
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden font-sans relative selection:bg-red-500/30">
      
      {/* Decorative futuristic background glow meshes */}
      <div className="absolute top-10 left-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-950/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Main Container: Simulator layout split */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: App Pitch, Controls and Status Indicators */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-red-500 rounded-xl shadow-lg shadow-red-500/20">
              <ShieldAlert size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                RoadSoS <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">PWA v1.3</span>
              </h1>
              <p className="text-slate-400 text-xs tracking-wider uppercase font-bold">Autonomous Offline Rescue Engine</p>
            </div>
          </div>
          
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            A state-of-the-art Progressive Web App designed to assist during the critical highway 'Golden Hour'. Built to be fully functional inside cellular coverage dead zones using localized databases.
          </p>

          {/* Quick simulator controller controls */}
          <div className="bg-[#111827]/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu size={14} className="text-red-400" /> Simulation Control Panel
            </h3>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-300 font-medium">Demo/Mockup Data Mode:</span>
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-4 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-bold transition-all border ${isDemoMode ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/5' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                <Beaker size={13} />
                <span>{isDemoMode ? 'Active: Hackathon Mode' : 'Standard API Mode'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-800/80 pt-3">
              <span className="text-xs text-slate-300 font-medium">Cellular Status:</span>
              <div className="flex items-center space-x-1.5">
                {isOffline ? (
                  <div className="flex items-center space-x-1 text-orange-400 bg-orange-950/30 px-2.5 py-1 rounded-lg text-xs font-bold border border-orange-500/20">
                    <WifiOff size={13} />
                    <span>0 Bars (Offline Cache Active)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
                    <span>LTE Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Coverage Index</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🇮🇳 Delhi', q: 'New Delhi, India' },
                { label: '🇮🇳 Mumbai', q: 'Mumbai, India' },
                { label: '🇺🇸 New York', q: 'New York, USA' },
                { label: '🇬🇧 London', q: 'London, UK' },
                { label: '🇯🇵 Tokyo', q: 'Tokyo, Japan' },
              ].map(city => (
                <button
                  key={city.q}
                  onClick={() => { setManualLocation(city.q); }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#111827]/60 text-slate-400 rounded-full border border-slate-800 hover:border-red-500/40 hover:text-red-400 transition-all"
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Side: Smartphone Bezel Frame Simulator (WOW factor matching mockups) */}
        <div className="lg:col-span-7 flex justify-center items-center relative">
          
          {/* Smartphone Bezel */}
          <div className="relative w-[370px] h-[750px] bg-[#0c1221] rounded-[52px] shadow-2xl border-[12px] border-slate-900 flex flex-col overflow-hidden ring-1 ring-slate-800/50">
            
            {/* Top Speaker Notch (Dynamic Island style) */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[110px] h-[28px] bg-black rounded-full z-[1000] flex items-center justify-center border border-slate-900">
              <div className="w-[10px] h-[10px] bg-[#1e2330] rounded-full mr-2"></div>
              <div className="w-[45px] h-[4px] bg-[#1a1c24] rounded-full"></div>
            </div>

            {/* Status bar (Mockup style header alignment) */}
            <div className="pt-2 px-6 flex justify-between items-center text-[11px] font-bold text-slate-300 z-[999] bg-[#0c1221] shrink-0 h-[28px]">
              <div>21:07</div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px]">📶</span>
                <span className="text-[10px]">🔋 88%</span>
              </div>
            </div>

            {/* Scrollable Simulator App Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#0c1221] px-4 pb-20 pt-1 space-y-4">
              
              {/* Active Incident Warning Indicator */}
              <div className="flex items-center justify-between bg-red-950/30 border border-red-500/30 p-2.5 rounded-xl text-xs font-bold text-red-400 shadow-lg shadow-red-500/5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} className="animate-pulse" />
                  <span>ACTIVE EMERGENCY DECK ENABLED</span>
                </div>
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">INCIDENTS: 18</span>
              </div>

              {/* Glowing SOS Button component */}
              <SOSButton location={location} address={address} />

              {/* Location display card */}
              <div className="bg-[#111827] rounded-2xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                      <MapPin size={16} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Location</p>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {loading && !isSearchingLocation ? 'GPS Syncing...' : (address?.display_name || 'Acquiring Lat/Lng...')}
                      </p>
                    </div>
                  </div>
                  <button onClick={initData} className="p-1.5 text-slate-500 hover:text-red-400 transition" title="Use GPS Location">
                    <RefreshCw size={16} className={loading && !isSearchingLocation ? 'animate-spin' : ''} />
                  </button>
                </div>
                <form onSubmit={handleManualSearch} className="flex items-center space-x-2 border-t border-slate-800 pt-2">
                  <input 
                    type="text" 
                    placeholder="Search coordinates offline..." 
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="flex-1 text-[11px] p-2 rounded-lg bg-slate-950 text-white border border-transparent focus:border-red-500 outline-none transition-all"
                  />
                  <button type="submit" disabled={loading} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                    <Search size={12} />
                  </button>
                </form>
              </div>

              {/* Speed Monitor Widget */}
              <SpeedMonitor location={location} />

              {/* Local Triage / Accident Guide */}
              <AccidentGuide />

              {/* Emergency Hotline Directories */}
              <EmergencyNumbers />

              {/* Automated Incident Report Creator */}
              <AccidentReport location={location} address={address} pois={pois} />

              {/* Accident Hotspots map alerts */}
              <AccidentHotspots location={location} />

              {/* Nearby list section inside simulator */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-white">Emergency Services</h3>
                  <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-900/50">
                    {pois.length} cached contacts
                  </span>
                </div>
                
                {/* Category Filters */}
                <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {['all', 'hospital', 'pharmacy', 'police', 'fire'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                        categoryFilter === cat 
                          ? 'bg-red-600 text-white border-red-500' 
                          : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-2 bg-yellow-950/20 text-yellow-400 rounded-lg text-center text-[10px] font-bold border border-yellow-900/30">
                    ⚠️ {error}
                  </div>
                )}

                {/* Leaflet Map Preview (Widescreen Mockup Style) */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                  <MapWrapper location={location} pois={filteredPois} />
                </div>
                
                {/* Emergency Contacts List */}
                <EmergencyList location={location} pois={filteredPois} />
              </div>

              {/* Current alerts bottom drawer panel matching the mockup exactly */}
              <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Alerts ({mockAlerts.length})</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <div className="space-y-2">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="flex justify-between items-center text-xs p-2 bg-[#0c1221] rounded-xl border border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">🔥</span>
                        <div>
                          <p className="font-bold text-slate-200">{alert.title}</p>
                          <p className="text-[10px] text-slate-500">{alert.detail}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/30 px-2 py-0.5 rounded-md font-bold">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom footer text inside app */}
              <p className="text-[9px] text-slate-600 text-center pt-2">
                Offline-First Spatial Directory | Road Safety Hackathon 2026
              </p>
            </div>

            {/* Bottom Home Indicator Bar (Swipe Bar) */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[130px] h-[5px] bg-slate-700 rounded-full z-[1000]"></div>
          </div>
          
        </div>
      </div>

      {/* Floating AI chatbot formatted like the mockup bubble */}
      <AIChatbot onFilterChange={setCategoryFilter} isDemoMode={isDemoMode} />
      
      {/* Floating voice activator */}
      <VoiceSOS onVoiceInput={(text) => {
        const event = new CustomEvent('voiceInput', { detail: text });
        window.dispatchEvent(event);
      }} />
      
      {/* Accelerometer Shake listener */}
      <ShakeDetector onShake={() => {
        const sosBtn = document.querySelector('[data-sos-trigger]');
        if (sosBtn) sosBtn.click();
      }} />
    </div>
  );
}

export default App;
