'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MapPin,
  Search,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useRole } from '@/contexts/role-context';

type VisitStatus = 'on_track' | 'approaching' | 'overdue' | 'never_visited';

interface ClientVisitSummary {
  clientId: string;
  companyName: string;
  tradeName: string | null;
  cnpj: string | null;
  clientStatus: string;
  lastVisitDate: string | null;
  nextVisitDue: string | null;
  visitStatus: VisitStatus;
  daysUntilDue: number | null;
  daysOverdue: number | null;
}

interface CommercialRepVisitSummary {
  profileId: string;
  profileName: string | null;
  totalClients: number;
  onTrack: number;
  approaching: number;
  overdue: number;
  neverVisited: number;
  clients: ClientVisitSummary[];
}

const MANAGER_ROLES = new Set(['sales_supervisor', 'sales_manager', 'sales_director', 'admin']);

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; icon: React.ElementType }> = {
  overdue: { label: 'Vencida', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: AlertTriangle },
  approaching: { label: 'A vencer', color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/40 dark:border-yellow-900', icon: Clock },
  never_visited: { label: 'Nunca visitado', color: 'text-muted-foreground bg-muted/60 border-border', icon: HelpCircle },
  on_track: { label: 'Em dia', color: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-900', icon: CheckCircle2 },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function VisitStatusBadge({ status }: Readonly<{ status: VisitStatus }>) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function SummaryCards({ items }: Readonly<{ items: ClientVisitSummary[] }>) {
  const counts = {
    overdue: items.filter((i) => i.visitStatus === 'overdue').length,
    approaching: items.filter((i) => i.visitStatus === 'approaching').length,
    never_visited: items.filter((i) => i.visitStatus === 'never_visited').length,
    on_track: items.filter((i) => i.visitStatus === 'on_track').length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{counts.overdue}</p>
              <p className="text-xs text-muted-foreground mt-1">Vencidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center shrink-0">
              <Clock size={15} className="text-yellow-700 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{counts.approaching}</p>
              <p className="text-xs text-muted-foreground mt-1">A vencer (15d)</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
              <HelpCircle size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{counts.never_visited}</p>
              <p className="text-xs text-muted-foreground mt-1">Nunca visitados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} className="text-green-700 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{counts.on_track}</p>
              <p className="text-xs text-muted-foreground mt-1">Em dia</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientVisitRow({ item }: Readonly<{ item: ClientVisitSummary }>) {
  const router = useRouter();
  return (
    <div
      className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={() => router.push(`/clients/${item.clientId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/clients/${item.clientId}`); }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <MapPin size={13} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug truncate">{item.companyName}</p>
          <p className="text-xs text-muted-foreground font-mono">{formatCnpj(item.cnpj)}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0 ml-4">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Última visita</p>
          <p className="text-sm">{formatDate(item.lastVisitDate)}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Próxima visita</p>
          <p className="text-sm">{formatDate(item.nextVisitDue)}</p>
        </div>
        {item.daysOverdue !== null && (
          <p className="text-xs text-destructive font-medium w-20 text-right">
            {item.daysOverdue}d em atraso
          </p>
        )}
        {item.daysUntilDue !== null && (
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium w-20 text-right">
            em {item.daysUntilDue}d
          </p>
        )}
        <VisitStatusBadge status={item.visitStatus} />
      </div>
    </div>
  );
}

function MyVisitsView() {
  const [items, setItems] = useState<ClientVisitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientVisitSummary[]>('/visits/overview');
      setItems(res.data ?? []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar visitas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (item.cnpj?.includes(search) ?? false);
    const matchesStatus = statusFilter === 'all' || item.visitStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4'].map((k) => (
          <Skeleton key={k} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards items={items} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
            <SelectItem value="approaching">A vencer (15d)</SelectItem>
            <SelectItem value="never_visited">Nunca visitados</SelectItem>
            <SelectItem value="on_track">Em dia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <MapPin size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-medium">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <div className="divide-y rounded-xl overflow-hidden">
              {filtered.map((item) => (
                <ClientVisitRow key={item.clientId} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamOverviewView() {
  const [repList, setRepList] = useState<CommercialRepVisitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRep, setExpandedRep] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CommercialRepVisitSummary[]>('/visits/team-overview');
      setRepList(res.data ?? []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar panorama da equipe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allClients: ClientVisitSummary[] = repList.flatMap((r) => r.clients);

  const filteredReps = repList.filter((rep) => {
    if (!search) return true;
    return (
      (rep.profileName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      rep.clients.some(
        (c) =>
          c.companyName.toLowerCase().includes(search.toLowerCase()) ||
          (c.cnpj?.includes(search) ?? false),
      )
    );
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1', 'sk-2'].map((k) => (
          <Skeleton key={k} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards items={allClients} />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por comercial ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filteredReps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <Users size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum dado encontrado.</p>
          </div>
        )}
        {filteredReps.map((rep) => {
          const isExpanded = expandedRep === rep.profileId;
          return (
            <Card key={rep.profileId} className="overflow-hidden">
              <CardHeader
                className="pb-3 bg-gradient-to-r from-primary/5 to-transparent cursor-pointer select-none"
                onClick={() => setExpandedRep(isExpanded ? null : rep.profileId)}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users size={14} className="text-primary" />
                    {rep.profileName ?? 'Comercial'}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({rep.totalClients} cliente{rep.totalClients !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {rep.overdue > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CONFIG.overdue.color}`}>
                        <AlertTriangle size={11} />
                        {rep.overdue} vencida{rep.overdue !== 1 ? 's' : ''}
                      </span>
                    )}
                    {rep.approaching > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CONFIG.approaching.color}`}>
                        <Clock size={11} />
                        {rep.approaching} a vencer
                      </span>
                    )}
                    {rep.neverVisited > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CONFIG.never_visited.color}`}>
                        <HelpCircle size={11} />
                        {rep.neverVisited} nunca visitado{rep.neverVisited !== 1 ? 's' : ''}
                      </span>
                    )}
                    {rep.onTrack > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CONFIG.on_track.color}`}>
                        <CheckCircle2 size={11} />
                        {rep.onTrack} em dia
                      </span>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                      {isExpanded ? 'Recolher' : 'Ver clientes'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-0">
                  <div className="divide-y">
                    {rep.clients.map((item) => (
                      <ClientVisitRow key={item.clientId} item={item} />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ActivitiesContent() {
  const role = useRole();
  const isManager = MANAGER_ROLES.has(role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-normal tracking-tight">Visitas Comerciais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhamento do ciclo de visitas — prazo máximo de 90 dias por cliente.
        </p>
      </div>

      {isManager ? <TeamOverviewView /> : <MyVisitsView />}
    </div>
  );
}
