import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function VoiceSOS({ onVoiceInput }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported(!!SpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;

    // Tear down any previous instance
    stopListening();

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && onVoiceInput) {
        onVoiceInput(transcript);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onVoiceInput, stopListening]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!supported) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center">
      {/* "Listening…" label */}
      {isListening && (
        <span className="mb-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-lg animate-pulse select-none">
          Listening…
        </span>
      )}

      {/* Mic button */}
      <button
        onClick={handleToggle}
        aria-label={isListening ? 'Stop listening' : 'Start voice SOS'}
        className={`
          flex items-center justify-center
          h-14 w-14 rounded-full shadow-2xl
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse focus:ring-red-500'
              : 'bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500'
          }
        `}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
}
