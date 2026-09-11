'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function VoiceInputButton({
  onTranscript,
  className = '',
  showDemoButton = false,
  onDemoVoice = null,
  lang = null,
  language: propLanguage = null
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const { language: contextLanguage } = useLanguage();
  const currentLang = lang || propLanguage || contextLanguage || 'en';

  // Keep callback ref updated without triggering re-effects
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += transcriptChunk + ' ';
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        if (interimTranscript) {
          setInterimText(interimTranscript);
        }

        if (finalTranscript.trim() && onTranscriptRef.current) {
          setInterimText('');
          onTranscriptRef.current(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status/error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          setInterimText('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init failed:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [currentLang]);

  const toggleListening = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!isSupported) {
      alert(
        currentLang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया Google Chrome या Microsoft Edge का उपयोग करें।'
          : 'Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      setInterimText('');
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.warn('Could not start recognition (already started or permission issue):', err);
        // If already active, restart cleanly
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
            setIsListening(true);
          }, 200);
        } catch (e) {}
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening
            ? (currentLang === 'hi' ? 'माइक बंद करें' : 'Stop voice recording')
            : (currentLang === 'hi' ? 'माइक द्वारा बोलकर दर्ज करें' : 'Click to dictate via microphone (Web Speech API)')
        }
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300 shadow-rose-600/30'
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 hover:border-emerald-400'
        } ${className}`}
      >
        {isListening ? (
          <>
            <div className="flex items-center gap-0.5 mr-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <MicOff className="w-3.5 h-3.5" />
            <span>{currentLang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{currentLang === 'hi' ? 'माइक से बोलें' : 'Voice Dictate'}</span>
          </>
        )}
      </button>

      {/* Floating live interim feedback pill */}
      {isListening && interimText && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-stone-900/90 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in flex items-center gap-1.5 border border-stone-700">
          <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="italic">{interimText}...</span>
        </div>
      )}
    </div>
  );
}
