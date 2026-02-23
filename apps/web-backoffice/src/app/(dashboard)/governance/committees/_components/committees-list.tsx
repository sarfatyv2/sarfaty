'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@nexus/ui';
import type { Committee } from '@nexus/types';

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  adhoc: 'Sob demanda',
};

const COMMITTEE_LIST_SKELETONS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

interface CreateCommitteeFormData {
  name: string;
  description: string;
  regulation: string;
  frequency: string;
}

function CreateCommitteeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (committee: Committee) => void;
}) {
  const [form, setForm] = useState<CreateCommitteeFormData>({
    name: '',
    description: '',
    regulation: '',
    frequency: 'monthly',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Nome do comitê é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<Committee>('/governance/committees', {
        name: form.name,
        description: form.description || undefined,
        regulation: form.regulation || undefined,
        frequency: form.frequency,
      });
      onCreated(res.data);
      toast.success('Comitê criado com sucesso');
      onClose();
    } catch {
      toast.error('Erro ao criar comitê');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Comitê</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Comitê de Crédito"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Objetivo e escopo do comitê"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={form.frequency}
              onValueChange={(value) => setForm((f) => ({ ...f, frequency: value }))}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="regulation">Regulamento</Label>
            <Textarea
              id="regulation"
              value={form.regulation}
              onChange={(e) => setForm((f) => ({ ...f, regulation: e.target.value }))}
              placeholder="Descreva o regulamento interno do comitê..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar Comitê'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderCommitteesGrid({
  loading,
  committees,
  onCreateClick,
  onCardClick,
}: {
  loading: boolean;
  committees: Committee[];
  onCreateClick: () => void;
  onCardClick: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMMITTEE_LIST_SKELETONS.map((k) => (
          <Skeleton key={k} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }
  if (committees.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Nenhum comitê cadastrado.</p>
          <Button className="mt-4" onClick={onCreateClick}>
            Criar primeiro comitê
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {committees.map((committee) => (
        <Card
          key={committee.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onCardClick(committee.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-tight">{committee.name}</CardTitle>
              <Badge variant={committee.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                {committee.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {committee.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{committee.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Frequência:</span>{' '}
              {FREQUENCY_LABELS[committee.frequency] ?? committee.frequency}
            </p>
            <p className="text-xs text-muted-foreground">
              Criado em {new Date(committee.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CommitteesList() {
  const router = useRouter();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadCommittees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Committee[]>('/governance/committees', { pageSize: 50 });
      setCommittees(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCommittees();
  }, [loadCommittees]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          Novo Comitê
        </Button>
      </div>

      {renderCommitteesGrid({
        loading,
        committees,
        onCreateClick: () => setCreateOpen(true),
        onCardClick: (id) => router.push(`/governance/committees/${id}`),
      })}

      <CreateCommitteeDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(committee) => setCommittees((prev) => [committee, ...prev])}
      />
    </div>
  );
}
