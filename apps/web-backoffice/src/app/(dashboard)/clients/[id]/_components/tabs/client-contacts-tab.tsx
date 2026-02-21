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
import type { ClientContact } from '@nexus/types';

interface ClientContactsTabProps {
  clientId: string;
}

const USE_TYPE_OPTIONS = [
  { value: 'commercial', label: 'Comercial' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'operational', label: 'Operacional' },
  { value: 'billing', label: 'Cobrança' },
];

type FormData = {
  contactName: string;
  useType: string;
  email: string;
  phone: string;
  phoneMobile: string;
  whatsapp: boolean;
  isPrimary: boolean;
};

const emptyForm: FormData = {
  contactName: '', useType: '', email: '', phone: '',
  phoneMobile: '', whatsapp: false, isPrimary: false,
};

export function ClientContactsTab({ clientId }: ClientContactsTabProps) {
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientContact[]>(`/clients/${clientId}/contacts`);
      setContacts(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(contact: ClientContact) {
    setEditingId(contact.id);
    setForm({
      contactName: contact.contactName ?? '',
      useType: contact.useType ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      phoneMobile: contact.phoneMobile ?? '',
      whatsapp: contact.whatsapp,
      isPrimary: contact.isPrimary,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        contactName: form.contactName || undefined,
        useType: form.useType || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        phoneMobile: form.phoneMobile || undefined,
        whatsapp: form.whatsapp,
        isPrimary: form.isPrimary,
      };
      if (editingId) {
        await api.patch(`/clients/${clientId}/contacts/${editingId}`, body);
        toast.success('Contato atualizado');
      } else {
        await api.post(`/clients/${clientId}/contacts`, body);
        toast.success('Contato adicionado');
      }
      setDialogOpen(false);
      loadContacts();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar contato');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/clients/${clientId}/contacts/${id}`);
      toast.success('Contato removido');
      loadContacts();
    } catch {
      toast.error('Erro ao remover contato');
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
          Adicionar Contato
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum contato cadastrado.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{c.contactName ?? '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {[c.email, c.phone, c.phoneMobile].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting === c.id}
                >
                  {deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.useType} onValueChange={(v) => setForm((p) => ({ ...p, useType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {USE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input value={form.phoneMobile} onChange={(e) => setForm((p) => ({ ...p, phoneMobile: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>WhatsApp</Label>
              <Switch checked={form.whatsapp} onCheckedChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Contato Principal</Label>
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
    </div>
  );
}
