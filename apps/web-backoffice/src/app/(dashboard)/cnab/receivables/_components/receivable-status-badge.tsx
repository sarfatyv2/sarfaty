'use client';

import { Badge } from '@nexus/ui';

interface ReceivableStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  registered: { label: 'Registrado', variant: 'default' },
  paid: { label: 'Pago', variant: 'default' },
  overdue: { label: 'Vencido', variant: 'destructive' },
  protested: { label: 'Protestado', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
  written_off: { label: 'Baixado', variant: 'secondary' },
};

export function ReceivableStatusBadge({ status }: ReceivableStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
