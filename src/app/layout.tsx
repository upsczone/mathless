import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['500', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bubble Math: Physics Odyssey',
  description:
    'Vibrant physics-based maths game with power-ups, endless levels, global leaderboards, daily challenges, and unlockable bubble skins.',
  openGraph: {
    title: 'Bubble Math: Physics Odyssey',
    description:
      'Vibrant physics-based maths game with power-ups, endless levels, global leaderboards, daily challenges, and unlockable bubble skins.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-slate-950 text-white font-sans antialiased select-none overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
