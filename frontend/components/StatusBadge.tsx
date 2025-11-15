// frontend/components/StatusBadge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

const statusConfig = {
  success: {
    variant: 'default' as const,
    className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  },
  error: {
    variant: 'default' as const,
    className: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  },
  warning: {
    variant: 'default' as const,
    className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  },
  info: {
    variant: 'default' as const,
    className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
  pending: {
    variant: 'default' as const,
    className: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
  },
};

export function StatusBadge({
  status,
  label,
  icon: Icon,
  children,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} border flex items-center gap-2 px-3 py-1`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
      {children}
    </Badge>
  );
}
