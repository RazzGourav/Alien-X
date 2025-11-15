// frontend/components/StatsCard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  children?: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  description,
  value,
  icon: Icon,
  trend,
  children,
  className = '',
}: StatsCardProps) {
  return (
    <Card className={`card-enhanced ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div
              className={`text-xs font-semibold ${
                trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
