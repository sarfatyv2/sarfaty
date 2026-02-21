'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RankingEntry } from '@nexus/types';
import { Tabs, TabsContent, TabsList, TabsTrigger, Skeleton, Button } from '@nexus/ui';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { GoalProgressCards } from './goal-progress-cards';
import { GoalsTable, type GoalTableRow } from './goals-table';
import { GoalsRanking } from './goals-ranking';
import { PeriodSelector } from './period-selector';
import { GoalFormDialog } from './goal-form-dialog';

export function GoalsOverview() {
  const now = new Date();
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [goals, setGoals] = useState<GoalTableRow[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalTableRow | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, rankingRes] = await Promise.all([
        api.get<GoalTableRow[]>('/goals', { periodYear, periodMonth }),
        api.get<RankingEntry[]>('/goals/ranking', { periodYear, periodMonth }).catch(() => ({ data: [] as RankingEntry[] })),
      ]);
      setGoals(goalsRes.data ?? []);
      setRanking(rankingRes.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar metas';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [periodYear, periodMonth]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  function handleEdit(goal: GoalTableRow) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  async function handleDelete(goalId: string) {
    try {
      await api.delete(`/goals/${goalId}`);
      toast.success('Meta excluída');
      fetchGoals();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir meta';
      toast.error(message);
    }
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingGoal(null);
  }

  function handleFormSaved() {
    handleFormClose();
    fetchGoals();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`card-${i}`} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector
          year={periodYear}
          month={periodMonth}
          onYearChange={setPeriodYear}
          onMonthChange={setPeriodMonth}
        />
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Nova Meta
        </Button>
      </div>

      <GoalProgressCards goals={goals} />

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Metas ({goals.length})</TabsTrigger>
          <TabsTrigger value="ranking">Ranking ({ranking.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-4">
          <GoalsTable goals={goals} onEdit={handleEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="ranking" className="mt-4">
          <GoalsRanking entries={ranking} />
        </TabsContent>
      </Tabs>

      <GoalFormDialog
        open={formOpen}
        goal={editingGoal}
        defaultPeriod={{ year: periodYear, month: periodMonth }}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
      />
    </div>
  );
}
