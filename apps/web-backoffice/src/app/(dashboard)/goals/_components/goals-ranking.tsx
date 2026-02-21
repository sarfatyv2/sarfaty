'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, cn,
} from '@nexus/ui';
import { Trophy } from 'lucide-react';
import type { RankingEntry } from '@nexus/types';

interface GoalsRankingProps {
  entries: RankingEntry[];
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const POSITION_COLORS: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-amber-700',
};

export function GoalsRanking({ entries }: GoalsRankingProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Nenhum dado de ranking disponível para este período.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Equipe</TableHead>
            <TableHead className="text-right">Atingido</TableHead>
            <TableHead className="text-right">Meta</TableHead>
            <TableHead className="text-right">Progresso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.profileId}>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {entry.position <= 3 && (
                    <Trophy size={14} className={POSITION_COLORS[entry.position]} />
                  )}
                  <span className="font-semibold">{entry.position}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{entry.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.teamName ?? '—'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(entry.achievedAmount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(entry.goalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        entry.progressPct >= 100 ? 'bg-emerald-500' : entry.progressPct >= 70 ? 'bg-blue-500' : 'bg-amber-500',
                      )}
                      style={{ width: `${Math.min(entry.progressPct, 100)}%` }}
                    />
                  </div>
                  <Badge
                    variant={entry.progressPct >= 100 ? 'default' : 'secondary'}
                    className="min-w-[3.5rem] justify-center text-[10px]"
                  >
                    {entry.progressPct}%
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
