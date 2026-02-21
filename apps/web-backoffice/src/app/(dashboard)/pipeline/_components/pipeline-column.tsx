'use client';

import { useDroppable } from '@dnd-kit/core';
import type { FunnelStage } from '@nexus/types';
import {
  FUNNEL_STAGE_LABELS,
  FUNNEL_STAGE_COLORS,
  FUNNEL_STAGE_ICONS,
} from '@nexus/utils';
import { ScrollArea, cn } from '@nexus/ui';
import { icons } from 'lucide-react';
import { PipelineCard, type PipelineClient } from './pipeline-card';

interface PipelineColumnProps {
  stage: FunnelStage;
  clients: PipelineClient[];
}

export function PipelineColumn({ stage, clients }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const IconComponent = icons[FUNNEL_STAGE_ICONS[stage] as keyof typeof icons];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-card transition-all',
        isOver && 'ring-2 ring-primary/50 border-primary/50',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-t-xl border-b px-4 py-3',
          FUNNEL_STAGE_COLORS[stage],
        )}
      >
        {IconComponent && <IconComponent size={16} />}
        <span className="text-sm font-semibold">{FUNNEL_STAGE_LABELS[stage]}</span>
        <span className="ml-auto rounded-full bg-background/50 px-2 py-0.5 text-xs font-medium">
          {clients.length}
        </span>
      </div>

      <ScrollArea className="flex-1 p-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <div className="space-y-2">
          {clients.map((client) => (
            <PipelineCard key={client.id} client={client} />
          ))}
          {clients.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum cliente
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
