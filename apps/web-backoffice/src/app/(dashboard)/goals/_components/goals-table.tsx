'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, cn,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@nexus/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { GoalLevel } from '@nexus/types';
import { getGoalLevelLabel } from '@nexus/utils';

export interface GoalTableRow {
  id: string;
  level: GoalLevel;
  profileId: string | null;
  teamId: string | null;
  regionId: string | null;
  periodYear: number;
  periodMonth: number;
  goalAmount: string;
  goalCount: number | null;
  achievedAmount: string;
  achievedCount: number;
  progressPct: number;
  isAchieved: boolean;
}

interface GoalsTableProps {
  goals: GoalTableRow[];
  onEdit: (goal: GoalTableRow) => void;
  onDelete: (goalId: string) => void;
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const LEVEL_VARIANT: Record<GoalLevel, 'default' | 'secondary' | 'outline'> = {
  individual: 'default',
  team: 'secondary',
  region: 'outline',
};

export function GoalsTable({ goals, onEdit, onDelete }: GoalsTableProps) {
  if (goals.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Nenhuma meta cadastrada para este período.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nível</TableHead>
            <TableHead className="text-right">Meta</TableHead>
            <TableHead className="text-right">Atingido</TableHead>
            <TableHead className="text-right">Progresso</TableHead>
            <TableHead className="text-right">Qtd</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => (
            <TableRow key={goal.id}>
              <TableCell>
                <Badge variant={LEVEL_VARIANT[goal.level]}>
                  {getGoalLevelLabel(goal.level)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(goal.goalAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(goal.achievedAmount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        goal.isAchieved ? 'bg-emerald-500' : goal.progressPct >= 70 ? 'bg-blue-500' : 'bg-amber-500',
                      )}
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>
                  <span className="min-w-[3ch] text-xs font-medium">{goal.progressPct}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {goal.achievedCount}{goal.goalCount ? `/${goal.goalCount}` : ''}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(goal)}>
                      <Pencil size={14} className="mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(goal.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
