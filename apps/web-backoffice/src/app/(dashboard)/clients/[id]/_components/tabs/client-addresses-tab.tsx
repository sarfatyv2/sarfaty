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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Skeleton,
  Badge,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2, MapPin, Star, Database } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { ClientAddress } from '@nexus/types';
import { StaggerChildren, StaggerItem } from '../motion-wrapper';

interface ClientAddressesTabProps {
  clientId: string;
}

const USE_TYPE_OPTIONS = [
  { value: 'commercial', label: 'Comercial' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'correspondence', label: 'Correspondência' },
  { value: 'billing', label: 'Cobrança' },
];

type FormData = {
  useType: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;
  withoutNumber: boolean;
  isPrimary: boolean;
};

const emptyForm: FormData = {
  useType: '', street: '', number: '', complement: '',
  neighborhood: '', zipCode: '', city: '', state: '',
  withoutNumber: false, isPrimary: false,
};

export function ClientAddressesTab({ clientId }: ClientAddressesTabProps) {
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientAddress[]>(`/clients/${clientId}/addresses`);
      setAddresses(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(address: ClientAddress) {
    setEditingId(address.id);
    setForm({
      useType: address.useType ?? '',
      street: address.street ?? '',
      number: address.number ?? '',
      complement: address.complement ?? '',
      neighborhood: address.neighborhood ?? '',
      zipCode: address.zipCode ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      withoutNumber: address.withoutNumber,
      isPrimary: address.isPrimary,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        useType: form.useType || undefined,
        street: form.street || undefined,
        number: form.withoutNumber ? undefined : (form.number || undefined),
        complement: form.complement || undefined,
        neighborhood: form.neighborhood || undefined,
        zipCode: form.zipCode || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        withoutNumber: form.withoutNumber,
        isPrimary: form.isPrimary,
      };
      if (editingId) {
        await api.patch(`/clients/${clientId}/addresses/${editingId}`, body);
        toast.success('Endereço atualizado');
      } else {
        await api.post(`/clients/${clientId}/addresses`, body);
        toast.success('Endereço adicionado');
      }
      setDialogOpen(false);
      loadAddresses();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar endereço');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/clients/${clientId}/addresses/${id}`);
      toast.success('Endereço removido');
      loadAddresses();
    } catch {
      toast.error('Erro ao remover endereço');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1', 'sk-2'].map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin size={15} className="text-primary" />
            Endereços
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground">({addresses.length})</span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={14} />
            Adicionar Endereço
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-12 text-center space-y-2">
            <MapPin size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum endereço cadastrado.</p>
            <p className="text-xs text-muted-foreground">Adicione um endereço para começar.</p>
          </div>
        ) : (
          <StaggerChildren className="divide-y rounded-xl border overflow-hidden" staggerDelay={0.04}>
            {addresses.map((a) => (
              <StaggerItem key={a.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MapPin size={13} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">
                          {[a.street, a.number, a.complement].filter(Boolean).join(', ') || '—'}
                        </p>
                        {a.isPrimary && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-transparent">
                            <Star size={8} className="mr-0.5" />
                            Principal
                          </Badge>
                        )}
                        {a.useType && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {USE_TYPE_OPTIONS.find((o) => o.value === a.useType)?.label ?? a.useType}
                          </Badge>
                        )}
                        {a.source && a.source !== 'manual' && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-blue-600 border-blue-200">
                            <Database size={8} className="mr-0.5" />
                            {a.source.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[a.neighborhood, a.city, a.state, a.zipCode].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                    >
                      {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.useType} onValueChange={(v) => setForm((p) => ({ ...p, useType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {USE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} disabled={form.withoutNumber} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Sem número</Label>
                <Switch checked={form.withoutNumber} onCheckedChange={(v) => setForm((p) => ({ ...p, withoutNumber: v, number: v ? '' : p.number }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input value={form.complement} onChange={(e) => setForm((p) => ({ ...p, complement: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={form.neighborhood} onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={form.zipCode} onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Estado (UF)</Label>
                  <Input value={form.state} maxLength={2} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value.toUpperCase() }))} placeholder="SP" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Endereço Principal</Label>
                <Switch checked={form.isPrimary} onCheckedChange={(v) => setForm((p) => ({ ...p, isPrimary: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

