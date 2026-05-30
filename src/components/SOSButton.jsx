import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, XOctagon, Mic } from 'lucide-react';

const createSiren = () => {
  let audioCtx = null;
  let osc = null;
  let gain = null;
  let isPlaying = false;
  let interval = null;

  const start = () => {
    if (isPlaying) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);
      gain.gain.value = 1.0; // Max volume

      let high = true;
      const sirenPulse = () => {
        if (!audioCtx) return;
        if (osc) { osc.stop(); osc.disconnect(); }
        osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = high ? 1200 : 800; // Piercing Police siren frequencies
        osc.connect(gain);
        osc.start();
        high = !high;
      };

      sirenPulse();
      interval = setInterval(sirenPulse, 400); // Toggle every 400ms
      isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  };

  const stop = () => {
    if (interval) clearInterval(interval);
    interval = null;
    if (osc) {
      try { osc.stop(); } catch (e) {}
      osc.disconnect();
      osc = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    isPlaying = false;
  };

  return { start, stop };
};

export default function SOSButton({ location, address }) {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const sirenRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    sirenRef.current = createSiren();
    return () => {
      sirenRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const triggerSMSWhatsApp = () => {
    let text = "🚨 SOS! I am in grave danger or had an accident. ";
    if (location) text += `My GPS location: https://maps.google.com/?q=${location.lat},${location.lng}. `;
    if (address && address.display_name) text += `Address: ${address.display_name}.`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
      setTimeout(() => {
        window.location.href = `sms:?body=${encodeURIComponent(text)}`;
      }, 1500);
    } else {
      navigator.clipboard.writeText(text);
      console.log("Emergency message copied to clipboard.");
    }
  };

  const startSOS = async () => {
    setIsActive(true);
    setCountdown(5);
    setAudioUrl(null);
    audioChunksRef.current = [];

    // 1. Start Siren
    sirenRef.current.start();

    // 2. Start Haptics
    if (navigator.vibrate) {
      navigator.vibrate([500, 250, 500, 250, 500, 250, 1000]);
    }

    // 3. Start Audio Recording (Blackbox)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // close mic
      };
      
      mediaRecorder.start();
    } catch (err) {
      console.warn("Microphone access denied or not supported.", err);
    }

    // 4. Start Countdown
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          executeFinalSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeFinalSOS = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    
    // Stop recording and siren
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    sirenRef.current.stop();
    setIsActive(false);

    // Trigger messages
    triggerSMSWhatsApp();
    
    // Auto-dial 112 (Requires user interaction context, so it might prompt on some browsers)
    setTimeout(() => {
      window.location.href = 'tel:112';
    }, 500);
  };

  const cancelSOS = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
    sirenRef.current.stop();
    if (navigator.vibrate) navigator.vibrate(0); // stop vibration
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      {/* 5. Strobe Light Overlay */}
      {isActive && (
        <div className="fixed inset-0 z-[200] pointer-events-none animate-pulse" style={{ backgroundColor: 'rgba(255, 0, 0, 0.4)' }}>
        </div>
      )}

      {!isActive ? (
        <div className="space-y-3 relative z-10">
          <button 
            onClick={startSOS}
            data-sos-trigger="true"
            className="w-full bg-emergency-red hover:bg-red-700 text-white font-bold py-8 px-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-2 transition-transform active:scale-95 border-4 border-red-800 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-600 animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <AlertCircle size={56} className="animate-pulse relative z-10" />
            <span className="text-4xl md:text-5xl tracking-widest uppercase relative z-10 drop-shadow-md">SOS</span>
            <span className="text-sm md:text-base opacity-90 relative z-10 tracking-wide uppercase font-semibold">Tap to Broadcast Emergency</span>
          </button>
          
          {audioUrl && (
            <div className="bg-gray-900 text-white p-4 rounded-2xl flex items-center justify-between border border-gray-700 shadow-lg animate-fade-in">
              <div className="flex items-center space-x-2">
                <Mic className="text-red-500 animate-pulse" size={20} />
                <span className="text-sm font-bold">Blackbox Audio Saved</span>
              </div>
              <audio src={audioUrl} controls className="h-8 w-40" />
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={cancelSOS}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-10 px-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-2 transition-transform active:scale-95 border-4 border-gray-700 relative z-[201]"
        >
          <XOctagon size={56} className="text-red-500 animate-pulse" />
          <span className="text-4xl md:text-5xl tracking-widest uppercase text-red-500">CANCEL</span>
          <span className="text-xl font-mono bg-red-500 text-white px-4 py-1 rounded-full mt-2 animate-bounce">00:0{countdown}</span>
          <span className="text-xs text-gray-400 mt-2">Auto-dialing 112 in {countdown}s...</span>
        </button>
      )}
    </>
  );
}
