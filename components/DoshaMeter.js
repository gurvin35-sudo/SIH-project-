'use client';

import React from 'react';
import { Wind, Flame, Droplets, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function DoshaMeter({ vata = 0, pitta = 0, kapha = 0, result = '' }) {
  const { language } = useLanguage();
  const total = Math.max(1, vata + pitta + kapha);

  const vataPct = Math.round((vata / total) * 100);
  const pittaPct = Math.round((pitta / total) * 100);
  const kaphaPct = Math.round((kapha / total) * 100);

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-5 shadow-xl border border-stone-700">
      <div className="flex items-center justify-between pb-3 border-b border-stone-700/60 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-stone-100 text-sm tracking-wide uppercase">
            {language === 'hi' ? 'दोष एवं प्रकृति विश्लेषण' : 'Dosha & Prakriti Balance'}
          </h3>
        </div>
        {result ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {result}
          </span>
        ) : (
          <span className="text-xs text-stone-400 italic">
            {language === 'hi' ? 'प्रश्नावली पूर्ण करें' : 'Answer questionnaire'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vata Card */}
        <div className="bg-stone-800/80 rounded-xl p-3.5 border border-sky-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sky-300 text-sm">VATA (वात)</div>
                <div className="text-[10px] text-sky-400/80">Air & Ether (वायु + आकाश)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-sky-300">{vataPct}%</span>
              <span className="text-[10px] text-stone-400 block">{vata} pts</span>
            </div>
          </div>
          <div className="w-full bg-stone-700/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${vataPct}%` }}
            />
          </div>
        </div>

        {/* Pitta Card */}
        <div className="bg-stone-800/80 rounded-xl p-3.5 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-300 text-sm">PITTA (पित्त)</div>
                <div className="text-[10px] text-amber-400/80">Fire & Water (तेज + जल)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-amber-300">{pittaPct}%</span>
              <span className="text-[10px] text-stone-400 block">{pitta} pts</span>
            </div>
          </div>
          <div className="w-full bg-stone-700/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pittaPct}%` }}
            />
          </div>
        </div>

        {/* Kapha Card */}
        <div className="bg-stone-800/80 rounded-xl p-3.5 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-emerald-300 text-sm">KAPHA (कफ)</div>
                <div className="text-[10px] text-emerald-400/80">Earth & Water (पृथ्वी + जल)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-emerald-300">{kaphaPct}%</span>
              <span className="text-[10px] text-stone-400 block">{kapha} pts</span>
            </div>
          </div>
          <div className="w-full bg-stone-700/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${kaphaPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
