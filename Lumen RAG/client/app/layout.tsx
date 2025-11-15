'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans } from 'geist/font';
import { GeistMono } from 'geist/font';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <ClerkProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
