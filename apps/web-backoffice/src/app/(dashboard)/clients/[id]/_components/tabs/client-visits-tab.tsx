'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@nexus/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MapPin,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { CommercialReportDialog } from '../../../new/_components/commercial-report-dialog';
import type { CreateCommercialReportDto } from '@nexus/validators';
import { type VisitStatus, computeVisitStatusFromDate } from '@nexus/utils';

interface CommercialReport {
  id: string;
  visitDate: string | null;
  reportDate: string | null;
  proposalType: string | null;
  commercialDefense: string | null;
  createdAt: string;
}

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

interface ClientVisitsTabProps {
  clientId: string;
}

export function ClientVisitsTab({ clientId }: ClientVisitsTabProps) {
  const [reports, setReports] = useState<CommercialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CommercialReport[]>(`/clients/${clientId}/commercial-reports`);
      setReports(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar histórico de visitas');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadReports(); }, [loadReports]);

  async function handleSaveVisit(data: CreateCommercialReportDto) {
    setSaving(true);
    try {
      await api.post(`/clients/${clientId}/commercial-reports`, data);
      toast.success('Visita registrada com sucesso');
      setDialogOpen(false);
      loadReports();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao registrar visita');
    } finally {
      setSaving(false);
    }
  }

  const latestVisitDate = reports.reduce<string | null>((maxDate, report) => {
    const visit = report.visitDate;
    if (!visit) return maxDate;
    if (!maxDate) return visit;
    return visit > maxDate ? visit : maxDate;
  }, null);
  const { status, nextVisitDue, daysUntilDue, daysOverdue } = computeVisitStatusFromDate(latestVisitDate);
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin size={15} className="text-primary" />
            Visitas Comerciais
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setDialogOpen(true)}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Registrar Visita
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${cfg.color}`}>
          <StatusIcon size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold">{cfg.label}</p>
            <p className="text-xs opacity-80">
              {status === 'never_visited' && 'Este cliente ainda não recebeu nenhuma visita.'}
              {status === 'on_track' && nextVisitDue && `Próxima visita até ${formatDate(nextVisitDue)} (em ${daysUntilDue} dias).`}
              {status === 'approaching' && nextVisitDue && `Visita vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''} — ${formatDate(nextVisitDue)}.`}
              {status === 'overdue' && nextVisitDue && `Visita vencida há ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''} (devia até ${formatDate(nextVisitDue)}).`}
            </p>
          </div>
        </div>

        {/* History */}
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-10 text-center space-y-2">
            <MapPin size={24} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhuma visita registrada.</p>
            <p className="text-xs text-muted-foreground">Clique em "Registrar Visita" para adicionar a primeira.</p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border overflow-hidden">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full bg-muted">
                    <MapPin size={12} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {report.proposalType ?? 'Visita'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registrado em {formatDate(report.createdAt.split('T')[0]!)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Data da visita</p>
                    <p className="text-sm">{formatDate(report.visitDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CommercialReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleSaveVisit}
        parsedData={null}
        fileName=""
      />
    </Card>
  );
}
