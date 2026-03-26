'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, ScrollArea } from '@nexus/ui';
import {
  Building2, MapPin, Activity, Leaf, Users, FileBarChart,
  Code2, Loader2, Download, XCircle,
} from 'lucide-react';
import type { VaduResultsOutput, VaduCompanyResult, VaduPersonResult, CreditboxReport } from './credit-analysis.types';
import { formatDate, formatCurrency, formatCnpj, formatCpf, getRevenueStatusType, getEnvironmentalStatusType } from './credit-analysis.utils';
import { StatusBadge, InfoField } from './credit-analysis.ui';

// ─── CreditboxCard ────────────────────────────────────────────────────────────

function CreditboxCard({ creditbox, viewRaw, toggleRaw, isRequestingCreditbox, handleRequestCreditbox, handleDownloadPdf }: Readonly<{
  creditbox: CreditboxReport | null;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  isRequestingCreditbox: boolean;
  handleRequestCreditbox: () => void;
  handleDownloadPdf: () => void;
}>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportJson = creditbox?.reportJson as any;
  return (
    <Card className={`overflow-hidden ${creditbox?.status === 'ERROR' ? 'border-destructive/30' : ''}`}>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileBarChart size={15} className="text-primary" />
              <span className="text-sm font-medium">Relatório CreditBox</span>
            </div>
            {creditbox ? (
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
            ) : (
              <Button
                onClick={(e) => { e.stopPropagation(); handleRequestCreditbox(); }}
                disabled={isRequestingCreditbox}
                size="sm"
                className="gap-1.5"
              >
                {isRequestingCreditbox ? <Loader2 size={12} className="animate-spin" /> : <FileBarChart size={12} />}
                Gerar Relatório
              </Button>
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
                {reportJson?.gerais?.score && (
                  <InfoField label="Score CreditBox" value={reportJson.gerais.score.valor} />
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
  );
}

// ─── CompanyAnalysis ──────────────────────────────────────────────────────────

function CompanyAnalysis({ company, viewRaw, toggleRaw }: Readonly<{
  company: VaduCompanyResult;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
          <Building2 size={15} className="text-primary" />
          Análise da Empresa
          <span className="text-xs text-muted-foreground font-normal">
            Atualizado em {formatDate(company.queriedAt)}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={() => toggleRaw(company.id)} className="gap-1.5 h-7 text-xs">
          <Code2 size={12} />
          {viewRaw[company.id] ? 'Esconder' : 'JSON'}
        </Button>
      </div>

      {viewRaw[company.id] && (
        <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
          <pre className="text-xs">{JSON.stringify(company.rawData, null, 2)}</pre>
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
              <InfoField label="CNPJ" value={formatCnpj(company.cnpj)} />
              <InfoField label="Razão Social" value={company.companyName} />
              <InfoField label="Nome Fantasia" value={company.tradeName} />
              <InfoField label="Capital Social" value={formatCurrency(company.capitalSocial)} />
              <InfoField label="Data de Abertura" value={formatDate(company.rawData?.ReceitaAbertura)} />
              <InfoField label="Tipo (Matriz/Filial)" value={company.rawData?.ReceitaTipo} />
              <InfoField label="Porte" value={company.companySize} />
              <InfoField label="Simples Nacional" valueNode={
                <StatusBadge
                  value={company.isSimplesNacional ? 'Optante' : 'Não Optante'}
                  type={company.isSimplesNacional ? 'success' : 'neutral'}
                />
              } />
              <div className="col-span-2">
                <InfoField label="Natureza Jurídica" value={company.legalNature} />
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
                <StatusBadge value={company.revenueStatus} type={getRevenueStatusType(company.revenueStatus)} />
              } />
              <InfoField label="Data Situação" value={formatDate(company.revenueStatusDate)} />
              <div className="col-span-2">
                <InfoField label="Situação Especial" valueNode={
                  company.specialStatus
                    ? <StatusBadge value={company.specialStatus} type="warning" />
                    : <span className="text-sm">—</span>
                } />
              </div>
              <div className="col-span-2">
                <InfoField label="Atividade Principal" value={company.rawData?.ReceitaAtividade} />
              </div>
              <div className="col-span-2">
                <InfoField label="Atividade Secundária" value={company.rawData?.ReceitaAtividadeSecundaria} />
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
              <InfoField label="Telefone" value={company.rawData?.TelefonePrincipal} />
              <InfoField label="E-mail" value={company.rawData?.EmailPrincipal} />
              <div className="col-span-2">
                <InfoField label="Endereço Completo" value={
                  [
                    company.rawData?.Logradouro,
                    company.rawData?.NumeroLogradouro ? `nº ${company.rawData?.NumeroLogradouro}` : null,
                    company.rawData?.ComplementoEndereco,
                    company.rawData?.BairroEndereco,
                    company.rawData?.MunicipioEndereco,
                    company.rawData?.UfEndereco,
                    company.rawData?.CepEnderecoFormatado,
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
                <StatusBadge value={company.environmentalLevel} type={getEnvironmentalStatusType(company.environmentalLevel)} />
              } />
              <InfoField label="Score Ambiental" value={company.environmentalScore} />
              {company.rawData?.RecursoAmbiental?.potencialidade && (
                <div className="col-span-2">
                  <InfoField label="Potencialidade" value={company.rawData.RecursoAmbiental.potencialidade} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── PersonsList ──────────────────────────────────────────────────────────────

function PersonsList({ persons, viewRaw, toggleRaw }: Readonly<{
  persons: VaduPersonResult[];
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium flex items-center gap-2">
        <Users size={15} className="text-primary" />
        Sócios e Pessoas Autorizadas
      </p>
      <div className="space-y-4">
        {persons.map((person) => (
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
  );
}

// ─── VaduSection (exported) ───────────────────────────────────────────────────

export function VaduSection({ data, creditbox, viewRaw, toggleRaw, isRequestingCreditbox, handleRequestCreditbox, handleDownloadPdf }: Readonly<{
  data: VaduResultsOutput;
  creditbox: CreditboxReport | null;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  isRequestingCreditbox: boolean;
  handleRequestCreditbox: () => void;
  handleDownloadPdf: () => void;
}>) {
  return (
    <div className="px-8 pb-8 space-y-8">
      <CreditboxCard
        creditbox={creditbox}
        viewRaw={viewRaw}
        toggleRaw={toggleRaw}
        isRequestingCreditbox={isRequestingCreditbox}
        handleRequestCreditbox={handleRequestCreditbox}
        handleDownloadPdf={handleDownloadPdf}
      />
      {data.company && <CompanyAnalysis company={data.company} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
      {data.persons.length > 0 && <PersonsList persons={data.persons} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
    </div>
  );
}
