'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Leaf, Lock, Mail, User, Building, Award, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function SignupPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    regNumber: '',
    clinicName: '',
    specialty: 'Ayurveda & Kayachikitsa',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register account');
        setLoading(false);
        return;
      }

      // Automatically sign in the newly registered doctor
      const signInRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-700/20">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {language === 'hi' ? 'चिकित्सक पंजीकरण' : 'Register AYUSH Practitioner'}
          </h1>
          <p className="text-xs text-stone-500">
            Create your clinic account to manage patient records and clinical case sheets
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Doctor Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Rajesh Varma"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@clinic.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                AYUSH Registration Number
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  placeholder="e.g. AYUSH-DL-2022-1044"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Specialty
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
              >
                <option value="Ayurveda & Kayachikitsa">Ayurveda & Kayachikitsa</option>
                <option value="Panchakarma">Panchakarma</option>
                <option value="Dravyaguna & Rasashastra">Dravyaguna & Rasashastra</option>
                <option value="Shalya & Shalakya Tantra">Shalya & Shalakya Tantra</option>
                <option value="Yoga & Naturopathy">Yoga & Naturopathy</option>
                <option value="Unani Medicine">Unani Medicine</option>
                <option value="Siddha Medicine">Siddha Medicine</option>
                <option value="Homeopathy">Homeopathy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Clinic / Hospital Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                placeholder="e.g. Shree Ayurveda Wellness Centre"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>Already registered? </span>
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
