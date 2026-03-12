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
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, Star, MessageCircle, Users, Database } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { DraweeContact } from '@nexus/types';
import { StaggerChildren, StaggerItem } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';

interface DraweeContactsTabProps {
  draweeId: string;
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
  billingEmail: string;
  xmlEmail: string;
  phone: string;
  phoneMobile: string;
  billingPhone: string;
  whatsapp: boolean;
  isPrimary: boolean;
};

const emptyForm: FormData = {
  contactName: '',
  useType: '',
  email: '',
  billingEmail: '',
  xmlEmail: '',
  phone: '',
  phoneMobile: '',
  billingPhone: '',
  whatsapp: false,
  isPrimary: false,
};

export function DraweeContactsTab({ draweeId }: DraweeContactsTabProps) {
  const [contacts, setContacts] = useState<DraweeContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<DraweeContact[]>(`/drawees/${draweeId}/contacts`);
      setContacts(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, [draweeId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(c: DraweeContact) {
    setEditingId(c.id);
    setForm({
      contactName: c.contactName ?? '',
      useType: c.useType ?? '',
      email: c.email ?? '',
      billingEmail: c.billingEmail ?? '',
      xmlEmail: c.xmlEmail ?? '',
      phone: c.phone ?? '',
      phoneMobile: c.phoneMobile ?? '',
      billingPhone: c.billingPhone ?? '',
      whatsapp: c.whatsapp,
      isPrimary: c.isPrimary,
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
        billingEmail: form.billingEmail || undefined,
        xmlEmail: form.xmlEmail || undefined,
        phone: form.phone || undefined,
        phoneMobile: form.phoneMobile || undefined,
        billingPhone: form.billingPhone || undefined,
        whatsapp: form.whatsapp,
        isPrimary: form.isPrimary,
      };
      if (editingId) {
        await api.patch(`/drawees/${draweeId}/contacts/${editingId}`, body);
        toast.success('Contato atualizado');
      } else {
        await api.post(`/drawees/${draweeId}/contacts`, body);
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
      await api.delete(`/drawees/${draweeId}/contacts/${id}`);
      toast.success('Contato removido');
      loadContacts();
    } catch {
      toast.error('Erro ao remover contato');
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
            <Phone size={15} className="text-primary" />
            Contatos
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground">({contacts.length})</span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={14} />
            Adicionar Contato
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-12 text-center space-y-2">
            <Users size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum contato cadastrado.</p>
            <p className="text-xs text-muted-foreground">Adicione um contato para começar.</p>
          </div>
        ) : (
          <StaggerChildren className="divide-y rounded-xl border overflow-hidden" staggerDelay={0.04}>
            {contacts.map((c) => (
              <StaggerItem key={c.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Phone size={13} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{c.contactName ?? '—'}</p>
                        {c.isPrimary && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-transparent">
                            <Star size={8} className="mr-0.5" />
                            Principal
                          </Badge>
                        )}
                        {c.useType && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {USE_TYPE_OPTIONS.find((o) => o.value === c.useType)?.label ?? c.useType}
                          </Badge>
                        )}
                        {c.whatsapp && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-green-600 border-green-200">
                            <MessageCircle size={8} className="mr-0.5" />
                            WhatsApp
                          </Badge>
                        )}
                        {c.source && c.source !== 'manual' && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-blue-600 border-blue-200">
                            <Database size={8} className="mr-0.5" />
                            {c.source.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            {c.email}
                          </span>
                        )}
                        {c.billingEmail && (
                          <span className="flex items-center gap-1 text-muted-foreground/80">
                            Cobr: {c.billingEmail}
                          </span>
                        )}
                        {(c.phone || c.phoneMobile || c.billingPhone) && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} />
                            {[c.phone, c.phoneMobile, c.billingPhone].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                    >
                      {deleting === c.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
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
              <DialogTitle>{editingId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.contactName}
                    onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.useType}
                    onValueChange={(v) => setForm((p) => ({ ...p, useType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {USE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Cobrança</Label>
                  <Input
                    type="email"
                    value={form.billingEmail}
                    onChange={(e) => setForm((p) => ({ ...p, billingEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email NF-e (XML)</Label>
                  <Input
                    type="email"
                    value={form.xmlEmail}
                    onChange={(e) => setForm((p) => ({ ...p, xmlEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Celular</Label>
                  <Input
                    value={form.phoneMobile}
                    onChange={(e) => setForm((p) => ({ ...p, phoneMobile: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fone Cobrança</Label>
                  <Input
                    value={form.billingPhone}
                    onChange={(e) => setForm((p) => ({ ...p, billingPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>WhatsApp</Label>
                <Switch
                  checked={form.whatsapp}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Contato Principal</Label>
                <Switch
                  checked={form.isPrimary}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isPrimary: v }))}
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
      </CardContent>
    </Card>
  );
}
