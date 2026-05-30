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
import { AlertCircle, MapPin, RefreshCw, WifiOff, Beaker, Search, ShieldAlert, Menu, X, Navigation } from 'lucide-react';
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
  
  // Sidebar overlay inside phone
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false);

  // Custom alerts matching the mockup exactly
  const [mockAlerts] = useState([
    { id: 1, title: 'OAK ST FIRE', subtitle: 'ACTIVE FIRE OUTBREAK', type: 'fire', icon: '🔥' },
    { id: 2, title: 'MEDICAL AID - 5TH AVE', subtitle: 'AMBULANCE RESPONDING', type: 'medical', icon: '🩺' },
    { id: 3, title: 'POLICE ACTIVITY', subtitle: 'TRAFFIC ACCIDENT AHEAD', type: 'police', icon: '👮' }
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
      setIsPhoneMenuOpen(false); // Close sidebar menu inside phone on search success
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
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col items-center justify-center p-2 md:p-6 overflow-x-hidden font-sans relative selection:bg-red-500/30">
      
      {/* Decorative neon backdrops */}
      <div className="absolute top-10 left-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-950/15 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-950/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
      
      {/* Master Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side Panel: Info, Search and Local Features */}
        <div className="lg:col-span-5 space-y-5 text-center lg:text-left px-2">
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
          
          <p className="text-slate-300 text-sm leading-relaxed">
            A state-of-the-art emergency assistant built to survive cellular gaps and provide critical location mapping during highway accidents.
          </p>

          {/* Controller */}
          <div className="bg-[#0f1423]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-3.5 shadow-xl text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              ⚙️ Simulator Configuration
            </h3>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-300">Hackathon Mockup Mode:</span>
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${isDemoMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                {isDemoMode ? 'DEMO: ON' : 'LIVE API'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-800/80 pt-2.5">
              <span className="text-xs text-slate-300">Network Connectivity:</span>
              <span className="text-xs text-slate-400 font-bold uppercase">
                {isOffline ? '⚠️ Offline-First Storage' : '🟢 LTE Online Sync'}
              </span>
            </div>
          </div>

          {/* Desktop Left Side Accordion of Dashboard Features */}
          <div className="hidden lg:block space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            <SpeedMonitor location={location} />
            <AccidentGuide />
            <EmergencyNumbers />
            <AccidentReport location={location} address={address} pois={pois} />
            <AccidentHotspots location={location} />
          </div>
        </div>
        
        {/* Right Side: Smartphone Bezel Frame Simulator (WOW factor matching mockup exactly) */}
        <div className="lg:col-span-7 flex justify-center items-center relative">
          
          {/* Smartphone Frame Bezel */}
          <div className="relative w-[360px] h-[720px] bg-[#0c1221] rounded-[48px] shadow-2xl border-[11px] border-slate-900 flex flex-col overflow-hidden ring-1 ring-slate-800/50">
            
            {/* Top Speaker Notch (Dynamic Island) */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-[100px] h-[24px] bg-black rounded-full z-[1000] flex items-center justify-center border border-slate-900">
              <div className="w-[8px] h-[8px] bg-[#1e2330] rounded-full mr-2"></div>
              <div className="w-[40px] h-[3px] bg-[#1a1c24] rounded-full"></div>
            </div>

            {/* Status bar */}
            <div className="pt-2 px-6 flex justify-between items-center text-[10px] font-bold text-slate-300 z-[999] bg-transparent shrink-0 h-[26px]">
              <div>21:07</div>
              <div className="flex items-center space-x-1">
                <span className="text-[9px]">📶</span>
                <span className="text-[9px]">5G</span>
                <span className="text-[9px]">🔋</span>
              </div>
            </div>

            {/* Simulated Mobile Viewport Container */}
            <div className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
              
              {/* FULL BLEED BACKGROUND MAP (Matches the mockup exactly) */}
              <div className="absolute inset-0 z-0 w-full h-full">
                <MapWrapper location={location} pois={filteredPois} isFullBleed={true} />
              </div>

              {/* Floating Menu Button Trigger Inside Mobile App */}
              <button 
                onClick={() => setIsPhoneMenuOpen(true)}
                className="absolute top-4 left-4 z-[999] pointer-events-auto p-2 bg-[#0c1221]/95 border border-slate-800 text-white rounded-xl shadow-lg backdrop-blur-md hover:bg-slate-900 transition"
              >
                <Menu size={16} />
              </button>

              {/* FLOATING HEADER & SOS BUTTON (Overlayed on top of the Map) */}
              <div className="absolute top-4 inset-x-0 z-[500] pointer-events-none flex flex-col items-center px-4 space-y-3">
                
                {/* Simulated header title */}
                <div className="w-full max-w-[200px] mx-auto text-center pointer-events-auto bg-[#0c1221]/90 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full shadow-lg">
                  <h2 className="text-[10px] text-white font-bold tracking-widest uppercase mb-0.5">Emergency Map</h2>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Active Incidents: 18</p>
                </div>

                {/* Floating SOS button */}
                <div className="pointer-events-auto mt-2">
                  <SOSButton location={location} address={address} />
                </div>
              </div>

              {/* FLOATING CURRENT ALERTS DRAWER (At the bottom overlaying the Map) */}
              <div className="absolute bottom-4 inset-x-4 z-[500] pointer-events-auto bg-[#0c1221]/95 border border-slate-800/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Alerts ({mockAlerts.length})</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="flex justify-between items-center text-[10px] p-2 bg-[#060913]/90 rounded-xl border border-slate-900/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{alert.icon}</span>
                        <div>
                          <p className="font-bold text-slate-200 tracking-wide">{alert.title}</p>
                          <p className="text-[8px] text-slate-500 font-medium">{alert.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[8px] bg-red-950/40 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded-md font-bold uppercase">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLIDE-OUT PANEL INSIDE SIMULATOR (To access search, directory, guide, etc. on mobile) */}
              {isPhoneMenuOpen && (
                <div className="absolute inset-0 z-[1000] bg-[#0c1221]/98 backdrop-blur-md flex flex-col p-4 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Project Console</span>
                    <button 
                      onClick={() => setIsPhoneMenuOpen(false)}
                      className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                    {/* Location Card */}
                    <div className="bg-[#111827] rounded-xl p-3 border border-slate-800 space-y-2">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Search Coordinate Index</p>
                      <form onSubmit={handleManualSearch} className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          placeholder="Search Delhi, London..." 
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                          className="flex-1 text-[11px] p-2 rounded-lg bg-slate-950 text-white border border-transparent focus:border-red-500 outline-none"
                        />
                        <button type="submit" className="p-2 bg-red-600 text-white rounded-lg">
                          <Search size={12} />
                        </button>
                      </form>
                    </div>

                    {/* Speed, hotline andguide directories */}
                    <SpeedMonitor location={location} />
                    <AccidentGuide />
                    <EmergencyNumbers />
                    <EmergencyList location={location} pois={filteredPois} />
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Home Indicator Bar (Swipe Bar) */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-[120px] h-[4px] bg-slate-700 rounded-full z-[1000]"></div>
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
