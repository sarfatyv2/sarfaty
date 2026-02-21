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
import type { ClientAuthorizedPerson } from '@nexus/types';

interface ClientAuthorizedPersonsTabProps {
  clientId: string;
}

const AUTH_TYPE_OPTIONS = [
  { value: 'partner', label: 'Sócio' },
  { value: 'attorney', label: 'Procurador' },
  { value: 'legal_representative', label: 'Representante Legal' },
  { value: 'authorized', label: 'Autorizado' },
];

type FormData = {
  fullName: string;
  authorizationType: string;
  cpf: string;
  phone: string;
  email: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  fullName: '', authorizationType: '', cpf: '', phone: '', email: '', isActive: true,
};

export function ClientAuthorizedPersonsTab({ clientId }: ClientAuthorizedPersonsTabProps) {
  const [persons, setPersons] = useState<ClientAuthorizedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadPersons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientAuthorizedPerson[]>(`/clients/${clientId}/authorized-persons`);
      setPersons(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar pessoas autorizadas');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadPersons(); }, [loadPersons]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(person: ClientAuthorizedPerson) {
    setEditingId(person.id);
    setForm({
      fullName: person.fullName,
      authorizationType: person.authorizationType ?? '',
      cpf: person.cpf ?? '',
      phone: person.phone ?? '',
      email: person.email ?? '',
      isActive: person.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.fullName.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const body = {
        fullName: form.fullName,
        authorizationType: form.authorizationType || undefined,
        cpf: form.cpf.replaceAll(/\D/g, '') || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/clients/${clientId}/authorized-persons/${editingId}`, body);
        toast.success('Pessoa autorizada atualizada');
      } else {
        await api.post(`/clients/${clientId}/authorized-persons`, body);
        toast.success('Pessoa autorizada adicionada');
      }
      setDialogOpen(false);
      loadPersons();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/clients/${clientId}/authorized-persons/${id}`);
      toast.success('Pessoa autorizada removida');
      loadPersons();
    } catch {
      toast.error('Erro ao remover');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} />
          Adicionar Pessoa
        </Button>
      </div>

      {persons.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma pessoa autorizada cadastrada.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {persons.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{p.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {[
                    AUTH_TYPE_OPTIONS.find((o) => o.value === p.authorizationType)?.label,
                    p.cpf && `CPF: ${p.cpf}`,
                    p.email,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                >
                  {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Pessoa Autorizada' : 'Nova Pessoa Autorizada'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Autorização</Label>
                <Select value={form.authorizationType} onValueChange={(v) => setForm((p) => ({ ...p, authorizationType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {AUTH_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
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
    </div>
  );
}
