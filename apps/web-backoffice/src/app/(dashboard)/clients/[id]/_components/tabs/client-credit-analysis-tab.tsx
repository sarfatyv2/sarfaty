'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button, ScrollArea } from '@nexus/ui';
import { FileText, XCircle, Code2, Building2, MapPin, Activity, Leaf, Users, FileBarChart, Loader2, Download, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';

interface VaduPersonResult {
  id: string;
  authorizedPersonId: string | null;
  cpf: string;
  name: string | null;
  birthDate: string | null;
  motherName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduCompanyResult {
  id: string;
  cnpj: string;
  companyName: string | null;
  tradeName: string | null;
  revenueStatus: string | null;
  revenueStatusDate: string | null;
  specialStatus: string | null;
  capitalSocial: string | null;
  legalNature: string | null;
  isSimplesNacional: boolean | null;
  companySize: string | null;
  environmentalScore: number | null;
  environmentalLevel: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduResultsOutput {
  company: VaduCompanyResult | null;
  persons: VaduPersonResult[];
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function InfoField({ label, value, valueNode }: { label: string; value?: string | null | boolean | number; valueNode?: React.ReactNode }) {
  const displayValue = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : (value || '—');
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {valueNode ? (
        <div>{valueNode}</div>
      ) : (
        <p className="text-sm font-medium leading-none">{displayValue}</p>
      )}
    </div>
  );
}

function StatusBadge({ value, type }: { value: string | null | undefined, type: 'success' | 'danger' | 'warning' | 'neutral' }) {
  if (!value) return <span className="text-sm font-medium">—</span>;
  
  const colors = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  };

  return (
    <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5`}>
      {value}
    </Badge>
  );
}

function getRevenueStatusType(status: string | null | undefined): 'success' | 'danger' | 'warning' | 'neutral' {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (s === 'ATIVA') return 'success';
  if (s === 'INATIVA' || s === 'BAIXADA' || s === 'SUSPENSA' || s === 'INAPTA') return 'danger';
  return 'neutral';
}

function getEnvironmentalStatusType(level: string | null | undefined): 'success' | 'danger' | 'warning' | 'neutral' {
  if (!level) return 'neutral';
  const l = level.toLowerCase();
  if (l.includes('sem risco') || l.includes('baixo')) return 'success';
  if (l.includes('alto') || l.includes('crítico')) return 'danger';
  if (l.includes('médio')) return 'warning';
  return 'neutral';
}

interface CreditboxReport {
  id: string;
  clientId: string;
  processId: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportJson: any | null;
  pdfBase64: string | null;
  errorMessage: string | null;
  requestedAt: string;
  completedAt: string | null;
}

export function ClientCreditAnalysisTab({ clientId }: { clientId: string }) {
  const [data, setData] = useState<VaduResultsOutput | null>(null);
  const [creditbox, setCreditbox] = useState<CreditboxReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState<Record<string, boolean>>({});
  
  const [isRequestingCreditbox, setIsRequestingCreditbox] = useState(false);
  const [vaduExpanded, setVaduExpanded] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaduRes, cbRes] = await Promise.all([
        api.get<VaduResultsOutput>(`/clients/${clientId}/credit-analysis/vadu-results`),
        api.get<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`),
      ]);
      setData(vaduRes.data || { company: null, persons: [] });
      setCreditbox(cbRes.data || null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar análise de crédito';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pollCreditbox = useCallback(async () => {
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox/sync`);
      if (res.data) {
        setCreditbox(res.data);
        if (res.data.status === 'COMPLETED' || res.data.status === 'ERROR') {
          if (pollingRef.current) clearInterval(pollingRef.current);
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
      if (!pollingRef.current) {
        pollingRef.current = setInterval(pollCreditbox, 5000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [creditbox?.status, pollCreditbox]);

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
      const fileName = `creditbox_${clientId}_${formatDate(creditbox.completedAt).replace(/\//g, '-')}.pdf`;

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

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

  if (!data || (!data.company && data.persons.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nenhuma análise de crédito encontrada para este cliente.
        </p>
        <p className="text-xs text-muted-foreground">
          A análise será solicitada automaticamente no envio dos documentos.
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between px-8 py-5 cursor-pointer"
        onClick={() => setVaduExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVaduExpanded((v) => !v); } }}
      >
        <div className="flex items-center gap-3">
          <Shield size={15} className="text-primary" />
          <span className="text-sm font-medium">VADU</span>
          <span className="text-xs text-muted-foreground">Bureau de Crédito</span>
        </div>
        <RotatingChevron isOpen={vaduExpanded} className="text-muted-foreground" />
      </div>

      <ExpandableContent isOpen={vaduExpanded}>
        <div className="px-8 pb-8 space-y-8">
          {/* CreditBox */}
          <Card className={`overflow-hidden ${creditbox?.status === 'ERROR' ? 'border-destructive/30' : ''}`}>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileBarChart size={15} className="text-primary" />
                    <span className="text-sm font-medium">Relatório CreditBox</span>
                  </div>
                  {!creditbox ? (
                    <Button onClick={(e) => { e.stopPropagation(); handleRequestCreditbox(); }} disabled={isRequestingCreditbox} size="sm" className="gap-1.5">
                      {isRequestingCreditbox ? <Loader2 size={12} className="animate-spin" /> : <FileBarChart size={12} />}
                      Gerar Relatório
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {creditbox.status === 'COMPLETED' && creditbox.pdfBase64 && (
                        <Button onClick={handleDownloadPdf} size="sm" className="gap-1.5">
                          <Download size={12} />
                          Baixar PDF
                        </Button>
                      )}
                      {creditbox.status === 'COMPLETED' && (
                        <Button onClick={() => toggleRaw(creditbox.id)} variant="outline" size="sm" className="gap-1.5">
                          <Code2 size={12} />
                          {viewRaw[creditbox.id] ? 'Esconder' : 'JSON'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {!creditbox && (
                  <p className="text-xs text-muted-foreground">
                    Análise profunda com Score, Restritivos, Dívidas PGFN e mais.
                  </p>
                )}

                {creditbox && (creditbox.status === 'PENDING' || creditbox.status === 'PROCESSING') && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Gerando relatório...</p>
                  </div>
                )}

                {creditbox?.status === 'ERROR' && (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <XCircle className="h-6 w-6 text-destructive/60" />
                    <p className="text-sm text-destructive">{creditbox.errorMessage || 'Erro desconhecido'}</p>
                    <Button variant="outline" size="sm" onClick={handleRequestCreditbox} disabled={isRequestingCreditbox}>
                      Tentar Novamente
                    </Button>
                  </div>
                )}

                {creditbox?.status === 'COMPLETED' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <InfoField label="Solicitado em" value={formatDate(creditbox.requestedAt)} />
                      <InfoField label="Concluído em" value={formatDate(creditbox.completedAt)} />
                      {creditbox.reportJson?.gerais?.score && (
                        <InfoField label="Score CreditBox" value={creditbox.reportJson.gerais.score.valor} />
                      )}
                    </div>
                    {viewRaw[creditbox.id] && (
                      <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
                        <pre className="text-xs">{JSON.stringify(creditbox.reportJson, null, 2)}</pre>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Análise da Empresa */}
          {data.company && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Building2 size={15} className="text-primary" />
                  Análise da Empresa
                  <span className="text-xs text-muted-foreground font-normal">
                    Atualizado em {formatDate(data.company.queriedAt)}
                  </span>
                </p>
                <Button variant="outline" size="sm" onClick={() => toggleRaw(data.company?.id ?? '')} className="gap-1.5 h-7 text-xs">
                  <Code2 size={12} />
                  {viewRaw[data.company.id] ? 'Esconder' : 'JSON'}
                </Button>
              </div>

              {viewRaw[data.company.id] && (
                <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
                  <pre className="text-xs">{JSON.stringify(data.company.rawData, null, 2)}</pre>
                </ScrollArea>
              )}

              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 size={15} className="text-primary" />
                      Informações Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <InfoField label="CNPJ" value={formatCnpj(data.company.cnpj)} />
                      <InfoField label="Razão Social" value={data.company.companyName} />
                      <InfoField label="Nome Fantasia" value={data.company.tradeName} />
                      <InfoField label="Capital Social" value={formatCurrency(data.company.capitalSocial)} />
                      <InfoField label="Data de Abertura" value={formatDate(data.company.rawData?.ReceitaAbertura)} />
                      <InfoField label="Tipo (Matriz/Filial)" value={data.company.rawData?.ReceitaTipo} />
                      <InfoField label="Porte" value={data.company.companySize} />
                      <InfoField label="Simples Nacional" valueNode={
                        <StatusBadge
                          value={data.company.isSimplesNacional ? 'Optante' : 'Não Optante'}
                          type={data.company.isSimplesNacional ? 'success' : 'neutral'}
                        />
                      } />
                      <div className="col-span-2">
                        <InfoField label="Natureza Jurídica" value={data.company.legalNature} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity size={15} className="text-primary" />
                      Situação e Atividades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <InfoField label="Situação Receita" valueNode={
                        <StatusBadge
                          value={data.company.revenueStatus}
                          type={getRevenueStatusType(data.company.revenueStatus)}
                        />
                      } />
                      <InfoField label="Data Situação" value={formatDate(data.company.revenueStatusDate)} />
                      <div className="col-span-2">
                        <InfoField label="Situação Especial" valueNode={
                          data.company.specialStatus ? (
                            <StatusBadge value={data.company.specialStatus} type="warning" />
                          ) : (
                            <span className="text-sm">—</span>
                          )
                        } />
                      </div>
                      <div className="col-span-2">
                        <InfoField label="Atividade Principal" value={data.company.rawData?.ReceitaAtividade} />
                      </div>
                      <div className="col-span-2">
                        <InfoField label="Atividade Secundária" value={data.company.rawData?.ReceitaAtividadeSecundaria} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin size={15} className="text-primary" />
                      Contato e Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <InfoField label="Telefone" value={data.company.rawData?.TelefonePrincipal} />
                      <InfoField label="E-mail" value={data.company.rawData?.EmailPrincipal} />
                      <div className="col-span-2">
                        <InfoField label="Endereço Completo" value={
                          [
                            data.company.rawData?.Logradouro,
                            data.company.rawData?.NumeroLogradouro ? `nº ${data.company.rawData?.NumeroLogradouro}` : null,
                            data.company.rawData?.ComplementoEndereco,
                            data.company.rawData?.BairroEndereco,
                            data.company.rawData?.MunicipioEndereco,
                            data.company.rawData?.UfEndereco,
                            data.company.rawData?.CepEnderecoFormatado,
                          ].filter(Boolean).join(', ') || null
                        } />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Leaf size={15} className="text-primary" />
                      Risco Ambiental
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <InfoField label="Nível de Risco" valueNode={
                        <StatusBadge
                          value={data.company.environmentalLevel}
                          type={getEnvironmentalStatusType(data.company.environmentalLevel)}
                        />
                      } />
                      <InfoField label="Score Ambiental" value={data.company.environmentalScore} />
                      {data.company.rawData?.RecursoAmbiental?.potencialidade && (
                        <div className="col-span-2">
                          <InfoField label="Potencialidade" value={data.company.rawData.RecursoAmbiental.potencialidade} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Sócios */}
          {data.persons.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <Users size={15} className="text-primary" />
                Sócios e Pessoas Autorizadas
              </p>

              <div className="space-y-4">
                {data.persons.map((person) => (
                  <Card key={person.id} className="overflow-hidden">
                    <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {person.name || formatCpf(person.cpf)}
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleRaw(person.id)}>
                          <Code2 size={12} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <InfoField label="CPF" value={formatCpf(person.cpf)} />
                          <InfoField label="Nascimento" value={formatDate(person.birthDate)} />
                          <div className="col-span-2">
                            <InfoField label="Nome da Mãe" value={person.motherName} />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Atualizado em {formatDate(person.queriedAt)}
                        </p>
                        {viewRaw[person.id] && (
                          <ScrollArea className="h-48 rounded-lg border bg-muted/30 p-4">
                            <pre className="text-xs">{JSON.stringify(person.rawData, null, 2)}</pre>
                          </ScrollArea>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableContent>
    </Card>
  );
}
