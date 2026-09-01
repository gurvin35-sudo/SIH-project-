import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { LanguageProvider } from '@/components/LanguageContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AyushCase — AYUSH Patient Case-Taking & Clinical Software',
  description:
    'Smart Automation Patient Case-Taking Software for Ayurveda, Yoga, Unani, Siddha, and Homeopathy (AYUSH) Practitioners. Built for Smart India Hackathon.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col font-sans bg-stone-50 text-stone-900 antialiased">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
