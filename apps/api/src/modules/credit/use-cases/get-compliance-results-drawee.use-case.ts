import { Injectable, Inject, Logger } from '@nestjs/common';
import { DraweeRepository, DRAWEE_REPOSITORY } from '../../drawees/domain/drawee.repository';
import { CguDraweeCheckRepository, CGU_DRAWEE_CHECK_REPOSITORY } from '../domain/cgu-drawee-check.repository';
import { PepDraweeCheckRepository, PEP_DRAWEE_CHECK_REPOSITORY } from '../domain/pep-drawee-check.repository';
import { PgfnDraweeCheckRepository, PGFN_DRAWEE_CHECK_REPOSITORY } from '../domain/pgfn-drawee-check.repository';
import { CndtDraweeCheckRepository, CNDT_DRAWEE_CHECK_REPOSITORY } from '../domain/cndt-drawee-check.repository';
import { AddressValidationDraweeResultRepository, ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY } from '../domain/address-validation-drawee-result.repository';
import { SanctionsDraweeCheckRepository, SANCTIONS_DRAWEE_CHECK_REPOSITORY } from '../domain/sanctions-drawee-check.repository';
import { SlaveLaborDraweeCheckRepository, SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY } from '../domain/slave-labor-drawee-check.repository';
import { NegativeMediaDraweeResultRepository, NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY } from '../domain/negative-media-drawee-result.repository';
import { DigitalPresenceDraweeResultRepository, DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY } from '../domain/digital-presence-drawee-result.repository';
import type { Drawee } from '../../drawees/domain/drawee.entity';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';

export type ComplianceCheckName =
  | 'cgu' | 'pep' | 'pgfn' | 'cndt'
  | 'addressValidation' | 'sanctions' | 'slaveLaborCheck'
  | 'negativeMedia' | 'digitalPresence';

export interface ComplianceDraweeResultsOutput {
  overallRisk: RiskLevel;
  pendingChecks: ComplianceCheckName[];
  cgu: {
    ceis: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: unknown; queriedAt: string | null };
    cnep: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: unknown; queriedAt: string | null };
    cepim: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: unknown; queriedAt: string | null };
  };
  pep: Array<{
    cpf: string;
    personName: string | null;
    hasMatch: boolean;
    matchedRole: string | null;
    matchedOrg: string | null;
    rawData: unknown;
    queriedAt: string | null;
  }>;
  pgfn: {
    hasDebt: boolean;
    totalDebtAmount: number | null;
    debtCount: number;
    summary: string | null;
    rawData: unknown;
    queriedAt: string | null;
  } | null;
  cndt: {
    certificateStatus: string;
    certificateNumber: string | null;
    validUntil: string | null;
    rawData: unknown;
    queriedAt: string | null;
  } | null;
  addressValidation: {
    cep: string | null;
    isValid: boolean;
    street: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    matchesRegistered: boolean | null;
    rawData: unknown;
    queriedAt: string | null;
  } | null;
  sanctions: Array<{
    entityName: string | null;
    source: string;
    hasMatch: boolean;
    matchScore: number | null;
    matchDetails: string | null;
    rawData: unknown;
    queriedAt: string | null;
  }>;
  slaveLaborCheck: {
    hasMatch: boolean;
    employerName: string | null;
    rescuedWorkers: number | null;
    inspectionDate: string | null;
    rawData: unknown;
    queriedAt: string | null;
  } | null;
  negativeMedia: Array<{
    id: string;
    riskLevel: string;
    findingsCount: number;
    findings: Array<Record<string, unknown>>;
    summary: string | null;
    groundingSources: Array<{ uri: string; title: string }>;
    queriedAt: string;
  }>;
  digitalPresence: {
    domain: string | null;
    emailType: string;
    hasDns: boolean;
    hasActiveSite: boolean;
    siteTitle: string | null;
    queriedAt: string | null;
  } | null;
}

@Injectable()
export class GetComplianceResultsDraweeUseCase {
  private readonly logger = new Logger(GetComplianceResultsDraweeUseCase.name);

  constructor(
    @Inject(DRAWEE_REPOSITORY) private readonly draweeRepo: DraweeRepository,
    @Inject(CGU_DRAWEE_CHECK_REPOSITORY) private readonly cguRepo: CguDraweeCheckRepository,
    @Inject(PEP_DRAWEE_CHECK_REPOSITORY) private readonly pepRepo: PepDraweeCheckRepository,
    @Inject(PGFN_DRAWEE_CHECK_REPOSITORY) private readonly pgfnRepo: PgfnDraweeCheckRepository,
    @Inject(CNDT_DRAWEE_CHECK_REPOSITORY) private readonly cndtRepo: CndtDraweeCheckRepository,
    @Inject(ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY) private readonly addressRepo: AddressValidationDraweeResultRepository,
    @Inject(SANCTIONS_DRAWEE_CHECK_REPOSITORY) private readonly sanctionsRepo: SanctionsDraweeCheckRepository,
    @Inject(SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY) private readonly slaveLaborRepo: SlaveLaborDraweeCheckRepository,
    @Inject(NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY) private readonly negativeMediaRepo: NegativeMediaDraweeResultRepository,
    @Inject(DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY) private readonly digitalPresenceRepo: DigitalPresenceDraweeResultRepository,
  ) {}

  async execute(draweeId: string): Promise<ComplianceDraweeResultsOutput> {
    const [
      drawee,
      cguResults,
      pepResults,
      pgfnResult,
      cndtResult,
      addressResults,
      sanctionsResults,
      slaveLaborResult,
      negativeMediaResults,
      digitalPresenceResult,
    ] = await Promise.all([
      this.draweeRepo.findById(draweeId),
      this.cguRepo.getLatestByDraweeId(draweeId),
      this.pepRepo.getLatestByDraweeId(draweeId),
      this.pgfnRepo.getLatestByDraweeId(draweeId),
      this.cndtRepo.getLatestByDraweeId(draweeId),
      this.addressRepo.getLatestByDraweeId(draweeId),
      this.sanctionsRepo.getLatestByDraweeId(draweeId),
      this.slaveLaborRepo.getLatestByDraweeId(draweeId),
      this.negativeMediaRepo.getAllByDraweeId(draweeId),
      this.digitalPresenceRepo.getLatestByDraweeId(draweeId),
    ]);

    const ceisCheck = cguResults.find((r) => r.checkType === 'CEIS');
    const cnepCheck = cguResults.find((r) => r.checkType === 'CNEP');
    const cepimCheck = cguResults.find((r) => r.checkType === 'CEPIM');
    const emptyCguCheck = { hasMatch: false, matchCount: 0, summary: null, rawData: null, queriedAt: null };
    const addressResult = addressResults[0] ?? null;
    const pgfnFirst = Array.isArray(pgfnResult) ? pgfnResult[0] ?? null : pgfnResult;
    const cndtFirst = Array.isArray(cndtResult) ? cndtResult[0] ?? null : cndtResult;
    const slaveLaborFirst = Array.isArray(slaveLaborResult) ? slaveLaborResult[0] ?? null : slaveLaborResult;
    const digitalFirst = Array.isArray(digitalPresenceResult) ? digitalPresenceResult[0] ?? null : digitalPresenceResult;

    const output: ComplianceDraweeResultsOutput = {
      overallRisk: 'PENDING',
      pendingChecks: [],
      cgu: {
        ceis: ceisCheck ? { hasMatch: ceisCheck.hasMatch, matchCount: ceisCheck.matchCount, summary: ceisCheck.summary, rawData: ceisCheck.rawData, queriedAt: ceisCheck.queriedAt.toISOString() } : emptyCguCheck,
        cnep: cnepCheck ? { hasMatch: cnepCheck.hasMatch, matchCount: cnepCheck.matchCount, summary: cnepCheck.summary, rawData: cnepCheck.rawData, queriedAt: cnepCheck.queriedAt.toISOString() } : emptyCguCheck,
        cepim: cepimCheck ? { hasMatch: cepimCheck.hasMatch, matchCount: cepimCheck.matchCount, summary: cepimCheck.summary, rawData: cepimCheck.rawData, queriedAt: cepimCheck.queriedAt.toISOString() } : emptyCguCheck,
      },
      pep: pepResults.map((r) => ({
        cpf: r.cpf ?? '',
        personName: r.personName,
        hasMatch: r.hasMatch,
        matchedRole: r.matchedRole,
        matchedOrg: r.matchedOrg,
        rawData: r.rawData,
        queriedAt: r.queriedAt.toISOString(),
      })),
      pgfn: pgfnFirst
        ? {
            hasDebt: pgfnFirst.hasDebt,
            totalDebtAmount: pgfnFirst.totalDebtAmount,
            debtCount: pgfnFirst.debtCount,
            summary: pgfnFirst.summary,
            rawData: pgfnFirst.rawData,
            queriedAt: pgfnFirst.queriedAt.toISOString(),
          }
        : null,
      cndt: cndtFirst
        ? {
            certificateStatus: cndtFirst.certificateStatus,
            certificateNumber: cndtFirst.certificateNumber,
            validUntil: cndtFirst.validUntil?.toISOString() ?? null,
            rawData: cndtFirst.rawData,
            queriedAt: cndtFirst.queriedAt.toISOString(),
          }
        : null,
      addressValidation: addressResult
        ? {
            cep: addressResult.cep,
            isValid: addressResult.isValid,
            street: addressResult.street,
            neighborhood: addressResult.neighborhood,
            city: addressResult.city,
            state: addressResult.state,
            matchesRegistered: addressResult.matchesRegistered,
            rawData: addressResult.rawData,
            queriedAt: addressResult.queriedAt.toISOString(),
          }
        : null,
      sanctions: sanctionsResults.map((r) => ({
        entityName: r.entityName,
        source: r.source,
        hasMatch: r.hasMatch,
        matchScore: r.matchScore,
        matchDetails: r.matchDetails,
        rawData: r.rawData,
        queriedAt: r.queriedAt.toISOString(),
      })),
      slaveLaborCheck: slaveLaborFirst
        ? {
            hasMatch: slaveLaborFirst.hasMatch,
            employerName: slaveLaborFirst.employerName,
            rescuedWorkers: slaveLaborFirst.rescuedWorkers,
            inspectionDate: slaveLaborFirst.inspectionDate?.toISOString() ?? null,
            rawData: slaveLaborFirst.rawData,
            queriedAt: slaveLaborFirst.queriedAt.toISOString(),
          }
        : null,
      negativeMedia: negativeMediaResults.map((r) => ({
        id: r.id,
        riskLevel: r.riskLevel,
        findingsCount: r.findingsCount,
        findings: (r.findings ?? []).map((f) => ({
          category: (f.category as string) ?? 'outro',
          title: (f.title as string) ?? '',
          snippet: (f.snippet as string) ?? '',
          sourceUrl: (f.sourceUrl as string) ?? null,
          sourceName: (f.sourceName as string) ?? null,
          date: (f.date as string) ?? null,
        })),
        summary: r.summary,
        groundingSources: (r.groundingSources ?? []).map((s) => ({
          uri: (s.uri as string) ?? '',
          title: (s.title as string) ?? '',
        })),
        queriedAt: r.queriedAt.toISOString(),
      })),
      digitalPresence: digitalFirst
        ? {
            domain: digitalFirst.domain,
            emailType: digitalFirst.emailType,
            hasDns: digitalFirst.hasDns,
            hasActiveSite: digitalFirst.hasActiveSite,
            siteTitle: digitalFirst.siteTitle,
            queriedAt: digitalFirst.queriedAt.toISOString(),
          }
        : null,
    };

    output.pendingChecks = this.computePendingChecks(drawee, output);
    output.overallRisk = this.calculateOverallRisk(output);
    return output;
  }

  private computePendingChecks(drawee: Drawee | null, results: ComplianceDraweeResultsOutput): ComplianceCheckName[] {
    if (!drawee) return [];

    const pending: ComplianceCheckName[] = [];

    if (drawee.cnpj) {
      const hasCgu = results.cgu.ceis.queriedAt || results.cgu.cnep.queriedAt || results.cgu.cepim.queriedAt;
      if (!hasCgu) pending.push('cgu');
      if (!results.pgfn) pending.push('pgfn');
      if (!results.cndt) pending.push('cndt');
      if (!results.slaveLaborCheck) pending.push('slaveLaborCheck');
    }

    if (drawee.companyName && results.sanctions.length === 0) {
      pending.push('sanctions');
    }

    if (drawee.companyName && drawee.cnpj && results.negativeMedia.length === 0) {
      pending.push('negativeMedia');
    }

    const hasEmail = false;
    if (hasEmail && !results.digitalPresence) {
      pending.push('digitalPresence');
    }

    return pending;
  }

  private calculateOverallRisk(data: ComplianceDraweeResultsOutput): RiskLevel {
    const hasCritical =
      data.cgu.ceis.hasMatch ||
      data.cgu.cnep.hasMatch ||
      data.slaveLaborCheck?.hasMatch ||
      data.sanctions.some((s) => s.hasMatch);

    if (hasCritical) return 'CRITICAL';

    const hasHigh =
      data.pgfn?.hasDebt ||
      data.cndt?.certificateStatus === 'POSITIVE' ||
      data.pep.some((p) => p.hasMatch) ||
      data.negativeMedia[0]?.riskLevel === 'HIGH';

    if (hasHigh) return 'HIGH';

    const hasMedium =
      data.cndt?.certificateStatus === 'POSITIVE_WITH_EFFECTS' ||
      data.addressValidation?.matchesRegistered === false ||
      data.negativeMedia[0]?.riskLevel === 'MEDIUM';

    if (hasMedium) return 'MEDIUM';

    const hasAnyData = data.cgu.ceis.queriedAt || data.pgfn || data.cndt;

    if (!hasAnyData) return 'PENDING';

    const hasUnavailable =
      data.cndt?.certificateStatus === 'UNAVAILABLE' ||
      data.cndt?.certificateStatus === 'UNKNOWN';

    if (hasUnavailable) return 'LOW';

    return 'CLEAR';
  }
}
