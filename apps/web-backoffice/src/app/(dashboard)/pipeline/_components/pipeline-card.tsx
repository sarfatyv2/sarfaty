'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ClientStatus } from '@nexus/types';
import { Card } from '@nexus/ui';
import { DollarSign, GripVertical } from 'lucide-react';
import Link from 'next/link';

export interface PipelineClient {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  requestedAmount: string | null;
  approvedAmount: string | null;
  status: ClientStatus;
  assignedTo: string;
  teamId: string | null;
  regionId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
}

interface PipelineCardProps {
  client: PipelineClient;
  isDragOverlay?: boolean;
}

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function PipelineCard({ client, isDragOverlay }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: client.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={`${isDragging ? 'opacity-30' : ''} ${isDragOverlay ? 'rotate-2 shadow-xl' : ''}`}
    >
      <Card className="p-3 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          <div className="min-w-0 flex-1 space-y-1.5">
            <Link
              href={`/clients/${client.id}`}
              className="block truncate text-sm font-medium hover:underline"
              onClick={(e) => { if (isDragging) e.preventDefault(); }}
            >
              {client.tradeName ?? client.companyName}
            </Link>

            <p className="truncate text-xs text-muted-foreground">
              {formatCnpj(client.cnpj)}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign size={12} />
              <span>{formatCurrency(client.requestedAmount)}</span>
            </div>

            {client.approvedAmount && (
              <div className="text-[10px] font-medium text-[hsl(38,30%,35%)]">
                Aprovado: {formatCurrency(client.approvedAmount)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
