import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatABHA(abha) {
  if (!abha) return '';
  const cleaned = abha.replace(/\D/g, '');
  if (cleaned.length !== 14) return abha;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}-${cleaned.slice(10, 14)}`;
}

export function getDoshaColor(dosha) {
  const d = (dosha || '').toLowerCase();
  if (d.includes('vata') && d.includes('pitta')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' };
  }
  if (d.includes('pitta') && d.includes('kapha')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' };
  }
  if (d.includes('vata') && d.includes('kapha')) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-500' };
  }
  if (d.includes('vata')) {
    return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300', dot: 'bg-sky-500' };
  }
  if (d.includes('pitta')) {
    return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' };
  }
  if (d.includes('kapha')) {
    return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' };
  }
  if (d.includes('tridosha') || d.includes('sama')) {
    return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' };
  }
  return { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300', dot: 'bg-stone-500' };
}
