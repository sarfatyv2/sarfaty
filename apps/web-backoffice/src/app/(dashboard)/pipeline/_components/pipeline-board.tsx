'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import type { FunnelStage, PipelineMetrics } from '@nexus/types';
import { FUNNEL_STAGE_ORDER, FUNNEL_STAGE_LABELS, getDropTargetStatus } from '@nexus/utils';
import { Skeleton } from '@nexus/ui';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { PipelineColumn } from './pipeline-column';
import { PipelineCard, type PipelineClient } from './pipeline-card';
import { PipelineMetricsCards } from './pipeline-metrics';

type StageClients = Record<FunnelStage, PipelineClient[]>;

export function PipelineBoard() {
  const [stages, setStages] = useState<StageClients | null>(null);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<PipelineClient | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pipelineRes, metricsRes] = await Promise.all([
        api.get<{ stages: StageClients }>('/pipeline'),
        api.get<PipelineMetrics>('/pipeline/metrics'),
      ]);
      setStages(pipelineRes.data.stages);
      setMetrics(metricsRes.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pipeline';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDragStart(event: DragStartEvent) {
    if (!stages) return;
    for (const stage of FUNNEL_STAGE_ORDER) {
      const found = stages[stage].find((c) => c.id === event.active.id);
      if (found) {
        setActiveCard(found);
        break;
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !stages) return;

    const targetStage = over.id as FunnelStage;
    const clientId = active.id as string;

    let sourceStage: FunnelStage | null = null;
    let client: PipelineClient | null = null;
    for (const stage of FUNNEL_STAGE_ORDER) {
      const found = stages[stage].find((c) => c.id === clientId);
      if (found) {
        sourceStage = stage;
        client = found;
        break;
      }
    }

    if (!sourceStage || !client || sourceStage === targetStage) return;

    const prevStages = stages;
    const targetStatus = getDropTargetStatus(targetStage);

    const newStages = { ...stages };
    newStages[sourceStage] = stages[sourceStage].filter((c) => c.id !== clientId);
    newStages[targetStage] = [...stages[targetStage], { ...client, status: targetStatus }];
    setStages(newStages);

    try {
      await api.patch(`/clients/${clientId}`, { status: targetStatus });
      toast.success(`${client.tradeName ?? client.companyName} movido para ${FUNNEL_STAGE_LABELS[targetStage]}`);
    } catch {
      setStages(prevStages);
      toast.error('Não foi possível mover o cliente. Verifique as permissões.');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`metric-${i}`} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`col-${i}`} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stages) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        Não foi possível carregar o pipeline. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {metrics && <PipelineMetricsCards metrics={metrics} />}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {FUNNEL_STAGE_ORDER.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              clients={stages[stage]}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && <PipelineCard client={activeCard} isDragOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
