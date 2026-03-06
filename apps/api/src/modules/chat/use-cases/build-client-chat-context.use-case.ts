import { Injectable } from '@nestjs/common';
import { GetClientUseCase } from '../../clients/use-cases/get-client.use-case';
import { GetDocumentChecklistUseCase } from '../../clients/use-cases/get-document-checklist.use-case';
import { CanSubmitUseCase } from '../../clients/use-cases/can-submit.use-case';
import { ListClientContactsUseCase } from '../../clients/use-cases/list-client-contacts.use-case';
import { ListClientAddressesUseCase } from '../../clients/use-cases/list-client-addresses.use-case';
import { GetFaturamentoExtractionUseCase } from '../../clients/use-cases/get-faturamento-extraction.use-case';
import { GetVaduResultsUseCase } from '../../credit/use-cases/get-vadu-results.use-case';
import { GetSerasaReportUseCase } from '../../credit/use-cases/get-serasa-report.use-case';
import { GetCreditboxReportUseCase } from '../../credit/use-cases/get-creditbox-report.use-case';
import { GetComplianceResultsUseCase } from '../../credit/use-cases/get-compliance-results.use-case';
import { SerasaReportMapper } from '../../credit/infra/mappers/serasa-report.mapper';
import { CreditboxReportMapper } from '../../credit/infra/mappers/creditbox-report.mapper';

function formatCnpj(cnpj: string): string {
  const d = cnpj.replaceAll(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDocumentStatus(status: string): string {
  if (status === 'valid') return 'OK';
  if (status === 'missing') return 'Faltando';
  return status;
}

function safeStr(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  return String(v);
}

function buildClientSection(plain: Record<string, unknown>): string[] {
  const cnpjRaw = safeStr(plain.cnpj);
  const cnpjFormatted = cnpjRaw === '—' ? '' : cnpjRaw;
  return [
    '--- DADOS DO CLIENTE ---',
    `Razão Social: ${safeStr(plain.companyName)}`,
    `CNPJ: ${formatCnpj(cnpjFormatted)}`,
    `Nome Fantasia: ${safeStr(plain.tradeName)}`,
    `Status: ${safeStr(plain.status)}`,
    `Telefone: ${safeStr(plain.phone)}`,
    `Email: ${safeStr(plain.email)}`,
    `Valor Solicitado: ${safeStr(plain.requestedAmount)}`,
    `Valor Aprovado: ${safeStr(plain.approvedAmount)}`,
    `Criado em: ${formatDate((plain.createdAt as Date | string | null) ?? null)}`,
    '',
  ];
}

function buildDocumentsSection(
  checklist: Array<{
    documentLabel: string;
    partnerName?: string | null;
    status: string;
    fileName?: string | null;
  }>,
  cs: { totalRequired: number; totalUploaded: number; canSubmit: boolean; missingDocuments: string[] },
): string[] {
  const missingLine = cs.missingDocuments.length > 0 ? [`Documentos faltantes: ${cs.missingDocuments.join(', ')}`] : [];
  const itemLines = checklist.map((item) => {
    const status = getDocumentStatus(item.status);
    const label = item.partnerName ? `${item.documentLabel} (${item.partnerName})` : item.documentLabel;
    const fileSuffix = item.fileName ? ` (${item.fileName})` : '';
    return `- ${label}: ${status}${fileSuffix}`;
  });
  return [
    '--- DOCUMENTOS ---',
    `Total obrigatórios: ${cs.totalRequired}, Enviados: ${cs.totalUploaded}`,
    `Pode enviar para análise: ${cs.canSubmit ? 'Sim' : 'Não'}`,
    ...missingLine,
    ...itemLines,
    '',
  ];
}

function buildContactsSection(
  contacts: Array<{ contactName?: string; useType?: string; phone?: string; phoneMobile?: string; phoneSms?: string; email?: string; whatsapp?: boolean }>,
): string[] {
  const contactLines = contacts.map((c) => {
    const phone = c.phoneMobile || c.phone || c.phoneSms || '—';
    const email = c.email || '—';
    const type = c.useType ?? 'geral';
    const whatsappSuffix = c.whatsapp ? ' [WhatsApp]' : '';
    return `- ${c.contactName ?? '—'} (${type}): ${phone}, ${email}${whatsappSuffix}`;
  });
  return ['--- CONTATOS ---', ...contactLines, ''];
}

function buildAddressesSection(
  addresses: Array<{ street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; zipCode?: string }>,
): string[] {
  const addrLines = addresses.map((a) => {
    const full = [a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zipCode]
      .filter(Boolean)
      .join(', ');
    return `- ${full || '—'}`;
  });
  return ['--- ENDEREÇOS ---', ...addrLines, ''];
}

function buildFaturamentoSection(
  extractions: Array<{
    year: number;
    totalAnnualRevenue?: string | null;
    extractionStatus: string;
    monthlyRevenues?: Record<string, unknown> | null;
  }>,
): string[] {
  const fatLines = extractions.flatMap((f) => {
    const base = `Ano ${f.year}: total ${f.totalAnnualRevenue ?? '—'}, status ${f.extractionStatus}`;
    if (!f.monthlyRevenues) return [base];
    const months = Object.entries(f.monthlyRevenues)
      .filter((entry): entry is [string, number] => entry[1] != null && typeof entry[1] === 'number')
      .map(([k, num]) => `${k}: R$${num}`)
      .join(', ');
    return months ? [base, `  Mensal: ${months}`] : [base];
  });
  return ['--- FATURAMENTO ---', ...fatLines, ''];
}

function buildVaduSection(v: { company: unknown; persons?: unknown[] }): string[] {
  const companyLines =
    v.company && typeof v.company === 'object' && 'companyName' in v.company
      ? (() => {
          const co = v.company as { companyName?: string; revenueStatus?: string; legalNature?: string; isSimplesNacional?: boolean };
          return [
            `Empresa: ${co.companyName ?? '—'}`,
            `Status Receita: ${co.revenueStatus ?? '—'}`,
            `Natureza: ${co.legalNature ?? '—'}`,
            `Simples Nacional: ${co.isSimplesNacional ? 'Sim' : 'Não'}`,
          ];
        })()
      : ['Sem dados de empresa.'];
  const personsLine = v.persons?.length ? [`Sócios/representantes consultados: ${v.persons.length}`] : [];
  return ['--- BUREAU VADU ---', ...companyLines, ...personsLine, ''];
}

function buildSerasaSection(hasReport: boolean, s?: { reportName?: string; statusCode?: number; errorMessage?: string }): string[] {
  let content: string[];
  if (!hasReport) {
    content = ['Sem relatório Serasa.'];
  } else if (s) {
    const statusLine = s.errorMessage ? `Erro: ${s.errorMessage}` : 'Consulta realizada.';
    content = [`Report: ${s.reportName ?? '—'}`, `Status HTTP: ${s.statusCode}`, statusLine];
  } else {
    content = [];
  }
  return ['--- BUREAU SERASA ---', ...content, ''];
}

function buildCreditboxSection(cb: { status: string; errorMessage?: string }): string[] {
  return [
    '--- BUREAU CREDITBOX ---',
    `Status: ${cb.status}`,
    cb.errorMessage ? `Erro: ${cb.errorMessage}` : 'Relatório disponível.',
    '',
  ];
}

function buildComplianceSection(comp: {
  overallRisk: string;
  pendingChecks: string[];
  negativeMedia?: Array<{ riskLevel?: string }>;
}): string[] {
  const pendingLine = comp.pendingChecks.length > 0 ? [`Checagens pendentes: ${comp.pendingChecks.join(', ')}`] : [];
  const latestMedia = comp.negativeMedia?.at(-1);
  const mediaLine = latestMedia ? [`Mídia negativa: ${latestMedia.riskLevel ?? '—'}`] : [];
  return [
    '--- COMPLIANCE ---',
    `Risco geral: ${comp.overallRisk}`,
    ...pendingLine,
    ...mediaLine,
    '',
  ];
}

@Injectable()
export class BuildClientChatContextUseCase {
  constructor(
    private readonly getClient: GetClientUseCase,
    private readonly getChecklist: GetDocumentChecklistUseCase,
    private readonly canSubmit: CanSubmitUseCase,
    private readonly listContacts: ListClientContactsUseCase,
    private readonly listAddresses: ListClientAddressesUseCase,
    private readonly getFaturamento: GetFaturamentoExtractionUseCase,
    private readonly getVadu: GetVaduResultsUseCase,
    private readonly getSerasa: GetSerasaReportUseCase,
    private readonly getCreditbox: GetCreditboxReportUseCase,
    private readonly getCompliance: GetComplianceResultsUseCase,
  ) {}

  async execute(clientId: string): Promise<string> {
    const results = await this.fetchAllData(clientId);
    const sections = this.buildSectionsFromResults(results);
    return sections.flat().join('\n');
  }

  private async fetchAllData(clientId: string): Promise<PromiseSettledResult<unknown>[]> {
    return Promise.allSettled([
      this.getClient.execute(clientId),
      this.getChecklist.execute(clientId),
      this.canSubmit.execute(clientId),
      this.listContacts.execute(clientId),
      this.listAddresses.execute(clientId),
      this.getFaturamento.getByClient(clientId),
      this.getVadu.execute(clientId),
      this.getSerasa.execute(clientId),
      this.getCreditbox.execute(clientId),
      this.getCompliance.execute(clientId),
    ]);
  }

  private buildSectionsFromResults(results: PromiseSettledResult<unknown>[]): string[][] {
    const sections: string[][] = [];
    this.tryAddClientSection(results[0], sections);
    this.tryAddDocumentsSection(results[1], results[2], sections);
    this.tryAddContactsSection(results[3], sections);
    this.tryAddAddressesSection(results[4], sections);
    this.tryAddFaturamentoSection(results[5], sections);
    this.tryAddVaduSection(results[6], sections);
    this.tryAddSerasaSection(results[7], sections);
    this.tryAddCreditboxSection(results[8], sections);
    this.tryAddComplianceSection(results[9], sections);
    return sections;
  }

  private tryAddClientSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const client = result.value;
    if (client && typeof client === 'object' && 'toPlainObject' in client) {
      const plain = (client as { toPlainObject: () => Record<string, unknown> }).toPlainObject();
      sections.push(buildClientSection(plain));
    }
  }

  private tryAddDocumentsSection(
    checklistResult: PromiseSettledResult<unknown> | undefined,
    canSubmitResult: PromiseSettledResult<unknown> | undefined,
    sections: string[][],
  ): void {
    if (checklistResult?.status !== 'fulfilled' || canSubmitResult?.status !== 'fulfilled') return;
    sections.push(
      buildDocumentsSection(
        checklistResult.value as Parameters<typeof buildDocumentsSection>[0],
        canSubmitResult.value as Parameters<typeof buildDocumentsSection>[1],
      ),
    );
  }

  private tryAddContactsSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const contacts = result.value as unknown[];
    if (contacts.length > 0) {
      sections.push(buildContactsSection(contacts as Parameters<typeof buildContactsSection>[0]));
    }
  }

  private tryAddAddressesSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const addresses = result.value as unknown[];
    if (addresses.length > 0) {
      sections.push(buildAddressesSection(addresses as Parameters<typeof buildAddressesSection>[0]));
    }
  }

  private tryAddFaturamentoSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const fat = result.value as Array<{ year: number; totalAnnualRevenue?: string | null; extractionStatus: string; monthlyRevenues?: unknown }>;
    if (fat.length === 0) return;
    const extractions = fat.map((f) => ({
      year: f.year,
      totalAnnualRevenue: f.totalAnnualRevenue,
      extractionStatus: f.extractionStatus,
      monthlyRevenues: (f.monthlyRevenues ?? undefined) as Record<string, unknown> | null | undefined,
    }));
    sections.push(buildFaturamentoSection(extractions));
  }

  private tryAddVaduSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    sections.push(buildVaduSection(result.value as Parameters<typeof buildVaduSection>[0]));
  }

  private tryAddSerasaSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const s = result.value;
    const hasReport = !!s;
    const persistence = s ? SerasaReportMapper.toPersistence(s as Parameters<typeof SerasaReportMapper.toPersistence>[0]) : undefined;
    sections.push(buildSerasaSection(hasReport, persistence));
  }

  private tryAddCreditboxSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    const value = result.value;
    if (!value) return;
    const cb = CreditboxReportMapper.toPersistence(value as Parameters<typeof CreditboxReportMapper.toPersistence>[0]);
    sections.push(buildCreditboxSection(cb));
  }

  private tryAddComplianceSection(result: PromiseSettledResult<unknown> | undefined, sections: string[][]): void {
    if (result?.status !== 'fulfilled') return;
    sections.push(buildComplianceSection(result.value as Parameters<typeof buildComplianceSection>[0]));
  }
}
