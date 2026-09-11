'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  ShieldCheck,
  Languages,
  Loader2
} from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import { useLanguage } from '@/components/LanguageContext';

function parseInlineMarkdown(text) {
  if (!text) return '';

  const clean = String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '');

  const lines = clean.split('\n');

  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

    const renderedParts = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-bold text-stone-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-stone-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={i} className="bg-stone-100 text-emerald-800 px-1 py-0.5 rounded text-[10px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {lineIdx > 0 && <br />}
        {renderedParts}
      </React.Fragment>
    );
  });
}

function FormattedChatContent({ text }) {
  if (!text) return null;

  const rawText = String(text).replace(/\r\n/g, '\n');
  const rawLines = rawText.split('\n');
  const elements = [];

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (/^---+$/.test(trimmed) || /^===+$/.test(trimmed)) {
      elements.push(<hr key={`hr-${idx}`} className="my-2 border-stone-200" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${idx}`} className="font-bold text-emerald-950 text-xs mt-2 mb-0.5">
          {parseInlineMarkdown(trimmed.replace(/^###\s*/, ''))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${idx}`} className="font-extrabold text-emerald-950 text-xs sm:text-sm mt-2 mb-1 pb-0.5 border-b border-stone-100">
          {parseInlineMarkdown(trimmed.replace(/^##\s*/, ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${idx}`} className="font-black text-emerald-950 text-sm mt-2 mb-1">
          {parseInlineMarkdown(trimmed.replace(/^#\s*/, ''))}
        </h2>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <span className="flex-1 leading-relaxed text-stone-800">
            {parseInlineMarkdown(numMatch[2])}
          </span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      elements.push(
        <div key={`bullet-${idx}`} className="flex items-start gap-2 my-0.5 pl-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
          <span className="flex-1 leading-relaxed text-stone-800">
            {parseInlineMarkdown(trimmed.replace(/^[-*•]\s*/, ''))}
          </span>
        </div>
      );
      return;
    }

    if (!trimmed) {
      elements.push(<div key={`space-${idx}`} className="h-1" />);
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed text-stone-800 my-0.5">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
}

export default function MultiAgentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLang, setChatLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Initialize Welcome Message
  useEffect(() => {
    const isHi = chatLang === 'hi';
    const welcomeText = isHi
      ? `नमस्ते! मैं **Ayush AI** हूँ — आपका सम्पूर्ण क्लिनिकल एवं आयुर्वेदिक सहायक।\n\nमैं आपकी निम्नलिखित विषयों में सहायता कर सकता हूँ:\n1. **त्रिदोष संतुलन:** वात, पित्त, कफ एवं प्रकृति अनुसार पथ्य-अपथ्य आहार।\n2. **क्लिनिकल परीक्षा:** अष्टविध नाड़ी परीक्षा, जिह्वा व दोहरे ICD-11 निदान।\n3. **हर्ब-ड्रग सुरक्षा:** आयुर्वेदिक व एलोपैथिक दवाओं के परस्पर प्रभाव।\n4. **शास्त्रीय औषधियां:** अश्वगंधा, त्रिफला, गिलोय आदि का सही अनुपान।\n\nआज आप किस विषय पर परामर्श चाहते हैं?`
      : `Namaste! I am **Ayush AI**, your all-in-one clinical decision support and Ayurvedic assistant.\n\nI can assist you with:\n1. **Tridosha Balance:** Identifying Vata, Pitta, Kapha imbalances & personalized diet.\n2. **Clinical Pariksha:** Ashtavidha Nadi pulse, tongue examination & dual ICD-11 coding.\n3. **Herb-Drug Safety:** Interactions between herbal formulations & allopathic medicines.\n4. **Classical Formulations:** Proper usage and Anupana for herbs (Ashwagandha, Triphala, etc.).\n\nWhat health question or clinical topic would you like to explore today?`;

    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        agentName: 'Ayush AI',
        text: welcomeText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [chatLang]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('open-ayush-chatbot', handleOpen);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-ayush-chatbot', handleOpen);
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText : inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/multi-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ayur_vaidya',
          message: textToSend.trim(),
          language: chatLang
        })
      });

      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: 'Ayush AI',
        text: data.response || 'I am ready to assist with your AYUSH clinical questions.',
        isOutOfDomain: Boolean(data.isOutOfDomain),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: 'Ayush AI',
        text: 'Ayurveda guidance: Balance Doshas with wholesome Pathya diet, Deepana-Pachana herbs, and consult an AYUSH physician.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    chatLang === 'hi' ? 'पित्त दोष और एसिडिटी का आहार?' : 'Diet to pacify high Pitta & acidity?',
    chatLang === 'hi' ? 'अश्वगंधा के फायदे और सावधानियां?' : 'Ashwagandha benefits & precautions?',
    chatLang === 'hi' ? 'नाड़ी परीक्षा में सर्प गति का अर्थ?' : 'What is Sarpa Gati in Nadi Pariksha?',
    chatLang === 'hi' ? 'मेटफॉर्मिन और शिलाजीत की सुरक्षा?' : 'Can I take Metformin with Shilajit?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Collapsed Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-800 via-herb to-teal-900 text-white shadow-2xl hover:shadow-emerald-700/40 transition transform hover:-translate-y-1 ring-2 ring-amber-400/70 animate-bounce hover:animate-none"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider block text-amber-300 flex items-center gap-1.5">
              <span>Ayush AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </span>
            <span className="text-[10px] text-emerald-100 font-medium">
              Clinical & Ayurvedic Assistant
            </span>
          </div>
        </button>
      )}

      {/* Expanded Unified Dialog Box */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[460px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-emerald-700/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-herb to-teal-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  <span>Ayush AI</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black uppercase">
                    All-In-One
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-200">
                  Ayurvedic clinical guidance, doshas & herbal safety
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <button
                onClick={() => setChatLang(chatLang === 'en' ? 'hi' : 'en')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-emerald-200 transition flex items-center gap-1 border border-white/15"
                title="Toggle Language"
              >
                <Languages className="w-3 h-3" />
                <span>{chatLang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Banner */}
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                🌿 Tridoshas • Pariksha • Herb Safety
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              AYUSH Verified
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl space-y-1 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                      : msg.isOutOfDomain
                      ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-tl-xs shadow-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-100 text-[10px] text-stone-400 font-bold uppercase">
                      <span>{msg.agentName}</span>
                      <span>{msg.time}</span>
                    </div>
                  )}
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-line font-medium text-white">{msg.text}</p>
                  ) : (
                    <FormattedChatContent text={msg.text} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span className="italic">Ayush AI is formulating clinical answer...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-t border-stone-100 flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 transition text-stone-600 font-medium text-left truncate max-w-[210px]"
                title={p}
              >
                💡 {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <VoiceInputButton
              onTranscript={(text) => setInputMessage((prev) => (prev ? prev + ' ' + text : text))}
              language={chatLang === 'hi' ? 'hi' : 'en'}
            />

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                chatLang === 'hi'
                  ? 'Ayush AI से कोई भी स्वास्थ्य प्रश्न पूछें...'
                  : 'Ask Ayush AI any clinical or Ayurvedic question...'
              }
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-herb hover:from-emerald-800 hover:to-emerald-900 text-white shadow-xs transition disabled:opacity-40 shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
