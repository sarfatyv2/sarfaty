'use client';

import { Card, CardContent, cn } from '@nexus/ui';
import { Target, Users, Globe, TrendingUp } from 'lucide-react';
import type { GoalLevel } from '@nexus/types';

interface GoalRow {
  id: string;
  level: GoalLevel;
  goalAmount: string;
  achievedAmount: string;
  progressPct: number;
  isAchieved: boolean;
}

interface GoalProgressCardsProps {
  goals: GoalRow[];
}

function formatCompact(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num) || num === 0) return 'R$ 0';
  if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `R$ ${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const LEVEL_CONFIG: Record<GoalLevel, { label: string; icon: typeof Target; color: string }> = {
  individual: { label: 'Individual', icon: Target, color: 'text-blue-600' },
  team: { label: 'Equipe', icon: Users, color: 'text-violet-600' },
  region: { label: 'Regional', icon: Globe, color: 'text-emerald-600' },
};

export function GoalProgressCards({ goals }: GoalProgressCardsProps) {
  const levels: GoalLevel[] = ['individual', 'team', 'region'];

  const summaries = levels.map((level) => {
    const levelGoals = goals.filter((g) => g.level === level);
    const totalGoal = levelGoals.reduce((sum, g) => sum + parseFloat(g.goalAmount), 0);
    const totalAchieved = levelGoals.reduce((sum, g) => sum + parseFloat(g.achievedAmount), 0);
    const pct = totalGoal > 0 ? Math.min(Math.round((totalAchieved / totalGoal) * 100), 100) : 0;
    return { level, count: levelGoals.length, totalGoal, totalAchieved, pct };
  });

  const totalGoalAll = summaries.reduce((s, x) => s + x.totalGoal, 0);
  const totalAchievedAll = summaries.reduce((s, x) => s + x.totalAchieved, 0);
  const totalPct = totalGoalAll > 0 ? Math.min(Math.round((totalAchievedAll / totalGoalAll) * 100), 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {summaries.map((summary) => {
        const config = LEVEL_CONFIG[summary.level];
        const Icon = config.icon;
        return (
          <Card key={summary.level}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Icon size={16} className={config.color} />
                <span className="text-sm font-medium">{config.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{summary.count} metas</span>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold">{summary.pct}%</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCompact(summary.totalAchieved)} / {formatCompact(summary.totalGoal)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      summary.pct >= 100 ? 'bg-emerald-500' : summary.pct >= 70 ? 'bg-blue-500' : 'bg-amber-500',
                    )}
                    style={{ width: `${summary.pct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-sm font-medium">Total Geral</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold">{totalPct}%</span>
              <span className="text-xs text-muted-foreground">
                {formatCompact(totalAchievedAll)} / {formatCompact(totalGoalAll)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  totalPct >= 100 ? 'bg-emerald-500' : totalPct >= 70 ? 'bg-primary' : 'bg-amber-500',
                )}
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
