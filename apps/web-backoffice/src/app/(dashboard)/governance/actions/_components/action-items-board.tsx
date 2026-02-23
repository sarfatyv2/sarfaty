'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Badge,
  Card,
  CardContent,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus/ui';
import type { ActionItem, ActionItemStatus } from '@nexus/types';

const COLUMNS: { status: ActionItemStatus; label: string }[] = [
  { status: 'todo', label: 'A Fazer' },
  { status: 'in_progress', label: 'Em Andamento' },
  { status: 'blocked', label: 'Bloqueado' },
  { status: 'done', label: 'Concluído' },
];


function ActionCard({
  item,
  onStatusChange,
}: {
  item: ActionItem;
  onStatusChange: (id: string, status: ActionItemStatus) => void;
}) {
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';

  return (
    <Card className="mb-3">
      <CardContent className="p-3 space-y-2">
        <p className="font-medium text-sm leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        {item.dueDate && (
          <p className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {isOverdue ? 'Venceu: ' : 'Prazo: '}
            {new Date(item.dueDate).toLocaleDateString('pt-BR')}
          </p>
        )}
        <div className="pt-1">
          <Select
            value={item.status}
            onValueChange={(value) => onStatusChange(item.id, value as ActionItemStatus)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMNS.map((col) => (
                <SelectItem key={col.status} value={col.status} className="text-xs">
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionItemsBoard() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ActionItem[]>('/governance/actions', { pageSize: 100 });
      setActions(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActions();
  }, [loadActions]);

  const handleStatusChange = async (id: string, status: ActionItemStatus) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.patch(`/governance/actions/${id}`, { status });
    } catch {
      toast.error('Erro ao atualizar status');
      void loadActions();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <Skeleton key={col.status} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnItems = actions.filter((a) => a.status === col.status);
        return (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnItems.length}
              </Badge>
            </div>
            <div className="min-h-[200px]">
              {columnItems.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                  Nenhuma ação
                </div>
              ) : (
                columnItems.map((item) => (
                  <ActionCard
                    key={item.id}
                    item={item}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
