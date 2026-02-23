'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, CheckSquare, AlertTriangle, ArrowRight, CalendarClock, Landmark, Clock, CircleDot } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nexus/ui';
import { cn } from '@nexus/ui';
import type { Committee, ActionItem } from '@nexus/types';

const COMMITTEE_FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  quarterly: 'Trimestral',
  adhoc: 'Sob demanda',
};

const COMMITTEE_SKELETONS = ['sk-c-1', 'sk-c-2', 'sk-c-3', 'sk-c-4'];
const ACTION_SKELETONS = ['sk-a-1', 'sk-a-2', 'sk-a-3', 'sk-a-4', 'sk-a-5'];

type StatusConfig = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  dot: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  todo: { label: 'A fazer', variant: 'secondary', dot: 'bg-slate-400' },
  in_progress: { label: 'Em andamento', variant: 'default', dot: 'bg-blue-500' },
  blocked: { label: 'Bloqueado', variant: 'destructive', dot: 'bg-red-500' },
  done: { label: 'Concluído', variant: 'outline', dot: 'bg-emerald-500' },
};

const DEFAULT_STATUS: StatusConfig = { label: 'A fazer', variant: 'secondary', dot: 'bg-slate-400' };

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function CommitteeCard({ committee }: { committee: Committee }) {
  return (
    <Link href={`/governance/committees/${committee.id}`}>
      <Card className="group hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                {committee.name}
              </CardTitle>
            </div>
            <Badge
              variant={committee.status === 'active' ? 'default' : 'secondary'}
              className="flex-shrink-0 text-xs"
            >
              {committee.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {committee.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{committee.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>{COMMITTEE_FREQUENCY_LABELS[committee.frequency] ?? 'Sob demanda'}</span>
            </div>
            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Ver <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActionItemRow({ item }: { item: ActionItem }) {
  const config = STATUS_CONFIG[item.status] ?? DEFAULT_STATUS;
  const overdue = item.status !== 'done' && isOverdue(item.dueDate);

  return (
    <Link href={`/governance/actions/${item.id}`}>
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dot)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          {item.dueDate && (
            <p className={cn('text-xs flex items-center gap-1 mt-0.5', overdue ? 'text-destructive' : 'text-muted-foreground')}>
              {overdue && <AlertTriangle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {new Date(item.dueDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <Badge variant={config.variant} className="text-xs flex-shrink-0">
          {config.label}
        </Badge>
      </div>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  loading: boolean;
  colorClass: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-6 w-10 mb-1" />
            ) : (
              <p className="text-2xl font-bold leading-none">{value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceDashboard() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [committeesRes, actionsRes] = await Promise.all([
        api.get<Committee[]>('/governance/committees', { status: 'active', pageSize: 6 }),
        api.get<ActionItem[]>('/governance/actions', { pageSize: 10 }),
      ]);
      setCommittees(committeesRes.data ?? []);
      setActions(actionsRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pendingActions = actions.filter((a) => a.status !== 'done');
  const blockedActions = actions.filter((a) => a.status === 'blocked');
  const inProgressActions = actions.filter((a) => a.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Landmark}
          label="Comitês ativos"
          value={committees.length}
          loading={loading}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CheckSquare}
          label="Ações pendentes"
          value={pendingActions.length}
          loading={loading}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          icon={CircleDot}
          label="Em andamento"
          value={inProgressActions.length}
          loading={loading}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Bloqueadas"
          value={blockedActions.length}
          loading={loading}
          colorClass="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Committees */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Comitês Ativos</h2>
            <Link
              href="/governance/committees"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMMITTEE_SKELETONS.map((k) => (
                <Skeleton key={k} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : committees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Landmark className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhum comitê ativo</p>
                <Link href="/governance/committees/new" className="text-sm text-primary hover:underline mt-2 inline-block">
                  Criar primeiro comitê
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {committees.map((c) => (
                <CommitteeCard key={c.id} committee={c} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Ações Pendentes</h2>
            <Link
              href="/governance/actions"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card>
            <CardContent className="p-2">
              {loading ? (
                <div className="p-2 space-y-2">
                  {ACTION_SKELETONS.map((k) => (
                    <Skeleton key={k} className="h-11 rounded-lg" />
                  ))}
                </div>
              ) : pendingActions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-3">
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Tudo em dia!</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhuma ação pendente.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {pendingActions.map((a) => (
                    <ActionItemRow key={a.id} item={a} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
