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
  Badge,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2, UserCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { ClientAuthorizedPerson } from '@nexus/types';
import { StaggerChildren, StaggerItem, AnimatedTabContent } from '../motion-wrapper';

interface ClientAuthorizedPersonsTabProps {
  clientId: string;
}

const AUTH_TYPE_OPTIONS = [
  { value: 'partner', label: 'Sócio' },
  { value: 'attorney', label: 'Procurador' },
  { value: 'legal_representative', label: 'Representante Legal' },
  { value: 'authorized', label: 'Autorizado' },
];

const AUTH_TYPE_COLORS: Record<string, string> = {
  partner: 'bg-blue-100 text-blue-700 border-transparent',
  attorney: 'bg-violet-100 text-violet-700 border-transparent',
  legal_representative: 'bg-emerald-100 text-emerald-700 border-transparent',
  authorized: 'bg-amber-100 text-amber-700 border-transparent',
};

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
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      toast.error('Nome completo deve ter ao menos 2 caracteres');
      return;
    }

    const cpfDigits = form.cpf.replaceAll(/\D/g, '');
    if (cpfDigits && cpfDigits.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Email inválido');
      return;
    }

    setSaving(true);
    try {
      const body = {
        fullName: form.fullName.trim(),
        authorizationType: form.authorizationType || undefined,
        cpf: cpfDigits || undefined,
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
      if (err instanceof ApiError) {
        const firstError = err.errors && Object.values(err.errors).flat()[0];
        toast.error(firstError ?? err.message);
      } else {
        toast.error('Erro ao salvar');
      }
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
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1', 'sk-2'].map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <AnimatedTabContent>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={14} />
            Adicionar Pessoa
          </Button>
        </div>

        {persons.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-12 text-center space-y-2">
            <ShieldCheck size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhuma pessoa autorizada cadastrada.</p>
            <p className="text-xs text-muted-foreground">Adicione sócios, procuradores ou representantes legais.</p>
          </div>
        ) : (
          <StaggerChildren className="divide-y rounded-xl border overflow-hidden" staggerDelay={0.04}>
            {persons.map((p) => (
              <StaggerItem key={p.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserCircle size={14} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{p.fullName}</p>
                        {p.authorizationType && (
                          <Badge
                            className={`text-[10px] h-4 px-1.5 ${AUTH_TYPE_COLORS[p.authorizationType] ?? 'bg-muted text-muted-foreground border-transparent'}`}
                          >
                            {AUTH_TYPE_OPTIONS.find((o) => o.value === p.authorizationType)?.label ?? p.authorizationType}
                          </Badge>
                        )}
                        {!p.isActive && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {p.cpf && <span className="font-mono">{p.cpf}</span>}
                        {p.email && (
                          <span className="flex items-center gap-1"><Mail size={10} />{p.email}</span>
                        )}
                        {p.phone && (
                          <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
    </AnimatedTabContent>
  );
}
