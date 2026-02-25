'use client';

import type { PipelineMetrics } from '@nexus/types';
import { Card, CardContent } from '@nexus/ui';
import { DollarSign, TrendingUp, Clock, Activity } from 'lucide-react';

interface PipelineMetricsCardsProps {
  metrics: PipelineMetrics;
}

function formatCompact(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num) || num === 0) return 'R$ 0';
  if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `R$ ${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PipelineMetricsCards({ metrics }: PipelineMetricsCardsProps) {
  const cards = [
    {
      label: 'Volume Pipeline',
      value: formatCompact(metrics.totalPipelineAmount),
      icon: DollarSign,
      color: 'text-[hsl(38,30%,35%)]',
      bg: 'bg-[hsl(38,25%,92%)]',
    },
    {
      label: 'Volume Aprovado',
      value: formatCompact(metrics.totalApprovedAmount),
      icon: TrendingUp,
      color: 'text-[hsl(38,30%,35%)]',
      bg: 'bg-[hsl(38,25%,92%)]',
    },
    {
      label: 'Taxa Conversão',
      value: `${metrics.conversionRate}%`,
      icon: Activity,
      color: 'text-[hsl(38,30%,35%)]',
      bg: 'bg-[hsl(38,25%,92%)]',
    },
    {
      label: 'Tempo Médio Aprovação',
      value: metrics.avgHoursToApprove ? `${metrics.avgHoursToApprove}h` : '—',
      icon: Clock,
      color: 'text-[hsl(38,30%,35%)]',
      bg: 'bg-[hsl(38,25%,92%)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2.5 ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
