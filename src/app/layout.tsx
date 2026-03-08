import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MediVCon | AI-Powered Patient Conversation Intelligence',
  description: 'Capture doctor-patient conversations, store as vCon records, and derive clinical intelligence with full audit trails.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}>
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-teal-400 font-semibold text-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              MediVCon
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-slate-300 hover:text-teal-400 transition">Dashboard</Link>
              <Link href="/consultations/new" className="text-slate-300 hover:text-teal-400 transition">New Consultation</Link>
              <Link href="/consultations" className="text-slate-300 hover:text-teal-400 transition">All Consultations</Link>
              <Link href="/search" className="text-slate-300 hover:text-teal-400 transition">Search</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
