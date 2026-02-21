'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
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
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { DraweeAddress } from '@nexus/types';

interface DraweeAddressesTabProps {
  draweeId: string;
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

export function DraweeAddressesTab({ draweeId }: DraweeAddressesTabProps) {
  const [addresses, setAddresses] = useState<DraweeAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<DraweeAddress[]>(`/drawees/${draweeId}/addresses`);
      setAddresses(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  }, [draweeId]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }

  function openEdit(a: DraweeAddress) {
    setEditingId(a.id);
    setForm({
      useType: a.useType ?? '', street: a.street ?? '', number: a.number ?? '',
      complement: a.complement ?? '', neighborhood: a.neighborhood ?? '',
      zipCode: a.zipCode ?? '', city: a.city ?? '', state: a.state ?? '',
      withoutNumber: a.withoutNumber, isPrimary: a.isPrimary,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = { ...form, useType: form.useType || undefined, number: form.withoutNumber ? undefined : (form.number || undefined) };
      if (editingId) {
        await api.patch(`/drawees/${draweeId}/addresses/${editingId}`, body);
        toast.success('Endereço atualizado');
      } else {
        await api.post(`/drawees/${draweeId}/addresses`, body);
        toast.success('Endereço adicionado');
      }
      setDialogOpen(false);
      loadAddresses();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/drawees/${draweeId}/addresses/${id}`);
      toast.success('Endereço removido');
      loadAddresses();
    } catch { toast.error('Erro ao remover'); }
    finally { setDeleting(null); }
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}><Plus size={14} />Adicionar Endereço</Button>
      </div>
      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum endereço cadastrado.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{[a.street, a.number, a.complement].filter(Boolean).join(', ')}</p>
                <p className="text-xs text-muted-foreground">{[a.neighborhood, a.city, a.state, a.zipCode].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} disabled={deleting === a.id}>
                  {deleting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.useType} onValueChange={(v) => setForm((p) => ({ ...p, useType: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{USE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2"><Label>Rua</Label><Input value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Número</Label><Input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} disabled={form.withoutNumber} /></div>
            </div>
            <div className="flex items-center justify-between"><Label>Sem número</Label><Switch checked={form.withoutNumber} onCheckedChange={(v) => setForm((p) => ({ ...p, withoutNumber: v }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Complemento</Label><Input value={form.complement} onChange={(e) => setForm((p) => ({ ...p, complement: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Bairro</Label><Input value={form.neighborhood} onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))} /></div>
              <div className="space-y-2"><Label>CEP</Label><Input value={form.zipCode} onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
              <div className="space-y-2"><Label>UF</Label><Input value={form.state} maxLength={2} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value.toUpperCase() }))} /></div>
            </div>
            <div className="flex items-center justify-between"><Label>Endereço Principal</Label><Switch checked={form.isPrimary} onCheckedChange={(v) => setForm((p) => ({ ...p, isPrimary: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
