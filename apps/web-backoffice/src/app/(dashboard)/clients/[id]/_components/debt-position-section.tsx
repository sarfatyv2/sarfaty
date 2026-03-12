'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Skeleton,
  Badge,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2, ShieldAlert, Bot, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { FadeIn, StaggerChildren, StaggerItem } from './motion-wrapper';

interface DebtPositionItem {
  id: string;
  clientId: string;
  documentId: string | null;
  institution: string;
  modality: string | null;
  guarantee: string | null;
  guaranteePercentage: string | null;
  value: string;
  notes: string | null;
  source: 'ai' | 'manual';
  extractionConfidence: 'high' | 'medium' | 'low' | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DebtPositionSectionProps {
  readonly clientId: string;
}

type FormData = {
  institution: string;
  modality: string;
  guarantee: string;
  guaranteePercentage: string;
  value: string;
  notes: string;
};

const emptyForm: FormData = {
  institution: '',
  modality: '',
  guarantee: '',
  guaranteePercentage: '',
  value: '',
  notes: '',
};

const CONFIDENCE_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercentage(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toFixed(1)}%`;
}

export function DebtPositionSection({ clientId }: DebtPositionSectionProps) {
  const [items, setItems] = useState<DebtPositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadItems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<DebtPositionItem[]>(`/clients/${clientId}/debt-positions`);
      setItems(res.data ?? []);
    } catch (err) {
      if (!silent) {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar endividamento');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: DebtPositionItem) {
    setEditingId(item.id);
    setForm({
      institution: item.institution,
      modality: item.modality ?? '',
      guarantee: item.guarantee ?? '',
      guaranteePercentage: item.guaranteePercentage ?? '',
      value: item.value,
      notes: item.notes ?? '',
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.institution.trim()) {
      toast.error('Instituição é obrigatória');
      return;
    }
    const valueNum = Number(form.value);
    if (!form.value || Number.isNaN(valueNum) || valueNum < 0) {
      toast.error('Valor deve ser um número positivo');
      return;
    }

    setSaving(true);
    try {
      const body = {
        institution: form.institution.trim(),
        modality: form.modality.trim() || undefined,
        guarantee: form.guarantee.trim() || undefined,
        guaranteePercentage: form.guaranteePercentage ? Number(form.guaranteePercentage) : undefined,
        value: valueNum,
        notes: form.notes.trim() || undefined,
      };

      if (editingId) {
        await api.patch(`/clients/${clientId}/debt-positions/${editingId}`, body);
        toast.success('Item atualizado');
      } else {
        await api.post(`/clients/${clientId}/debt-positions`, body);
        toast.success('Item adicionado');
      }
      setDialogOpen(false);
      void loadItems(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/clients/${clientId}/debt-positions/${id}`);
      toast.success('Item removido');
      void loadItems(true);
    } catch {
      toast.error('Erro ao remover item');
    } finally {
      setDeleting(null);
    }
  }

  const totalDebt = items.reduce((sum, item) => {
    const v = Number(item.value);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1'].map((k) => (
          <Skeleton key={k} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <FadeIn delay={0.1}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert size={15} className="text-primary shrink-0" />
              <CardTitle className="text-sm">
                Endividamento
              </CardTitle>
              {items.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => void loadItems()}
                title="Atualizar"
              >
                <RefreshCw size={13} />
              </Button>
              <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
                <Plus size={14} />
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="rounded-b-xl flex flex-col items-center justify-center py-12 text-center space-y-2 px-6">
              <ShieldAlert size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-medium">
                Nenhum item de endividamento cadastrado.
              </p>
              <p className="text-xs text-muted-foreground">
                Faça o upload do documento na aba Documentos para extração automática,
                ou adicione os dados manualmente.
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-4 py-2 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 border-b">
                <span>Instituição / Modalidade</span>
                <span className="text-right w-32">Garantia</span>
                <span className="text-right w-16 whitespace-nowrap">% Garantia</span>
                <span className="text-right w-28">Saldo</span>
                <span className="w-16" />
              </div>

              <StaggerChildren className="divide-y" staggerDelay={0.04}>
                {items.map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                      {/* Institution + modality */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{item.institution}</p>
                          {item.isAiGenerated && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5 gap-0.5 border-blue-300 text-blue-600 bg-blue-50"
                            >
                              <Bot size={8} />
                              IA
                              {item.extractionConfidence && (
                                <span className="ml-0.5">· {CONFIDENCE_LABELS[item.extractionConfidence]}</span>
                              )}
                            </Badge>
                          )}
                        </div>
                        {item.modality && (
                          <p className="text-xs text-muted-foreground">{item.modality}</p>
                        )}
                      </div>

                      {/* Guarantee */}
                      <div className="text-right w-32">
                        <p className="text-sm text-muted-foreground truncate">
                          {item.guarantee ?? '—'}
                        </p>
                      </div>

                      {/* Guarantee % */}
                      <div className="text-right w-16">
                        <p className="text-sm font-mono text-muted-foreground">
                          {formatPercentage(item.guaranteePercentage)}
                        </p>
                      </div>

                      {/* Value */}
                      <div className="text-right w-28">
                        <p className="text-sm font-medium">{formatCurrency(item.value)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 justify-end w-16">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                        >
                          {deleting === item.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>

              {/* Total row */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Total
                </span>
                <span className="text-sm font-semibold">
                  {totalDebt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Item de Endividamento' : 'Novo Item de Endividamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Instituição <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.institution}
                onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
                placeholder="Ex: Banco Bradesco S.A."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Input
                  value={form.modality}
                  onChange={(e) => setForm((p) => ({ ...p, modality: e.target.value }))}
                  placeholder="Ex: Capital de Giro"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Valor (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Garantia</Label>
                <Input
                  value={form.guarantee}
                  onChange={(e) => setForm((p) => ({ ...p, guarantee: e.target.value }))}
                  placeholder="Ex: Alienação Fiduciária"
                />
              </div>
              <div className="space-y-2">
                <Label>% da Garantia</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.guaranteePercentage}
                  onChange={(e) => setForm((p) => ({ ...p, guaranteePercentage: e.target.value }))}
                  placeholder="Ex: 100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
