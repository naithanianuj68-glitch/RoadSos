# RoadSoS 🚑

**The Ultimate Offline-First Emergency Network**  
*National Road Safety Hackathon 2026 | Team LifeLane*

---

## 🛑 The Problem
Golden Hour delays cost lives on highways. Over 40% of national highway corridors pass through cellular coverage gaps or dead zones. Standard API-based apps (like Google Maps or Uber) stall immediately with zero bars of signal. Furthermore, victims suffer physical shock, limiting phone interaction, and bystanders often fail to communicate GPS coordinates or recall regional emergency helplines.

## 💡 Our Solution
**RoadSoS is an autonomous, offline-first rescue ecosystem.** It bypasses cellular dependence to ensure continuous safety backup:
*   **IndexedDB Spatial Caching**: Uses `Dexie.js` to store over 1,500+ regional hospital coordinates, pharmacy locations, and local police helpline directories directly on client storage.
*   **Zero Installation Footprint**: As a Progressive Web App (PWA), boot speeds complete in <1.5 seconds. Instantly accessible via SMS web links or vehicle QR code stickers without app store downloads.

## ⚙️ Core Features
1.  🔊 **Audio Siren Wave**: Generates raw 440Hz sawtooth frequencies using Web Audio API to alert nearby rescuers in dark conditions.
2.  🎙️ **Forensic Recorder**: Local MediaRecorder saves 15 seconds of accident audio logs directly to browser indexed storage.
3.  📳 **Impact Shake Detect**: Uses device accelerometer filters to detect structural G-force and auto-dial 112 emergency numbers.
4.  ⚡ **GPS Speed Monitor**: Watches speed velocity via Geolocation API, flashing warning lights and alert buzzers to check limits.
5.  📝 **Report Generator**: Instantly packs lat/lng coordinates, address descriptors, and audio links into text reports.
6.  📍 **Hotspot Map Alerts**: Pre-loads accident-prone blackspot coordinates, warning the driver upon zone entry offline.

## 🛠️ Technical Stack
*   **Frontend**: React + Vite (Single Page Application layout)
*   **Styling**: Tailwind CSS (Dark-mode interface optimized for outdoor high-glare visibility)
*   **Mapping**: Leaflet.js Mapping & OpenStreetMap API (Free, zero Map API licensing fees)
*   **Offline Guard**: PWA Service Worker (Workbox) & IndexedDB (Dexie.js)
*   **AI Integration**: Local Rule-Engine (Offline chatbot) & Claude LLM (Online complex parsing)
*   **Hardware APIs**: Accelerometer, AudioContext, and Media Recording tools

## 🚀 How to Run Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌍 The Impact
Scalable, Zero Cost, Lifesaving Platform. By leveraging free OpenStreetMap datasets and local cache indexing, RoadSoS eliminates runtime overheads, allowing global scaling at zero platform fees.
