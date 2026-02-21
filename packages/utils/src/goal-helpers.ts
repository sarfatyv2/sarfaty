import type { GoalLevel } from '@nexus/types';

const GOAL_LEVEL_LABELS: Record<GoalLevel, string> = {
  individual: 'Individual',
  team: 'Equipe',
  region: 'Regional',
};

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const;

export function getGoalLevelLabel(level: GoalLevel): string {
  return GOAL_LEVEL_LABELS[level];
}

export function getGoalProgressPct(achieved: number | string, target: number | string): number {
  const a = typeof achieved === 'string' ? parseFloat(achieved) : achieved;
  const t = typeof target === 'string' ? parseFloat(target) : target;
  if (t <= 0) return 0;
  return Math.min(Math.round((a / t) * 100), 100);
}

export function formatGoalPeriod(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1] ?? '???';
  return `${name}/${year}`;
}

export function isGoalAchieved(achieved: number | string, target: number | string): boolean {
  const a = typeof achieved === 'string' ? parseFloat(achieved) : achieved;
  const t = typeof target === 'string' ? parseFloat(target) : target;
  return a >= t;
}
