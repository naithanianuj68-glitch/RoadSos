import React, { useState, useMemo } from 'react';
import { Globe, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const EMERGENCY_DB = [
  { code: 'IN', flag: '🇮🇳', name: 'India',        police: '100',  ambulance: '102', fire: '101', universal: '112' },
  { code: 'US', flag: '🇺🇸', name: 'United States', police: '911',  ambulance: '911', fire: '911', universal: '911' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom',police: '999',  ambulance: '999', fire: '999', universal: '112' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',       police: '110',  ambulance: '112', fire: '112', universal: '112' },
  { code: 'FR', flag: '🇫🇷', name: 'France',        police: '17',   ambulance: '15',  fire: '18',  universal: '112' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',     police: '000',  ambulance: '000', fire: '000', universal: '000' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',         police: '110',  ambulance: '119', fire: '119', universal: '110' },
  { code: 'CN', flag: '🇨🇳', name: 'China',         police: '110',  ambulance: '120', fire: '119', universal: '110' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil',        police: '190',  ambulance: '192', fire: '193', universal: '190' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE',           police: '999',  ambulance: '998', fire: '997', universal: '112' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',        police: '911',  ambulance: '911', fire: '911', universal: '911' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa',  police: '10111',ambulance: '10177',fire:'10177',universal: '112' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia',        police: '102',  ambulance: '103', fire: '101', universal: '112' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',     police: '999',  ambulance: '995', fire: '995', universal: '999' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand',      police: '191',  ambulance: '1669',fire: '199', universal: '191' },
];

function detectCountryCode() {
  try {
    const lang = navigator.language || navigator.userLanguage || '';
    const parts = lang.split('-');
    if (parts.length >= 2) {
      return parts[1].toUpperCase();
    }
    // Fallback: map primary language subtag to likely country
    const langMap = {
      en: 'US', hi: 'IN', de: 'DE', fr: 'FR', ja: 'JP',
      zh: 'CN', pt: 'BR', ru: 'RU', th: 'TH', ar: 'AE',
    };
    return langMap[parts[0].toLowerCase()] || '';
  } catch {
    return '';
  }
}

function NumberBadge({ label, number, color }) {
  return (
    <a
      href={`tel:${number}`}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
      <span className="flex items-center gap-1 font-bold text-sm">
        <Phone size={12} />
        {number}
      </span>
    </a>
  );
}

function CountryCard({ country, isHome }) {
  return (
    <div
      className={`rounded-xl p-4 transition-all ${
        isHome
          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
          : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{country.flag}</span>
        <span className="font-bold text-gray-900 dark:text-white text-sm">{country.name}</span>
        {isHome && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full">
            Your Country
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberBadge label="Police"    number={country.police}    color="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" />
        <NumberBadge label="Ambulance" number={country.ambulance} color="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" />
        <NumberBadge label="Fire"      number={country.fire}      color="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" />
        <NumberBadge label="Universal" number={country.universal} color="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" />
      </div>
    </div>
  );
}

export default function EmergencyNumbers() {
  const [expanded, setExpanded] = useState(false);

  const { homeCountry, otherCountries } = useMemo(() => {
    const code = detectCountryCode();
    const home = EMERGENCY_DB.find((c) => c.code === code) || null;
    const others = EMERGENCY_DB.filter((c) => c.code !== code);
    return { homeCountry: home, otherCountries: others };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center space-x-3">
          <Globe className="text-blue-500" />
          <span className="font-bold text-gray-900 dark:text-white">🌍 Emergency Numbers Worldwide</span>
        </div>
        {expanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Detected home country — shown first & highlighted */}
          {homeCountry && <CountryCard country={homeCountry} isHome />}

          {/* Other countries in a scrollable grid */}
          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {otherCountries.map((country) => (
              <CountryCard key={country.code} country={country} isHome={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
