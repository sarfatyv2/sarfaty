'use client';

import {
  Pencil,
  FileText,
  FileClock,
  FileWarning,
  Search,
  ClipboardList,
  XCircle,
  Clock,
  CheckCircle2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
  RefreshCw,
  Gavel,
  Archive,
  Ban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getStatusLabel,
  getStatusStyle,
  CLIENT_STATUS_ICON,
} from '@nexus/utils';
import type { ClientStatus } from '@nexus/types';
import { cn } from '@nexus/ui';

const ICON_MAP: Record<string, LucideIcon> = {
  Pencil,
  FileText,
  FileClock,
  FileWarning,
  Search,
  ClipboardList,
  XCircle,
  Clock,
  CheckCircle2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
  RefreshCw,
  Gavel,
  Archive,
  Ban,
};

interface ClientStatusBadgeProps {
  status: string;
  className?: string;
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const iconName = CLIENT_STATUS_ICON[status as ClientStatus] ?? 'FileText';
  const Icon = ICON_MAP[iconName] ?? FileText;
  const style = getStatusStyle(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className,
      )}
    >
      <Icon size={13} className="shrink-0" />
      {label}
    </span>
  );
}
