'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@nexus/ui';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { GoalLevel } from '@nexus/types';

const formSchema = z.object({
  level: z.enum(['individual', 'team', 'region']),
  profileId: z.string().optional(),
  teamId: z.string().optional(),
  regionId: z.string().optional(),
  goalAmount: z.coerce.number().positive('Valor deve ser positivo'),
  goalCount: z.coerce.number().int().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GoalFormData {
  id: string;
  level: GoalLevel;
  profileId: string | null;
  teamId: string | null;
  regionId: string | null;
  goalAmount: string;
  goalCount: number | null;
}

interface GoalFormDialogProps {
  open: boolean;
  goal: GoalFormData | null;
  defaultPeriod: { year: number; month: number };
  onClose: () => void;
  onSaved: () => void;
}

export function GoalFormDialog({ open, goal, defaultPeriod, onClose, onSaved }: GoalFormDialogProps) {
  const isEditing = !!goal;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: 'individual',
      goalAmount: 0,
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        level: goal.level,
        profileId: goal.profileId ?? undefined,
        teamId: goal.teamId ?? undefined,
        regionId: goal.regionId ?? undefined,
        goalAmount: parseFloat(goal.goalAmount),
        goalCount: goal.goalCount ?? undefined,
      });
    } else {
      form.reset({
        level: 'individual',
        goalAmount: 0,
      });
    }
  }, [goal, form]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        level: values.level,
        profileId: values.level === 'individual' ? values.profileId : undefined,
        teamId: values.level === 'team' ? values.teamId : undefined,
        regionId: values.level === 'region' ? values.regionId : undefined,
        goalAmount: values.goalAmount,
        goalCount: values.goalCount,
        periodYear: defaultPeriod.year,
        periodMonth: defaultPeriod.month,
      };

      if (isEditing) {
        await api.patch(`/goals/${goal.id}`, { goalAmount: values.goalAmount, goalCount: values.goalCount });
        toast.success('Meta atualizada');
      } else {
        await api.post('/goals', payload);
        toast.success('Meta criada');
      }
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar meta';
      toast.error(message);
    }
  }

  const selectedLevel = form.watch('level');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nível</Label>
            <Select
              value={selectedLevel}
              onValueChange={(v) => form.setValue('level', v as GoalLevel)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Equipe</SelectItem>
                <SelectItem value="region">Regional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedLevel === 'individual' && !isEditing && (
            <div className="space-y-2">
              <Label htmlFor="profileId">ID do Perfil</Label>
              <Input
                id="profileId"
                placeholder="UUID do colaborador"
                {...form.register('profileId')}
              />
              {form.formState.errors.profileId && (
                <p className="text-xs text-destructive">{form.formState.errors.profileId.message}</p>
              )}
            </div>
          )}

          {selectedLevel === 'team' && !isEditing && (
            <div className="space-y-2">
              <Label htmlFor="teamId">ID da Equipe</Label>
              <Input
                id="teamId"
                placeholder="UUID da equipe"
                {...form.register('teamId')}
              />
            </div>
          )}

          {selectedLevel === 'region' && !isEditing && (
            <div className="space-y-2">
              <Label htmlFor="regionId">ID da Região</Label>
              <Input
                id="regionId"
                placeholder="UUID da região"
                {...form.register('regionId')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="goalAmount">Valor da Meta (R$)</Label>
            <Input
              id="goalAmount"
              type="number"
              step="0.01"
              min="0"
              {...form.register('goalAmount')}
            />
            {form.formState.errors.goalAmount && (
              <p className="text-xs text-destructive">{form.formState.errors.goalAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalCount">Quantidade (opcional)</Label>
            <Input
              id="goalCount"
              type="number"
              min="0"
              {...form.register('goalCount')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
