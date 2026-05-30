import React, { useState, useRef, useEffect } from 'react';
import { Timer, AlertTriangle, CheckCircle2, Volume2, VolumeOff } from 'lucide-react';

// Generate a buzzing alarm using Web Audio API (no external files needed)
const createBuzzer = () => {
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let isPlaying = false;
  let intervalId = null;

  const start = () => {
    if (isPlaying) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = 0.3;

      // Create a pulsing buzz pattern
      let buzzing = true;
      const buzz = () => {
        if (!audioCtx) return;
        if (buzzing) {
          oscillator = audioCtx.createOscillator();
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = 440;
          oscillator.connect(gainNode);
          oscillator.start();
        } else {
          if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
          }
        }
        buzzing = !buzzing;
      };

      buzz();
      intervalId = setInterval(buzz, 600); // Pulse on/off every 600ms for a longer beep
      isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  };

  const stop = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    if (oscillator) {
      try { oscillator.stop(); } catch (e) {}
      oscillator.disconnect();
      oscillator = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    isPlaying = false;
  };

  return { start, stop };
};

export default function SpeedMonitor({ location }) {
  const [speed, setSpeed] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [speedAlert, setSpeedAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const buzzerRef = useRef(createBuzzer());

  const SPEED_LIMIT = 80; // km/h

  // Start/stop buzzer based on alert state
  useEffect(() => {
    if (speedAlert && soundEnabled) {
      buzzerRef.current.start();
    } else {
      buzzerRef.current.stop();
    }
    return () => buzzerRef.current.stop();
  }, [speedAlert, soundEnabled]);

  const startMonitoring = () => {
    if (!navigator.geolocation) return;
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.speed !== null) {
          const kmh = Math.round(position.coords.speed * 3.6); // m/s to km/h
          setSpeed(kmh);
          setSpeedAlert(kmh > SPEED_LIMIT);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    setWatchId(id);
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setIsMonitoring(false);
    setSpeed(null);
    setSpeedAlert(false);
    buzzerRef.current.stop();
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm border transition-all duration-300 ${
      speedAlert 
        ? 'bg-red-600 dark:bg-red-700 border-red-700 text-white animate-pulse shadow-red-500/50 shadow-lg scale-[1.02]' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${speedAlert ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <Timer size={20} />
          </div>
          <div>
            <p className={`font-bold text-sm ${speedAlert ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Speed Monitor</p>
            <p className={`text-xs ${speedAlert ? 'text-white/80' : 'text-gray-500'}`}>{isMonitoring ? 'Tracking your speed' : 'Tap to start'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isMonitoring && speed !== null && (
            <div className={`text-right ${speedAlert ? 'animate-pulse' : ''}`}>
              <p className={`text-2xl font-black ${speedAlert ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {speed}
              </p>
              <p className={`text-[10px] font-bold uppercase ${speedAlert ? 'text-white/80' : 'text-gray-400'}`}>km/h</p>
            </div>
          )}

          {isMonitoring && (
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg transition ${soundEnabled ? (speedAlert ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700') : (speedAlert ? 'text-white font-bold' : 'text-red-400 hover:text-red-600')}`}
              title={soundEnabled ? 'Mute alarm' : 'Unmute alarm'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeOff size={16} />}
            </button>
          )}

          <button
            onClick={() => {
              buzzerRef.current.start();
              setTimeout(() => buzzerRef.current.stop(), 3000);
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
          >
            🔊 Test
          </button>

          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              isMonitoring 
                ? 'bg-white text-red-700 hover:bg-gray-100' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {speedAlert && (
        <div className="mt-3 flex items-center space-x-2 bg-white text-red-700 p-2 rounded-lg font-bold">
          <AlertTriangle size={16} className="shrink-0" />
          <p className="text-xs">🔊 OVERSPEED ALERT! Exceeding {SPEED_LIMIT} km/h — Slow down!</p>
        </div>
      )}

      {isMonitoring && !speedAlert && speed !== null && (
        <div className="mt-3 flex items-center space-x-2 text-green-600 dark:text-green-400 p-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <p className="text-xs font-medium">Driving within safe speed limits</p>
        </div>
      )}
    </div>
  );
}
