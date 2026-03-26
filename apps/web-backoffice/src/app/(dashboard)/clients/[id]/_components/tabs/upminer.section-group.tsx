'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@nexus/ui';

export type SectionGroupVariant = 'destructive' | 'warning' | 'success' | 'neutral';

interface SectionGroupProps {
  title: string;
  icon: ReactNode;
  count?: number;
  variant?: SectionGroupVariant;
  defaultOpen?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<SectionGroupVariant, {
  header: string;
  border: string;
  iconColor: string;
  badge: string;
  countBadge: string;
}> = {
  destructive: {
    header: 'bg-red-50/80 dark:bg-red-950/20',
    border: 'border-red-200/70 dark:border-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    countBadge: 'bg-red-600 text-white',
  },
  warning: {
    header: 'bg-amber-50/80 dark:bg-amber-950/20',
    border: 'border-amber-200/70 dark:border-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    countBadge: 'bg-amber-500 text-white',
  },
  success: {
    header: 'bg-emerald-50/80 dark:bg-emerald-950/20',
    border: 'border-emerald-200/70 dark:border-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    countBadge: 'bg-emerald-600 text-white',
  },
  neutral: {
    header: 'bg-muted/40',
    border: 'border-border',
    iconColor: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
    countBadge: 'bg-muted-foreground/70 text-background',
  },
};

export function SectionGroup({
  title,
  icon,
  count,
  variant = 'neutral',
  defaultOpen = true,
  children,
}: Readonly<SectionGroupProps>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`rounded-lg border overflow-hidden ${styles.border}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:brightness-95 ${styles.header}`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`shrink-0 ${styles.iconColor}`}>{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge className={`text-[10px] font-bold px-1.5 py-0 leading-4 ${styles.countBadge}`}>
              {count}
            </Badge>
          )}
          {count !== undefined && count === 0 && (
            <Badge className="text-[10px] font-normal px-1.5 py-0 leading-4 bg-muted text-muted-foreground border-border">
              nenhum
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 py-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
