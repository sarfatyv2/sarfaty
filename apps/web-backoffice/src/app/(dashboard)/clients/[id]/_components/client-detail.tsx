'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from '@nexus/ui';
import { Loader2, Send, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import {
  getStatusLabel,
  getStatusColor,
  getStatusMessage,
} from '@nexus/utils';
import type { DocumentChecklistItem, CanSubmitResult } from '@nexus/types';
import { DocumentChecklist } from '../../new/_components/document-checklist';

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
  status: string;
  assignedTo: string;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface ClientDetailProps {
  client: ClientData;
  segmentName: string;
  productName: string;
}

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

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  );
}

export function ClientDetail({ client, segmentName, productName }: ClientDetailProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [canSubmitResult, setCanSubmitResult] = useState<CanSubmitResult>({
    canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const canSubmitForAnalysis = ['draft', 'pending_documents', 'document_issues'].includes(client.status);
  const statusMessage = getStatusMessage(client.status);

  const loadChecklist = useCallback(async () => {
    setLoadingDocs(true);
    setChecklistError(null);
    try {
      const [checklistRes, canSubmitRes] = await Promise.all([
        api.get<DocumentChecklistItem[]>(`/clients/${client.id}/documents/checklist`),
        api.get<CanSubmitResult>(`/clients/${client.id}/documents/can-submit`),
      ]);
      setChecklist(checklistRes.data ?? []);
      setCanSubmitResult(canSubmitRes.data ?? { canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [] });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar checklist de documentos';
      setChecklistError(message);
      toast.error(message);
    } finally {
      setLoadingDocs(false);
    }
  }, [client.id]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

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

  const address = [
    client.addressStreet,
    client.addressNumber ? `nº ${client.addressNumber}` : null,
    client.addressComplement,
    client.addressNeighborhood,
    client.addressCity,
    client.addressState,
    client.addressZip,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{client.companyName}</h2>
          {client.tradeName && (
            <p className="text-sm text-muted-foreground">{client.tradeName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusColor(client.status)} className="text-sm px-3 py-1">
            {getStatusLabel(client.status)}
          </Badge>
          {canSubmitForAnalysis && (
            <Button onClick={handleSubmitForAnalysis} disabled={!canSubmitResult.canSubmit || submitting}>
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar para Análise
            </Button>
          )}
        </div>
      </div>

      {statusMessage && (
        <p className="text-sm text-muted-foreground italic">{statusMessage}</p>
      )}

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações da Empresa</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operação de Crédito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <InfoField label="Segmento" value={segmentName} />
                <InfoField label="Produto" value={productName} />
                <InfoField label="Valor Pretendido" value={formatCurrency(client.requestedAmount)} />
                <InfoField label="Valor Aprovado" value={formatCurrency(client.approvedAmount)} />
                <InfoField
                  label="Recuperação Judicial"
                  value={client.isJudicialRecovery ? 'Sim' : 'Não'}
                />
                <InfoField
                  label="Garantias"
                  value={client.hasGuarantees ? 'Sim' : 'Não'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <InfoField label="Criado em" value={formatDate(client.createdAt)} />
                <InfoField label="Atualizado em" value={formatDate(client.updatedAt)} />
                <InfoField label="Enviado em" value={formatDate(client.submittedAt)} />
                <InfoField label="Aprovado em" value={formatDate(client.approvedAt)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDocs ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map(() => (
                    <Skeleton key={crypto.randomUUID()} className="h-14 w-full" />
                  ))}
                </div>
              ) : checklistError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <XCircle className="h-10 w-10 text-destructive/60" />
                  <p className="text-sm text-destructive font-medium">{checklistError}</p>
                  <Button variant="outline" size="sm" onClick={loadChecklist}>
                    Tentar novamente
                  </Button>
                </div>
              ) : checklist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <FileText className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum documento configurado para este segmento/produto.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contate o administrador para configurar os templates de documentos.
                  </p>
                </div>
              ) : (
                <DocumentChecklist
                  clientId={client.id}
                  checklist={checklist}
                  canSubmitResult={canSubmitResult}
                  onRefresh={loadChecklist}
                  onSubmit={handleSubmitForAnalysis}
                  submitting={submitting}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
