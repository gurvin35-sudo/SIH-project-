'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Leaf,
  Stethoscope,
  AlertTriangle,
  HeartPulse,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  Layers,
  CheckCircle2,
  Languages
} from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';
import { useLanguage } from '@/components/LanguageContext';

const AGENTS = [
  {
    id: 'ayur_vaidya',
    name: 'AyurVaidya AI',
    role: 'Classical Ayurveda & Doshas',
    icon: Leaf,
    color: 'from-emerald-600 to-teal-700',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Tridosha balance, Prakriti constitution, herbs & Pathya-Apathya diet.'
  },
  {
    id: 'clinical_pariksha',
    name: 'Clinical Pariksha',
    role: 'Doctor & Case Guide',
    icon: Stethoscope,
    color: 'from-purple-600 to-indigo-700',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Ashtavidha Pariksha, Nadi diagnosis, Agni/Koshta & dual ICD-11 coding.'
  },
  {
    id: 'herb_drug_safety',
    name: 'AyushGuard',
    role: 'Herb-Drug Interactions',
    icon: AlertTriangle,
    color: 'from-amber-600 to-orange-700',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Interactions between herbal formulations and modern allopathic medicines.'
  },
  {
    id: 'patient_navigator',
    name: 'AyushCare',
    role: 'Patient Companion',
    icon: HeartPulse,
    color: 'from-sky-600 to-blue-700',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    description: 'Simple symptom explanations, Anupana rules & pre-consultation readiness.'
  }
];

function parseInlineMarkdown(text) {
  if (!text) return '';

  // Clean raw HTML tags (e.g. <b>, <p>, <span>) except keep text
  const clean = String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '');

  // Split by newlines first if any
  const lines = clean.split('\n');

  return lines.map((line, lineIdx) => {
    // Match bold **...**, italics *...*, or inline code `...`
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

  // Normalize newlines
  const rawText = String(text).replace(/\r\n/g, '\n');

  // Split lines while keeping table rows intact even if cells contain <br>
  const rawLines = rawText.split('\n');
  const lines = [];

  rawLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Table row: keep in one line so table parsing is not corrupted
      lines.push(trimmed);
    } else {
      // Split on <br> for regular lines
      const subLines = trimmed.split(/<br\s*\/?>/gi);
      subLines.forEach((sl) => {
        if (sl.trim() || subLines.length === 1) {
          lines.push(sl.trim());
        }
      });
    }
  });

  const elements = [];
  let tableRows = [];
  let tableHeaders = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div
          key={`table-${elements.length}`}
          className="my-2.5 overflow-hidden rounded-xl border border-stone-200 bg-stone-50/70 p-2 space-y-2"
        >
          {tableRows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-2xs text-[11px] space-y-1"
            >
              {row.map((cell, cIdx) => (
                <div key={cIdx} className="leading-relaxed">
                  {tableHeaders[cIdx] ? (
                    <span className="font-bold text-emerald-950 mr-1.5">
                      {tableHeaders[cIdx]}:
                    </span>
                  ) : null}
                  <span className="text-stone-700">{parseInlineMarkdown(cell)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    tableHeaders = [];
    tableRows = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table separator row |---|---|
    if (/^\|?\s*[-:]+[-|\s:]*\|?$/.test(trimmed)) {
      return;
    }

    // Table row | col1 | col2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter((c, i, arr) => i > 0 && i < arr.length - 1);

      if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (tableHeaders.length > 0 || tableRows.length > 0) {
      flushTable();
    }

    // Horizontal Rule
    if (/^---+$/.test(trimmed) || /^===+$/.test(trimmed)) {
      elements.push(<hr key={`hr-${idx}`} className="my-2 border-stone-200" />);
      return;
    }

    // Headings
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
        <h3 key={`h3-${idx}`} className="font-extrabold text-emerald-950 text-xs sm:text-sm mt-2.5 mb-1 pb-0.5 border-b border-stone-100">
          {parseInlineMarkdown(trimmed.replace(/^##\s*/, ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${idx}`} className="font-black text-emerald-950 text-sm mt-2.5 mb-1">
          {parseInlineMarkdown(trimmed.replace(/^#\s*/, ''))}
        </h2>
      );
      return;
    }

    // Numbered list (1. item)
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

    // Bullet list (- item or * item)
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

    // Empty lines
    if (!trimmed) {
      elements.push(<div key={`space-${idx}`} className="h-1" />);
      return;
    }

    // Regular paragraphs
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed text-stone-800 my-0.5">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  if (tableRows.length > 0 || tableHeaders.length > 0) {
    flushTable();
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function MultiAgentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState('ayur_vaidya');
  const [inputMessage, setInputMessage] = useState('');
  const [chatLang, setChatLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({});
  const chatEndRef = useRef(null);

  const activeAgent = AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];

  // Initialize greeting messages per agent
  useEffect(() => {
    const initialMessages = {};
    AGENTS.forEach((agent) => {
      let greetText = '';
      if (agent.id === 'ayur_vaidya') {
        greetText =
          chatLang === 'hi'
            ? 'नमस्ते! मैं आयुर्वैद्य एआई हूँ। मैं त्रिदोष (वात-पित्त-कफ), प्रकृति, शास्त्रीय जड़ी-बूटियों एवं पथ्य-अपथ्य आहार पर परामर्श के लिए उपलब्ध हूँ। आप क्या पूछना चाहते हैं?'
            : 'Namaste! I am AyurVaidya AI, specialized in classical Ayurveda, Dosha balance, herbal formulations, and personalized diet regimens. How may I assist you?';
      } else if (agent.id === 'clinical_pariksha') {
        greetText =
          chatLang === 'hi'
            ? 'प्रणाम वैद्य जी! मैं क्लिनिकल परीक्षा सहायक हूँ। मैं अष्टविध परीक्षा (नाड़ी, जिह्वा), अग्नि-कोष्ठ मूल्यांकन और दोहरे ICD-11 निदान में सहायता कर सकता हूँ।'
            : 'Hello Doctor! I am your Clinical Pariksha Assistant. I assist with pulse (Nadi), tongue (Jihva), Agni assessment, and dual Ayurvedic-ICD-11 mapping.';
      } else if (agent.id === 'herb_drug_safety') {
        greetText =
          chatLang === 'hi'
            ? 'आयुषगार्ड में आपका स्वागत है। मैं आयुर्वेदिक औषधियों और एलोपैथिक दवाओं के परस्पर प्रभाव (Herb-Drug Interactions) एवं सुरक्षा सावधानियों की जानकारी देता हूँ।'
            : 'Welcome to AyushGuard. I analyze herb-drug interactions (e.g. Guggulu with Statins/NSAIDs, Shunthi with Anticoagulants) and safety boundaries.';
      } else {
        greetText =
          chatLang === 'hi'
            ? 'नमस्ते! मैं आयुषकेयर पेशेंट साथी हूँ। मैं आपके लक्षणों को सरल भाषा में समझाने, सही अनुपान (गर्म पानी/दूध) और डॉक्टर से मिलने की तैयारी में मदद करता हूँ।'
            : 'Hello! I am your AyushCare Patient Companion. I explain symptoms in simple terms, Anupana dosage rules, and pre-consultation guidance.';
      }

      initialMessages[agent.id] = [
        {
          id: 'welcome',
          sender: 'agent',
          agentId: agent.id,
          agentName: agent.name,
          text: greetText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
    setMessages(initialMessages);
  }, [chatLang]);

  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      if (e.detail?.agentId) {
        setActiveAgentId(e.detail.agentId);
      }
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
  }, [messages, activeAgentId, loading]);

  const currentChat = messages[activeAgentId] || [];

  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText : inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [activeAgentId]: [...(prev[activeAgentId] || []), userMsg]
    }));

    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/multi-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgentId,
          message: textToSend.trim(),
          language: chatLang
        })
      });

      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: activeAgentId,
        agentName: activeAgent.name,
        text: data.response || 'I am ready to assist with your AYUSH clinical questions.',
        isOutOfDomain: Boolean(data.isOutOfDomain),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => ({
        ...prev,
        [activeAgentId]: [...(prev[activeAgentId] || []), botMsg]
      }));
    } catch (err) {
      console.error(err);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: activeAgentId,
        agentName: activeAgent.name,
        text: 'Ayurveda guidance: Balance Doshas with wholesome Pathya diet, Deepana-Pachana herbs, and consult an AYUSH physician.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => ({
        ...prev,
        [activeAgentId]: [...(prev[activeAgentId] || []), errMsg]
      }));
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = {
    ayur_vaidya: [
      chatLang === 'hi' ? 'पित्त दोष और एसिडिटी शांत करने का आहार?' : 'Diet to pacify high Pitta & acidity?',
      chatLang === 'hi' ? 'अश्वगंधा के फायदे और सावधानियां?' : 'Ashwagandha benefits & precautions?'
    ],
    clinical_pariksha: [
      chatLang === 'hi' ? 'नाड़ी परीक्षा में सर्प गति का क्या अर्थ है?' : 'What does Sarpa Gati mean in Nadi Pariksha?',
      chatLang === 'hi' ? 'संधिगतवात का ICD-11 कोड क्या है?' : 'ICD-11 dual mapping for Sandhigatavata?'
    ],
    herb_drug_safety: [
      chatLang === 'hi' ? 'क्या मेटफॉर्मिन के साथ जामुन और शिलाजीत ले सकते हैं?' : 'Metformin with Jamun & Shilajit interactions?',
      chatLang === 'hi' ? 'खून पतला करने वाली दवा और गुग्गुलु का प्रभाव?' : 'Blood thinners (Warfarin) with Guggulu?'
    ],
    patient_navigator: [
      chatLang === 'hi' ? 'दवाई गुनगुने पानी (उष्णोदक) से क्यों लेते हैं?' : 'Why take medicines with warm water (Anupana)?',
      chatLang === 'hi' ? 'डॉक्टर से मिलने से पहले क्या रिपोर्ट अपलोड करें?' : 'What reports to upload before consultation?'
    ]
  };

  const currentPrompts = samplePrompts[activeAgentId] || [];

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

      {/* Expanded Dialog Box */}
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
                    Clinical
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-200">
                  Ayurvedic clinical guidance, doshas & herbal safety
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switch */}
              <button
                onClick={() => setChatLang(chatLang === 'en' ? 'hi' : 'en')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-emerald-200 transition flex items-center gap-1"
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

          {/* 4 Agent Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-stone-100 border-b border-stone-200">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`p-2 rounded-xl text-left transition flex flex-col items-center sm:items-start gap-1 ${
                    isActive
                      ? 'bg-white shadow-xs border border-stone-200 ring-2 ring-emerald-500/40 text-stone-900 font-bold'
                      : 'hover:bg-stone-200/60 text-stone-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    />
                    <span className="text-[10px] truncate hidden sm:inline">{agent.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-[8px] text-stone-400 truncate w-full hidden sm:block">
                    {agent.role}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Agent Subheader Banner */}
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeAgent.badge}`}>
                Active: {activeAgent.name}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              AYUSH Only
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-stone-50/50">
            {currentChat.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-1 text-xs leading-relaxed ${
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
                <span className="italic">{activeAgent.name} is formulating Ayurvedic answer...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Sample Prompts */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-stone-100 flex flex-wrap gap-1.5">
            {currentPrompts.map((p, idx) => (
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
                  ? `${activeAgent.name} से पूछें...`
                  : `Ask ${activeAgent.name}...`
              }
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-herb hover:from-emerald-800 hover:to-emerald-900 text-white shadow-xs transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
