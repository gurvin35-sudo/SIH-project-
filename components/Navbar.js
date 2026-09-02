'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Leaf,
  Users,
  LayoutDashboard,
  FilePlus2,
  LogOut,
  User,
  Menu,
  X,
  Globe,
  Award,
  Sparkles
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/patients', label: t('patients'), icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
      {/* Top Ministry of Ayush & SIH Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-herb to-emerald-950 text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-between shadow-inner">
        <div className="hidden sm:flex items-center gap-1.5 opacity-90">
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>Smart India Hackathon 2026 • Ministry of Ayush (Theme: Smart Automation)</span>
        </div>
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1 text-emerald-200">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Ayurvedic Clinical Intelligence</span>
          </span>
          <div className="h-3 w-px bg-emerald-700/60" />
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-emerald-800/80 rounded-md px-1.5 py-0.5 border border-emerald-600/40">
            <Globe className="w-3 h-3 text-emerald-300" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 rounded text-[10px] font-bold transition ${
                language === 'en' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 rounded text-[10px] font-bold transition ${
                language === 'hi' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-herb-light flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-emerald-950 tracking-tight">AyushCase</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  AYUSH
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium hidden sm:block">
                {language === 'hi' ? 'आयुष क्लिनिकल केस-टेकिंग सॉफ्टवेयर' : 'Patient Case-Taking System'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {status === 'loading' ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="h-8 w-24 bg-stone-100 rounded-lg animate-pulse" />
            </div>
          ) : session ? (
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                          : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Patient Portal Link */}
              <Link
                href="/patient-portal"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Patient Portal</span>
              </Link>

              {/* Quick Take Case CTA */}
              <Link
                href="/patients"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>{t('newCase')}</span>
              </Link>

              {/* Doctor Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-800 leading-tight">
                      {session.user?.name || 'Dr. Sharma'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium leading-none">
                      {session.user?.regNumber ? `Reg: ${session.user.regNumber}` : 'AYUSH Vaidya'}
                    </div>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{session.user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{session.user?.email}</p>
                      {session.user?.clinicName && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          🏥 {session.user.clinicName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/patient-portal"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Patient Portal</span>
              </Link>
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition"
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              >
                {t('signup')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {session && (
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && session && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-2">
          <div className="p-3 bg-stone-50 rounded-xl mb-3">
            <div className="text-xs font-bold text-stone-900">{session.user?.name}</div>
            <div className="text-[11px] text-emerald-700">{session.user?.clinicName || 'Ayurveda Clinic'}</div>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/patients"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{t('newCase')}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </header>
  );
}
