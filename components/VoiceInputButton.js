'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function VoiceInputButton({ onTranscript, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const { language } = useLanguage();

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (currentTranscript.trim() && onTranscript) {
        onTranscript(currentTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech Recognition is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Stop recording voice note' : 'Click to dictate via microphone (Web Speech API)'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
      } ${className}`}
    >
      {isListening ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-ping mr-0.5" />
          <MicOff className="w-3.5 h-3.5" />
          <span>Listening... (Click to stop)</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-emerald-600" />
          <span>Voice Dictate</span>
        </>
      )}
    </button>
  );
}
