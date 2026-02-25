'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card, CardContent, Skeleton } from '@nexus/ui';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useInView } from 'framer-motion';
import { api, ApiError } from '@/lib/api';
import { FadeIn, StaggerChildren, StaggerItem, ExpandableContent, RotatingChevron } from './motion-wrapper';

interface FaturamentoMonthlyRevenues {
  jan: number | null;
  feb: number | null;
  mar: number | null;
  apr: number | null;
  may: number | null;
  jun: number | null;
  jul: number | null;
  aug: number | null;
  sep: number | null;
  oct: number | null;
  nov: number | null;
  dec: number | null;
}

interface FaturamentoExtraction {
  id: string;
  clientId: string;
  cnpj: string;
  year: number;
  cpf: string | null;
  companyName: string | null;
  monthlyRevenues: FaturamentoMonthlyRevenues | null;
  totalAnnualRevenue: string | null;
  documentDescription: string | null;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
  extractionConfidence: 'high' | 'medium' | 'low' | null;
  ocrApplied: boolean;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaturamentoSectionProps {
  clientId: string;
}

const MONTH_LABELS: Record<keyof FaturamentoMonthlyRevenues, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr',
  may: 'Mai', jun: 'Jun', jul: 'Jul', aug: 'Ago',
  sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez',
};

const MONTH_ORDER: (keyof FaturamentoMonthlyRevenues)[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

function formatCurrency(value: number | string | null): string {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toFixed(0);
}

function RevenueChart({ monthlyRevenues }: { monthlyRevenues: FaturamentoMonthlyRevenues }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true, margin: '-40px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const values = MONTH_ORDER.map((m) => monthlyRevenues[m]);
  const numericValues = values.filter((v): v is number => v !== null);
  if (numericValues.length === 0) return null;

  const maxVal = Math.max(...numericValues);
  const minVal = Math.min(0, ...numericValues);
  const range = maxVal - minVal || 1;

  const WIDTH = 600;
  const HEIGHT = 160;
  const PADDING_X = 40;
  const PADDING_TOP = 16;
  const PADDING_BOTTOM = 28;
  const chartW = WIDTH - PADDING_X * 2;
  const chartH = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const points: { x: number; y: number; value: number | null; index: number }[] = values.map((v, i) => ({
    x: PADDING_X + (i / 11) * chartW,
    y: v !== null ? PADDING_TOP + chartH - ((v - minVal) / range) * chartH : 0,
    value: v,
    index: i,
  }));

  const validPoints = points.filter((p) => p.value !== null);

  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return '';
    const first = pts[0]!;
    let d = `M ${first.x} ${first.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const cpx = (curr.x + next.x) / 2;
      d += ` C ${cpx} ${curr.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }

  const linePath = buildSmoothPath(validPoints);
  const areaPath = validPoints.length >= 2
    ? `${linePath} L ${validPoints[validPoints.length - 1]!.x} ${PADDING_TOP + chartH} L ${validPoints[0]!.x} ${PADDING_TOP + chartH} Z`
    : '';

  return (
    <div ref={chartRef} className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(150, 50%, 15%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(150, 50%, 15%)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = PADDING_TOP + chartH - pct * chartH;
          const val = minVal + pct * range;
          return (
            <g key={pct}>
              <line x1={PADDING_X} y1={y} x2={WIDTH - PADDING_X} y2={y} stroke="hsl(30, 20%, 88%)" strokeWidth="0.5" />
              <text x={PADDING_X - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8" fontFamily="system-ui">
                {formatCompact(val)}
              </text>
            </g>
          );
        })}

        {points.map((p, i) => {
          const monthKey = MONTH_ORDER[i]!;
          return (
            <text key={monthKey} x={p.x} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9" fontFamily="system-ui">
              {MONTH_LABELS[monthKey]}
            </text>
          );
        })}

        {areaPath && (
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        )}

        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke="hsl(150, 50%, 15%)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        )}

        {validPoints.map((p, idx) => (
          <motion.circle
            key={p.index}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === p.index ? 5 : 3}
            fill="hsl(0, 0%, 100%)"
            stroke="hsl(150, 50%, 15%)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + idx * 0.05 }}
            onMouseEnter={() => setHoveredIndex(p.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          />
        ))}

        {hoveredIndex !== null && (() => {
          const hp = points[hoveredIndex];
          if (!hp || hp.value === null) return null;
          return (
            <g>
              <rect x={hp.x - 40} y={hp.y - 28} width="80" height="20" rx="4" fill="hsl(150, 50%, 15%)" />
              <text x={hp.x} y={hp.y - 15} textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui" fontWeight="500">
                {formatCurrency(hp.value)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function ExtractionCard({
  extraction,
  clientId,
  onReprocess,
}: {
  extraction: FaturamentoExtraction;
  clientId: string;
  onReprocess: () => void;
}) {
  const [reprocessing, setReprocessing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleReprocess() {
    setReprocessing(true);
    try {
      await api.post(`/clients/${clientId}/faturamento-extractions/${extraction.id}/reprocess`);
      toast.success('Reprocessamento agendado');
      onReprocess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao reprocessar';
      toast.error(message);
    } finally {
      setReprocessing(false);
    }
  }

  const presentMonths = extraction.monthlyRevenues
    ? MONTH_ORDER.filter((m) => extraction.monthlyRevenues![m] !== null).length
    : 0;

  return (
    <Card className="overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between px-8 py-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={15} className="text-primary" />
          <span className="text-sm font-medium">Faturamento</span>
          <span className="text-sm text-muted-foreground">{extraction.year}</span>
          {presentMonths > 0 && (
            <span className="text-xs text-muted-foreground">({presentMonths}/12 meses)</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {extraction.totalAnnualRevenue && (
            <span className="text-sm font-medium">{formatCurrency(extraction.totalAnnualRevenue)}</span>
          )}
          <RotatingChevron isOpen={expanded} className="text-muted-foreground" />
        </div>
      </div>

      <ExpandableContent isOpen={expanded}>
        <div className="px-8 pb-6 space-y-5">
          {extraction.monthlyRevenues && presentMonths > 0 && (
            <RevenueChart monthlyRevenues={extraction.monthlyRevenues} />
          )}

          {extraction.totalAnnualRevenue && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl">
              <span className="text-xs text-muted-foreground">Total Anual</span>
              <span className="text-base font-medium">{formatCurrency(extraction.totalAnnualRevenue)}</span>
            </div>
          )}

          {extraction.monthlyRevenues && presentMonths > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTH_ORDER.map((month) => {
                const value = extraction.monthlyRevenues![month];
                return (
                  <div
                    key={month}
                    className={`py-2 px-1 rounded-lg text-center ${value === null ? 'opacity-30' : 'bg-muted/30'}`}
                  >
                    <p className="text-[10px] text-muted-foreground">{MONTH_LABELS[month]}</p>
                    <p className="text-xs font-medium mt-0.5">
                      {value === null ? '—' : formatCurrency(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {extraction.needsReview && (
            <div className="flex items-center gap-2 text-yellow-600 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <span>Este registro requer revisão manual — verifique os dados extraídos.</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Atualizado em {new Date(extraction.updatedAt).toLocaleDateString('pt-BR')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleReprocess(); }}
              disabled={reprocessing}
              className="h-7 text-xs"
            >
              {reprocessing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              Reprocessar
            </Button>
          </div>
        </div>
      </ExpandableContent>
    </Card>
  );
}

const POLL_INTERVAL_MS = 5_000;
const PROCESSING_STATUSES = new Set(['pending', 'processing']);

export function FaturamentoSection({ clientId }: FaturamentoSectionProps) {
  const [extractions, setExtractions] = useState<FaturamentoExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExtractions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await api.get<FaturamentoExtraction[]>(
        `/clients/${clientId}/faturamento-extractions`,
      );
      setExtractions(res.data ?? []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar extrações de faturamento';
      setError(message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadExtractions();
  }, [loadExtractions]);

  useEffect(() => {
    const hasProcessing = extractions.some((e) => PROCESSING_STATUSES.has(e.extractionStatus));
    if (!hasProcessing) return;
    const timer = setInterval(() => { loadExtractions(true); }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [extractions, loadExtractions]);

  const sortedExtractions = [...extractions].sort((a, b) => b.year - a.year);

  return (
    <FadeIn delay={0.15}>
      <div className="space-y-6">
        {loading && (
          <div className="space-y-4">
            {['sk-0', 'sk-1'].map((k) => (
              <Skeleton key={k} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadExtractions()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && extractions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-center space-y-2">
              <TrendingUp size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhum relatório de faturamento processado
              </p>
              <p className="text-xs text-muted-foreground">
                Faça o upload na aba Documentos para iniciar a extração automática.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && sortedExtractions.length > 0 && (
          <StaggerChildren className="space-y-4" staggerDelay={0.07}>
            {sortedExtractions.map((extraction) => (
              <StaggerItem key={extraction.id}>
                <ExtractionCard
                  extraction={extraction}
                  clientId={clientId}
                  onReprocess={() => loadExtractions(true)}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </FadeIn>
  );
}
