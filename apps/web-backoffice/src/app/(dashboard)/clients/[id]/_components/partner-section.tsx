'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
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
  Switch,
} from '@nexus/ui';
import { AlertTriangle, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { ClientAuthorizedPerson } from '@nexus/types';
import { FadeIn, StaggerChildren, StaggerItem } from './motion-wrapper';
import { PartnerCard } from './partner-card';
import type { IrpfExtraction } from './tabs/client-irpf-tab';
import { computePartnerAlerts, computeCompanyAlerts } from '@/lib/partner-alert-rules';

type PartnerSectionProps = Readonly<{
  clientId: string;
  foundedAt?: string | null;
}>;

type FormData = {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  fullName: '', cpf: '', phone: '', email: '', isActive: true,
};

const POLLING_INTERVAL_MS = 5_000;
const PROCESSING_STATUSES = new Set<IrpfExtraction['extractionStatus']>(['pending', 'processing']);

export function PartnerSection({ clientId, foundedAt }: PartnerSectionProps) {
  const [partners, setPartners] = useState<ClientAuthorizedPerson[]>([]);
  const [irpfExtractions, setIrpfExtractions] = useState<IrpfExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [personsRes, irpfRes] = await Promise.all([
        api.get<ClientAuthorizedPerson[]>(`/clients/${clientId}/authorized-persons`),
        api.get<IrpfExtraction[]>(`/clients/${clientId}/irpf-extractions`),
      ]);
      const allPersons = personsRes.data ?? [];
      setPartners(allPersons.filter((p) => p.authorizationType === 'partner'));
      setIrpfExtractions(irpfRes.data ?? []);
    } catch {
      if (!silent) toast.error('Erro ao carregar sócios');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const hasProcessing = irpfExtractions.some((e) => PROCESSING_STATUSES.has(e.extractionStatus));
    if (!hasProcessing) return;
    const timer = setInterval(() => loadData(true), POLLING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [irpfExtractions, loadData]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(person: ClientAuthorizedPerson) {
    setEditingId(person.id);
    setForm({
      fullName: person.fullName,
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
        authorizationType: 'partner',
        cpf: cpfDigits || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/clients/${clientId}/authorized-persons/${editingId}`, body);
        toast.success('Sócio atualizado');
      } else {
        await api.post(`/clients/${clientId}/authorized-persons`, body);
        toast.success('Sócio adicionado');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors && Object.values(err.errors).flat().at(0);
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
      await api.delete(`/clients/${clientId}/authorized-persons/${id}`);
      toast.success('Sócio removido');
      loadData();
    } catch {
      toast.error('Erro ao remover sócio');
    } finally {
      setDeleting(null);
    }
  }

  async function handleReprocess(extraction: IrpfExtraction) {
    setReprocessingId(extraction.id);
    try {
      await api.post(`/clients/${clientId}/irpf-extractions/${extraction.id}/reprocess`);
      toast.success('Reprocessamento agendado. Aguarde alguns instantes.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao agendar reprocessamento');
    } finally {
      setReprocessingId(null);
    }
  }

  function getPartnerIrpf(partner: ClientAuthorizedPerson): IrpfExtraction[] {
    // Primary match: by CPF when partner has CPF
    if (partner.cpf) {
      const cpfDigits = partner.cpf.replaceAll(/\D/g, '');
      const byCpf = irpfExtractions.filter(
        (e) => e.cpf && e.cpf.replaceAll(/\D/g, '') === cpfDigits,
      );
      if (byCpf.length > 0) return byCpf;
    }
    // Fallback: match by name (e.g. partner added without CPF, or CPF differs from doc)
    // Uses same logic as backend — at least 2 significant words or 1 if name has few words
    if (!partner.fullName?.trim()) return [];
    const normalizedPartner = partner.fullName
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replaceAll(/\s+/g, ' ')
      .trim();
    const expectedWords = normalizedPartner.split(' ').filter((w) => w.length > 2);
    if (expectedWords.length === 0) return [];
    return irpfExtractions.filter((e) => {
      if (!e.fullName) return false;
      const normalizedExtracted = e.fullName
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replaceAll(/\s+/g, ' ')
        .trim();
      const matchCount = expectedWords.filter((w) => normalizedExtracted.includes(w)).length;
      return matchCount >= Math.min(2, expectedWords.length);
    });
  }

  function renderPartnerContent() {
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
          <p className="text-xs text-muted-foreground">
            Clique em "Adicionar Sócio" ou cadastre via aba Pessoas Autorizadas.
          </p>
        </div>
      );
    }

    return (
      <StaggerChildren className="space-y-2" staggerDelay={0.06}>
        {partners.map((partner) => (
          <StaggerItem key={partner.id}>
            <PartnerCard
              person={partner}
              clientId={clientId}
              foundedAt={foundedAt ?? null}
              irpfExtractions={getPartnerIrpf(partner)}
              reprocessingId={reprocessingId}
              onReprocess={handleReprocess}
              onEdit={openEdit}
              onDelete={handleDelete}
              deleting={deleting}
            />
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
              {!loading && (
                <span className="text-sm font-normal text-muted-foreground">({partners.length})</span>
              )}
              {!loading && partners.length > 0 && (() => {
                const companyAlerts = computeCompanyAlerts(foundedAt ?? null);
                const allPartnerAlerts = partners.flatMap((p) => computePartnerAlerts(p, foundedAt ?? null));
                const totalAlerts = companyAlerts.length + allPartnerAlerts.length;
                return totalAlerts > 0 ? (
                  <Badge variant="outline" className="text-xs gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={11} />
                    {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'}
                  </Badge>
                ) : null;
              })()}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
              <Plus size={14} />
              Adicionar Sócio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderPartnerContent()}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Sócio' : 'Novo Sócio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nome completo do sócio"
              />
            </div>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <span className="mr-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}

