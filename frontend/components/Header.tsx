// frontend/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Gift, 
  Brain, 
  User 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/ai-analysis', label: 'AI Analysis', icon: BarChart3 },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: 'http://localhost:4000', label: 'Lumen RAG', icon: Brain, external: true },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-primary/20 rounded-xl py-3 px-6 w-full backdrop-blur-sm">
      <NavigationMenu className="w-full">
        <NavigationMenuList className="flex gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const linkProps = item.external 
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref {...linkProps}>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                        : 'hover:bg-primary/10 text-foreground/80 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}