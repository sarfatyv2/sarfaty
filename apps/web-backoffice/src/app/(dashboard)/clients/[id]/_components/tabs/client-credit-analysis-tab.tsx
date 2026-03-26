'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Skeleton, Badge, Button } from '@nexus/ui';
import {
  FileText, XCircle, Shield, Scale, Search, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent } from '../motion-wrapper';
import { AllcheckSection } from './allcheck-section';
import { UpminerSection } from './upminer-section';

import type { VaduResultsOutput, CreditboxReport, SerasaReportData } from './credit-analysis.types';
import { formatDate } from './credit-analysis.utils';
import { ExpandableHeader, InfoField } from './credit-analysis.ui';
import { SerasaSection, SerasaScoreBadge } from './credit-analysis.serasa';
import { VaduSection } from './credit-analysis.vadu';
import { ComplianceSection, RiskBadge, AddressValidationBadge, useCompliancePolling } from './credit-analysis.compliance';

// ─── Re-exports for consumers ─────────────────────────────────────────────────

export { ExpandableHeader } from './credit-analysis.ui';
export { SerasaSection, SerasaScoreBadge } from './credit-analysis.serasa';
export { ComplianceSection, RiskBadge } from './credit-analysis.compliance';

// ─── ClientCreditAnalysisTab ──────────────────────────────────────────────────

export function ClientCreditAnalysisTab({ clientId }: Readonly<{ clientId: string }>) {
  const [data, setData] = useState<VaduResultsOutput | null>(null);
  const [creditbox, setCreditbox] = useState<CreditboxReport | null>(null);
  const [serasa, setSerasa] = useState<SerasaReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState<Record<string, boolean>>({});

  const [isRequestingCreditbox, setIsRequestingCreditbox] = useState(false);
  const [isRequestingSerasa, setIsRequestingSerasa] = useState(false);
  const [vaduExpanded, setVaduExpanded] = useState(false);
  const [serasaExpanded, setSerasaExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const creditboxPollingRef = useRef<NodeJS.Timeout | null>(null);

  const { compliance, isPolling: isCompliancePolling, load: loadCompliance } = useCompliancePolling(clientId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaduRes, cbRes, , serasaRes] = await Promise.all([
        api.get<VaduResultsOutput>(`/clients/${clientId}/credit-analysis/vadu-results`),
        api.get<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`),
        loadCompliance(),
        api.get<SerasaReportData>(`/clients/${clientId}/credit-analysis/serasa`).catch(() => ({ data: null })),
      ]);
      setData(vaduRes.data || { company: null, persons: [] });
      setCreditbox(cbRes.data || null);
      setSerasa(serasaRes.data || null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar análise de crédito';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clientId, loadCompliance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pollCreditbox = useCallback(async () => {
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox/sync`);
      if (res.data) {
        setCreditbox(res.data);
        if (res.data.status === 'COMPLETED' || res.data.status === 'ERROR') {
          if (creditboxPollingRef.current) clearInterval(creditboxPollingRef.current);
          if (res.data.status === 'COMPLETED') toast.success('Relatório CreditBox gerado com sucesso!');
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error polling CreditBox', err);
    }
  }, [clientId]);

  useEffect(() => {
    if (creditbox && (creditbox.status === 'PENDING' || creditbox.status === 'PROCESSING')) {
      if (!creditboxPollingRef.current) {
        creditboxPollingRef.current = setInterval(pollCreditbox, 5000);
      }
    } else if (creditboxPollingRef.current) {
      clearInterval(creditboxPollingRef.current);
      creditboxPollingRef.current = null;
    }
    return () => {
      if (creditboxPollingRef.current) clearInterval(creditboxPollingRef.current);
    };
  }, [creditbox?.status, pollCreditbox]);

  const handleRequestSerasa = async () => {
    setIsRequestingSerasa(true);
    try {
      const res = await api.post<SerasaReportData>(`/clients/${clientId}/credit-analysis/serasa`);
      setSerasa(res.data);
      if (res.data?.statusCode && res.data.statusCode >= 400) {
        toast.error(res.data.errorMessage || 'Erro na consulta Serasa.');
      } else {
        toast.success('Consulta Serasa realizada com sucesso.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar consulta Serasa';
      toast.error(message);
    } finally {
      setIsRequestingSerasa(false);
    }
  };

  const handleRequestCreditbox = async () => {
    setIsRequestingCreditbox(true);
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`);
      setCreditbox(res.data);
      if (res.data?.status === 'ERROR') {
        toast.error(res.data.errorMessage || 'Erro ao iniciar geração do relatório.');
      } else {
        toast.success('Geração do relatório iniciada.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar relatório CreditBox';
      toast.error(message);
    } finally {
      setIsRequestingCreditbox(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!creditbox?.pdfBase64) return;
    try {
      const linkSource = `data:application/pdf;base64,${creditbox.pdfBase64}`;
      const downloadLink = document.createElement('a');
      const fileName = `creditbox_${clientId}_${formatDate(creditbox.completedAt).replaceAll('/', '-')}.pdf`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    } catch {
      toast.error('Erro ao fazer download do PDF.');
    }
  };

  const toggleRaw = (id: string) => {
    setViewRaw(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <XCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const vaduData = data ?? { company: null, persons: [] };
  const hasLegacyBureauBlock = vaduData.company || vaduData.persons.length > 0 || !!compliance || !!serasa;

  return (
    <div className="space-y-4">
      {!loading && !hasLegacyBureauBlock ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 rounded-lg border border-dashed bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nenhuma análise automática (VADU/Serasa/Compliance) encontrada para este cliente.
          </p>
          <p className="text-xs text-muted-foreground">
            A análise pode ser solicitada no envio dos documentos. Consulte upMiner e Allcheck abaixo.
          </p>
        </div>
      )}

      {/* Serasa Card */}
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Search size={15} className="text-primary" />}
          title="Serasa Experian"
          subtitle="Relatório Avançado PJ"
          badge={serasa?.rawResponse?.optionalFeatures?.score?.score == null
            ? undefined
            : <SerasaScoreBadge score={Number(serasa.rawResponse.optionalFeatures.score.score)} />}
          isOpen={serasaExpanded}
          onToggle={() => setSerasaExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={serasaExpanded}>
          {loading ? (
            <div className="px-8 pb-8 space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
          <SerasaSection
            report={serasa}
            isRequesting={isRequestingSerasa}
            onRequest={handleRequestSerasa}
            viewRaw={viewRaw}
            toggleRaw={toggleRaw}
          />
          )}
        </ExpandableContent>
      </Card>

      {/* VADU Card */}
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Shield size={15} className="text-primary" />}
          title="VADU"
          subtitle="Bureau de Crédito"
          isOpen={vaduExpanded}
          onToggle={() => setVaduExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={vaduExpanded}>
          {loading ? (
            <div className="px-8 pb-8 space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
          <VaduSection
            data={vaduData}
            creditbox={creditbox}
            viewRaw={viewRaw}
            toggleRaw={toggleRaw}
            isRequestingCreditbox={isRequestingCreditbox}
            handleRequestCreditbox={handleRequestCreditbox}
            handleDownloadPdf={handleDownloadPdf}
          />
          )}
        </ExpandableContent>
      </Card>

      {/* Compliance Card */}
      {compliance && (
        <Card className="overflow-hidden">
          <ExpandableHeader
            icon={<Scale size={15} className="text-primary" />}
            title="Compliance"
            subtitle="Consultas Gratuitas"
            badge={
              isCompliancePolling
                ? <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5 animate-pulse">Processando...</Badge>
                : <RiskBadge level={compliance.overallRisk} />
            }
            isOpen={complianceExpanded}
            onToggle={() => setComplianceExpanded((v) => !v)}
          />
          <ExpandableContent isOpen={complianceExpanded}>
            <ComplianceSection
              clientId={clientId}
              compliance={compliance}
              viewRaw={viewRaw}
              toggleRaw={toggleRaw}
              pendingChecks={compliance.pendingChecks}
            />
          </ExpandableContent>
        </Card>
      )}

      {/* Address Validation Card */}
      {compliance?.addressValidation && (
        <Card className="overflow-hidden">
          <ExpandableHeader
            icon={<MapPin size={15} className="text-primary" />}
            title="Validação de Endereço"
            subtitle="ViaCEP"
            badge={<AddressValidationBadge addressValidation={compliance.addressValidation} />}
            isOpen={addressExpanded}
            onToggle={() => setAddressExpanded((v) => !v)}
          />
          <ExpandableContent isOpen={addressExpanded}>
            <div className="px-8 pb-8">
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="CEP" value={compliance.addressValidation.cep} />
                <InfoField label="Logradouro" value={compliance.addressValidation.street} />
                <InfoField label="Bairro" value={compliance.addressValidation.neighborhood} />
                <InfoField label="Cidade" value={compliance.addressValidation.city} />
                <InfoField label="UF" value={compliance.addressValidation.state} />
                <InfoField label="Consultado em" value={formatDate(compliance.addressValidation.queriedAt)} />
              </div>
            </div>
          </ExpandableContent>
        </Card>
      )}

      <UpminerSection clientId={clientId} />

      <AllcheckSection entityId={clientId} entityType="client" />
    </div>
  );
}
