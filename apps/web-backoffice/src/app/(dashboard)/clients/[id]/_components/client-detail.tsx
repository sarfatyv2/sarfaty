'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
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
} from '@nexus/ui';
import {
  Loader2,
  Send,
  XCircle,
  FileText,
  Building2,
  CreditCard,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import {
  getStatusLabel,
  getStatusColor,
  getStatusMessage,
  canAccessTab,
} from '@nexus/utils';
import type { DocumentChecklistItem, CanSubmitResult } from '@nexus/types';
import { DocumentChecklist } from '../../new/_components/document-checklist';
import { ClientContactsTab } from './tabs/client-contacts-tab';
import { ClientAddressesTab } from './tabs/client-addresses-tab';
import { ClientBankAccountsTab } from './tabs/client-bank-accounts-tab';
import { ClientCreditAnalysisTab } from './tabs/client-credit-analysis-tab';
import { PartnerSection } from './partner-section';
import { FaturamentoSection } from './faturamento-section';
import { ClientChatTab } from './tabs/client-chat-tab';
import { FadeIn, AnimatedTabContent } from './motion-wrapper';
import { useRole } from '@/contexts/role-context';

interface ClientData {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  creditProductId: string;
  phone: string;
  email: string;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  requestedAmount: string | null;
  approvedAmount: string | null;
  hasGuarantees: boolean;
  isJudicialRecovery: boolean;
  foundedAt: string | null;
  establishedAt: string | null;
  status: string;
  assignedTo: string;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface Segment {
  id: string;
  name: string;
}

interface CreditProduct {
  id: string;
  name: string;
}

type ClientDetailProps = Readonly<{
  client: ClientData;
  segmentName: string;
  productName: string;
  segments: Segment[];
  products: CreditProduct[];
}>;

const PULSING_STATUSES = new Set([
  'pending_documents',
  'document_validation',
  'credit_analysis',
  'processing',
]);

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoField({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="text-sm font-medium leading-snug">{value || '—'}</p>
    </div>
  );
}

function SectionDivider({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

type CompanyForm = {
  companyName: string;
  cnpj: string;
  tradeName: string;
  phone: string;
  email: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
};

type CreditForm = {
  segmentId: string;
  creditProductId: string;
  requestedAmount: string;
  hasGuarantees: boolean;
  isJudicialRecovery: boolean;
};

export function ClientDetail({ client, segmentName, productName, segments, products }: ClientDetailProps) {
  const router = useRouter();
  const role = useRole();
  const canShowChat = canAccessTab(role, 'chat');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(canShowChat ? 'chat' : 'dados');

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingCredit, setSavingCredit] = useState(false);

  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    companyName: '', cnpj: '', tradeName: '', phone: '', email: '',
    addressStreet: '', addressNumber: '', addressComplement: '',
    addressNeighborhood: '', addressCity: '', addressState: '', addressZip: '',
  });

  const [creditForm, setCreditForm] = useState<CreditForm>({
    segmentId: '', creditProductId: '', requestedAmount: '', hasGuarantees: false, isJudicialRecovery: false,
  });
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [canSubmitResult, setCanSubmitResult] = useState<CanSubmitResult>({
    canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSubmitForAnalysis = ['draft', 'pending_documents', 'document_issues'].includes(client.status);
  const statusMessage = getStatusMessage(client.status);
  const isPulsing = PULSING_STATUSES.has(client.status);

  const CHECKLIST_POLLING_INTERVAL_MS = 3_000;
  const CHECKLIST_PROCESSING_STATUSES = new Set(['uploaded', 'validating']);

  const fetchChecklistData = useCallback(async () => {
    const [checklistRes, canSubmitRes] = await Promise.all([
      api.get<DocumentChecklistItem[]>(`/clients/${client.id}/documents/checklist`),
      api.get<CanSubmitResult>(`/clients/${client.id}/documents/can-submit`),
    ]);
    setChecklist(checklistRes.data ?? []);
    setCanSubmitResult(canSubmitRes.data ?? { canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [] });
  }, [client.id]);

  const loadChecklist = useCallback(async () => {
    setLoadingDocs(true);
    setChecklistError(null);
    try {
      await fetchChecklistData();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar checklist de documentos';
      setChecklistError(message);
      toast.error(message);
    } finally {
      setLoadingDocs(false);
    }
  }, [fetchChecklistData]);

  const silentRefreshChecklist = useCallback(async () => {
    try {
      await fetchChecklistData();
    } catch {
      // Silently ignore polling errors
    }
  }, [fetchChecklistData]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  useEffect(() => {
    const hasProcessing = checklist.some((item) => CHECKLIST_PROCESSING_STATUSES.has(item.status));

    if (hasProcessing) {
      pollingRef.current = setInterval(silentRefreshChecklist, CHECKLIST_POLLING_INTERVAL_MS);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist, silentRefreshChecklist]);

  async function handleSubmitForAnalysis() {
    setSubmitting(true);
    try {
      await api.post(`/clients/${client.id}/submit`);
      toast.success('Cliente enviado para análise');
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar para análise';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function openCompanyEdit() {
    setCompanyForm({
      companyName: client.companyName,
      cnpj: client.cnpj,
      tradeName: client.tradeName ?? '',
      phone: client.phone,
      email: client.email,
      addressStreet: client.addressStreet ?? '',
      addressNumber: client.addressNumber ?? '',
      addressComplement: client.addressComplement ?? '',
      addressNeighborhood: client.addressNeighborhood ?? '',
      addressCity: client.addressCity ?? '',
      addressState: client.addressState ?? '',
      addressZip: client.addressZip ?? '',
    });
    setCompanyDialogOpen(true);
  }

  function openCreditEdit() {
    setCreditForm({
      segmentId: client.segmentId,
      creditProductId: client.creditProductId,
      requestedAmount: client.requestedAmount ?? '',
      hasGuarantees: client.hasGuarantees,
      isJudicialRecovery: client.isJudicialRecovery,
    });
    setCreditDialogOpen(true);
  }

  async function handleSaveCompany() {
    setSavingCompany(true);
    try {
      await api.patch(`/clients/${client.id}`, {
        companyName: companyForm.companyName,
        tradeName: companyForm.tradeName || undefined,
        phone: companyForm.phone,
        email: companyForm.email,
        addressStreet: companyForm.addressStreet || undefined,
        addressNumber: companyForm.addressNumber || undefined,
        addressComplement: companyForm.addressComplement || undefined,
        addressNeighborhood: companyForm.addressNeighborhood || undefined,
        addressCity: companyForm.addressCity || undefined,
        addressState: companyForm.addressState || undefined,
        addressZip: companyForm.addressZip || undefined,
      });
      toast.success('Informações atualizadas');
      setCompanyDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar informações');
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleSaveCredit() {
    setSavingCredit(true);
    try {
      await api.patch(`/clients/${client.id}`, {
        segmentId: creditForm.segmentId,
        creditProductId: creditForm.creditProductId,
        requestedAmount: creditForm.requestedAmount ? Number(creditForm.requestedAmount) : undefined,
        hasGuarantees: creditForm.hasGuarantees,
        isJudicialRecovery: creditForm.isJudicialRecovery,
      });
      toast.success('Operação de crédito atualizada');
      setCreditDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar operação de crédito');
    } finally {
      setSavingCredit(false);
    }
  }

  const address = [
    client.addressStreet,
    client.addressNumber ? `nº ${client.addressNumber}` : null,
    client.addressComplement,
    client.addressCity,
    client.addressState,
    client.addressZip,
  ]
    .filter(Boolean)
    .join(', ');

  function renderChecklistContent() {
    if (loadingDocs) {
      return (
        <div className="space-y-4">
          {['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((k) => (
            <Skeleton key={k} className="h-14 w-full" />
          ))}
        </div>
      );
    }
    if (checklistError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <XCircle className="h-10 w-10 text-destructive/60" />
          <p className="text-sm text-destructive font-medium">{checklistError}</p>
          <Button variant="outline" size="sm" onClick={loadChecklist}>
            Tentar novamente
          </Button>
        </div>
      );
    }
    if (checklist.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nenhum documento configurado para este segmento/produto.
          </p>
          <p className="text-xs text-muted-foreground">
            Contate o administrador para configurar os templates de documentos.
          </p>
        </div>
      );
    }
    return (
      <DocumentChecklist
        clientId={client.id}
        checklist={checklist}
        canSubmitResult={canSubmitResult}
        onRefresh={loadChecklist}
        onSilentRefresh={silentRefreshChecklist}
        onSubmit={handleSubmitForAnalysis}
        submitting={submitting}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Company Header ─────────────────────────────────────── */}
      <FadeIn yOffset={6}>
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-normal tracking-tight leading-tight">
              {client.companyName}
            </h1>
            {client.tradeName && (
              <p className="text-sm text-muted-foreground mt-0.5">{client.tradeName}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 rounded-md px-2 py-0.5">
              {formatCnpj(client.cnpj)}
            </span>
            {segmentName !== '—' && (
              <span className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
                {segmentName}
              </span>
            )}
            {productName !== '—' && (
              <span className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
                {productName}
              </span>
            )}
            <Badge
              variant={getStatusColor(client.status)}
              className={`text-xs px-2.5 py-0.5 ${isPulsing ? 'animate-pulse' : ''}`}
            >
              {getStatusLabel(client.status)}
            </Badge>
          </div>

          {canSubmitForAnalysis && (
            <Button
              onClick={handleSubmitForAnalysis}
              disabled={!canSubmitResult.canSubmit || submitting}
              size="sm"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Enviar para Análise
            </Button>
          )}
        </div>

        {statusMessage && (
          <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
            {statusMessage}
          </p>
        )}
      </FadeIn>

      {/* ─── Tabs ────────────────────────────────────────────────── */}
      <FadeIn delay={0.2} yOffset={4}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1 rounded-lg h-auto flex-wrap gap-0.5">
            {canShowChat && (
              <TabsTrigger value="chat" className="rounded-md text-xs">Chat</TabsTrigger>
            )}
            <TabsTrigger value="dados" className="rounded-md text-xs">Dados</TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-md text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="bureau" className="rounded-md text-xs">Bureau</TabsTrigger>
            <TabsTrigger value="documentos" className="rounded-md text-xs">Documentos</TabsTrigger>
            <TabsTrigger value="contas" className="rounded-md text-xs">Contas Bancárias</TabsTrigger>
          </TabsList>

          {/* Chat */}
          {canShowChat && (
            <TabsContent value="chat" className="mt-5">
              <AnimatedTabContent key="chat">
                <ClientChatTab clientId={client.id} />
              </AnimatedTabContent>
            </TabsContent>
          )}

          {/* Dados */}
          <TabsContent value="dados" className="space-y-6 mt-5">
            <AnimatedTabContent key="dados">
              <div className="space-y-6">
                {/* Sócios */}
                <PartnerSection clientId={client.id} foundedAt={client.foundedAt ?? client.establishedAt ?? null} />

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 size={15} className="text-primary" />
                        Informações da Empresa
                      </CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={openCompanyEdit}>
                        <Pencil size={14} />
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <InfoField label="CNPJ" value={formatCnpj(client.cnpj)} />
                      <InfoField label="Razão Social" value={client.companyName} />
                      <InfoField label="Nome Fantasia" value={client.tradeName} />
                      <InfoField label="Telefone" value={client.phone} />
                      <InfoField label="Email" value={client.email} />
                      <InfoField label="Endereço" value={address || null} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CreditCard size={15} className="text-primary" />
                        Operação de Crédito
                      </CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={openCreditEdit}>
                        <Pencil size={14} />
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <InfoField label="Segmento" value={segmentName} />
                      <InfoField label="Produto" value={productName} />
                      <InfoField label="Valor Pretendido" value={formatCurrency(client.requestedAmount)} />
                      <InfoField label="Valor Aprovado" value={formatCurrency(client.approvedAmount)} />
                      <InfoField label="Recuperação Judicial" value={client.isJudicialRecovery ? 'Sim' : 'Não'} />
                      <InfoField label="Garantias" value={client.hasGuarantees ? 'Sim' : 'Não'} />
                    </div>
                  </CardContent>
                </Card>

                <ClientContactsTab clientId={client.id} />

                <ClientAddressesTab clientId={client.id} />

                <Card className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <InfoField label="Criado em" value={formatDate(client.createdAt)} />
                      <InfoField label="Atualizado em" value={formatDate(client.updatedAt)} />
                      <InfoField label="Enviado em" value={formatDate(client.submittedAt)} />
                      <InfoField label="Aprovado em" value={formatDate(client.approvedAt)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedTabContent>
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="space-y-6 mt-5">
            <AnimatedTabContent key="financeiro">
              <FatureamentoSectionWrapper clientId={client.id} />
            </AnimatedTabContent>
          </TabsContent>

          {/* Bureau */}
          <TabsContent value="bureau" className="mt-5">
            <AnimatedTabContent key="bureau">
              <ClientCreditAnalysisTab clientId={client.id} />
            </AnimatedTabContent>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documentos" className="mt-5">
            <AnimatedTabContent key="documentos">
              <Card>
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText size={15} className="text-primary" />
                    Checklist de Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChecklistContent()}
                </CardContent>
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Contas */}
          <TabsContent value="contas" className="mt-5">
            <ClientBankAccountsTab clientId={client.id} />
          </TabsContent>

        </Tabs>
      </FadeIn>

      {/* Dialog: Editar Informações da Empresa */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Informações da Empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-muted-foreground">CNPJ</Label>
                <Input value={formatCnpj(client.cnpj)} disabled className="font-mono bg-muted/50" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Razão Social</Label>
                <Input
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, companyName: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={companyForm.tradeName}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, tradeName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Endereço</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input
                    value={companyForm.addressStreet}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressStreet: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={companyForm.addressNumber}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={companyForm.addressComplement}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressComplement: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={companyForm.addressNeighborhood}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressNeighborhood: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={companyForm.addressCity}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressCity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input
                    maxLength={2}
                    value={companyForm.addressState}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressState: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={companyForm.addressZip}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, addressZip: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCompany} disabled={savingCompany}>
              {savingCompany && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Operação de Crédito */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Operação de Crédito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select value={creditForm.segmentId} onValueChange={(v) => setCreditForm((p) => ({ ...p, segmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o segmento" /></SelectTrigger>
                <SelectContent>
                  {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Produto de Crédito</Label>
              <Select value={creditForm.creditProductId} onValueChange={(v) => setCreditForm((p) => ({ ...p, creditProductId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor Pretendido (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={creditForm.requestedAmount}
                onChange={(e) => setCreditForm((p) => ({ ...p, requestedAmount: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Recuperação Judicial</Label>
              <Switch
                checked={creditForm.isJudicialRecovery}
                onCheckedChange={(v) => setCreditForm((p) => ({ ...p, isJudicialRecovery: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Garantias</Label>
              <Switch
                checked={creditForm.hasGuarantees}
                onCheckedChange={(v) => setCreditForm((p) => ({ ...p, hasGuarantees: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCredit} disabled={savingCredit}>
              {savingCredit && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Thin wrapper to avoid naming collision with the section label divider
function FatureamentoSectionWrapper({ clientId }: Readonly<{ clientId: string }>) {
  return <FaturamentoSection clientId={clientId} />;
}

// Export SectionDivider for potential reuse
export { SectionDivider };
