'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@nexus/ui';
import type { PartnerAlert } from '@/lib/partner-alert-rules';

type PartnerAlertsProps = Readonly<{
  alerts: PartnerAlert[];
}>;

const SEVERITY_STYLES: Record<PartnerAlert['severity'], string> = {
  high: 'border-destructive/40 bg-destructive/10 text-destructive',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
};

const SEVERITY_ICONS: Record<PartnerAlert['severity'], typeof AlertTriangle> = {
  high: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export function PartnerAlerts({ alerts }: PartnerAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => {
        const Icon = SEVERITY_ICONS[alert.severity];
        const style = SEVERITY_STYLES[alert.severity];
        return (
          <Badge
            key={alert.id}
            variant="outline"
            className={`text-xs font-medium gap-1 ${style}`}
          >
            <Icon size={11} className="shrink-0" />
            {alert.message}
          </Badge>
        );
      })}
    </div>
  );
}
