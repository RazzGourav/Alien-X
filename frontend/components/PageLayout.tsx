// frontend/components/PageLayout.tsx
'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  showMobileNav?: boolean;
}

export function PageLayout({
  title,
  description,
  children,
  showMobileNav = true,
}: PageLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar - Hidden on mobile, visible on lg+ */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
