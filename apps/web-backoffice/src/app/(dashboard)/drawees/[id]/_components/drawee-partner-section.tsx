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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
} from '@nexus/ui';
import { Plus, Users, Mail, Phone, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { DraweeAuthorizedPerson } from '@nexus/types';
import { FadeIn, StaggerChildren, StaggerItem } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';

interface DraweePartnerSectionProps {
  draweeId: string;
  personType: 'individual' | 'company';
}

type FormData = {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  authorizationType: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  fullName: '',
  cpf: '',
  phone: '',
  email: '',
  authorizationType: 'partner',
  isActive: true,
};

const AUTH_TYPE_LABELS: Record<string, string> = {
  partner: 'Sócio',
  administrator: 'Administrador',
  attorney: 'Procurador',
  legal_representative: 'Representante Legal',
  authorized: 'Autorizado',
};

function formatCpf(cpf: string): string {
  const d = cpf.replaceAll(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

const AVATAR_PALETTE = [
  'bg-[hsl(30,30%,93%)] text-[hsl(150,50%,15%)]',
  'bg-[hsl(150,20%,90%)] text-[hsl(150,50%,20%)]',
  'bg-[hsl(40,30%,90%)] text-[hsl(40,30%,30%)]',
  'bg-[hsl(150,15%,85%)] text-[hsl(150,40%,18%)]',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]!;
}

export function DraweePartnerSection({ draweeId, personType }: DraweePartnerSectionProps) {
  const [partners, setPartners] = useState<DraweeAuthorizedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<DraweeAuthorizedPerson[]>(`/drawees/${draweeId}/authorized-persons`);
      setPartners(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar sócios');
    } finally {
      setLoading(false);
    }
  }, [draweeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(person: DraweeAuthorizedPerson) {
    setEditingId(person.id);
    setForm({
      fullName: person.fullName,
      cpf: person.cpf ?? '',
      phone: person.phone ?? '',
      email: person.email ?? '',
      authorizationType: person.authorizationType ?? 'partner',
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
        authorizationType: form.authorizationType,
        cpf: cpfDigits || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/drawees/${draweeId}/authorized-persons/${editingId}`, body);
        toast.success('Sócio atualizado');
      } else {
        await api.post(`/drawees/${draweeId}/authorized-persons`, body);
        toast.success('Sócio adicionado');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors && Object.values(err.errors).flat()[0];
        toast.error(firstError ?? err.message);
      } else {
        toast.error('Erro ao salvar sócio');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/drawees/${draweeId}/authorized-persons/${id}`);
      toast.success('Sócio removido');
      loadData();
    } catch {
      toast.error('Erro ao remover sócio');
    } finally {
      setDeleting(null);
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="space-y-3">
          {['sk-0', 'sk-1'].map((k) => (
            <Skeleton key={k} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (partners.length === 0) {
      return (
        <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-10 text-center space-y-2">
          <Users size={28} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum sócio cadastrado.</p>
          {personType === 'company' ? (
            <p className="text-xs text-muted-foreground">
              Os sócios são preenchidos automaticamente pelo Serasa (QSA). Clique em &quot;Adicionar Sócio&quot; para cadastrar manualmente.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Para pessoa física, sócios não se aplicam. Use &quot;Adicionar&quot; para pessoas autorizadas, se necessário.
            </p>
          )}
        </div>
      );
    }

    return (
      <StaggerChildren className="space-y-2" staggerDelay={0.06}>
        {partners.map((partner) => (
          <StaggerItem key={partner.id}>
            <div className="rounded-xl border bg-card overflow-hidden flex items-center gap-4 px-5 py-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColor(partner.fullName)}`}
              >
                {getInitials(partner.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate">{partner.fullName}</span>
                  {partner.authorizationType && (
                    <span className="text-xs text-muted-foreground bg-muted/60 rounded px-2 py-0.5">
                      {AUTH_TYPE_LABELS[partner.authorizationType] ?? partner.authorizationType}
                    </span>
                  )}
                  {!partner.isActive && (
                    <span className="text-xs text-muted-foreground border rounded px-2 py-0.5">Inativo</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {partner.cpf && (
                    <span className="text-xs text-muted-foreground font-mono">{formatCpf(partner.cpf)}</span>
                  )}
                  {partner.email && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail size={10} />
                      {partner.email}
                    </span>
                  )}
                  {partner.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone size={10} />
                      {partner.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => openEdit(partner)}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(partner.id)}
                  disabled={deleting === partner.id}
                >
                  {deleting === partner.id ? (
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
    );
  }

  return (
    <FadeIn delay={0.1}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={15} className="text-primary" />
              Sócios
              {!loading && <span className="text-sm font-normal text-muted-foreground">({partners.length})</span>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
              <Plus size={14} />
              Adicionar Sócio
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Sócio' : 'Novo Sócio / Administrador'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            {personType === 'company' && (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.authorizationType}
                  onValueChange={(v) => setForm((p) => ({ ...p, authorizationType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Sócio</SelectItem>
                    <SelectItem value="administrator">Administrador</SelectItem>
                    <SelectItem value="attorney">Procurador</SelectItem>
                    <SelectItem value="legal_representative">Representante Legal</SelectItem>
                    <SelectItem value="authorized">Autorizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <span className="mr-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
