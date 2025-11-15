// frontend/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Gift, 
  Brain, 
  User,
  LogOut 
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/ai-analysis', label: 'AI Analysis', icon: BarChart3 },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: 'http://localhost:4000', label: 'Lumen RAG', icon: Brain, external: true },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-black text-primary">LUMEN</h1>
        <p className="text-xs text-muted-foreground mt-1">AI Financial Coach</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const linkProps = item.external 
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <Link key={item.href} href={item.href} {...linkProps}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-border">
        <SignOutButton redirectUrl="/">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
