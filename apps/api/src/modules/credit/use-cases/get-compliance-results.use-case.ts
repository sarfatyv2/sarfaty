import { Injectable, Inject, Logger } from '@nestjs/common';
import { CguCheckRepository, CGU_CHECK_REPOSITORY } from '../domain/cgu-check.repository';
import { PepCheckRepository, PEP_CHECK_REPOSITORY } from '../domain/pep-check.repository';
import { PgfnCheckRepository, PGFN_CHECK_REPOSITORY } from '../domain/pgfn-check.repository';
import { CndtCheckRepository, CNDT_CHECK_REPOSITORY } from '../domain/cndt-check.repository';
import { AddressValidationRepository, ADDRESS_VALIDATION_REPOSITORY } from '../domain/address-validation.repository';
import { SanctionsCheckRepository, SANCTIONS_CHECK_REPOSITORY } from '../domain/sanctions-check.repository';
import { SlaveLaborCheckRepository, SLAVE_LABOR_CHECK_REPOSITORY } from '../domain/slave-labor-check.repository';
import { NegativeMediaRepository, NEGATIVE_MEDIA_REPOSITORY } from '../domain/negative-media.repository';
import { DigitalPresenceRepository, DIGITAL_PRESENCE_REPOSITORY } from '../domain/digital-presence.repository';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';

export interface ComplianceResultsOutput {
  overallRisk: RiskLevel;
  cgu: {
    ceis: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cnep: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cepim: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
  };
  pep: Array<{
    cpf: string;
    personName: string | null;
    hasMatch: boolean;
    matchedRole: string | null;
    matchedOrg: string | null;
    rawData: any;
    queriedAt: string | null;
  }>;
  pgfn: {
    hasDebt: boolean;
    totalDebtAmount: number | null;
    debtCount: number;
    summary: string | null;
    rawData: any;
    queriedAt: string | null;
  } | null;
  cndt: {
    certificateStatus: string;
    certificateNumber: string | null;
    validUntil: string | null;
    rawData: any;
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
    rawData: any;
    queriedAt: string | null;
  } | null;
  sanctions: Array<{
    entityName: string | null;
    source: string;
    hasMatch: boolean;
    matchScore: number | null;
    matchDetails: string | null;
    rawData: any;
    queriedAt: string | null;
  }>;
  slaveLaborCheck: {
    hasMatch: boolean;
    employerName: string | null;
    rescuedWorkers: number | null;
    inspectionDate: string | null;
    rawData: any;
    queriedAt: string | null;
  } | null;
  negativeMedia: Array<{
    id: string;
    riskLevel: string;
    findingsCount: number;
    findings: Array<{
      category: string; title: string; snippet: string;
      sourceUrl: string | null; sourceName: string | null; date: string | null;
    }>;
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
export class GetComplianceResultsUseCase {
  private readonly logger = new Logger(GetComplianceResultsUseCase.name);

  constructor(
    @Inject(CGU_CHECK_REPOSITORY) private readonly cguRepo: CguCheckRepository,
    @Inject(PEP_CHECK_REPOSITORY) private readonly pepRepo: PepCheckRepository,
    @Inject(PGFN_CHECK_REPOSITORY) private readonly pgfnRepo: PgfnCheckRepository,
    @Inject(CNDT_CHECK_REPOSITORY) private readonly cndtRepo: CndtCheckRepository,
    @Inject(ADDRESS_VALIDATION_REPOSITORY) private readonly addressRepo: AddressValidationRepository,
    @Inject(SANCTIONS_CHECK_REPOSITORY) private readonly sanctionsRepo: SanctionsCheckRepository,
    @Inject(SLAVE_LABOR_CHECK_REPOSITORY) private readonly slaveLaborRepo: SlaveLaborCheckRepository,
    @Inject(NEGATIVE_MEDIA_REPOSITORY) private readonly negativeMediaRepo: NegativeMediaRepository,
    @Inject(DIGITAL_PRESENCE_REPOSITORY) private readonly digitalPresenceRepo: DigitalPresenceRepository,
  ) {}

  async execute(clientId: string): Promise<ComplianceResultsOutput> {
    const [cguResults, pepResults, pgfnResult, cndtResult, addressResult, sanctionsResults, slaveLaborResult, negativeMediaResults, digitalPresenceResult] =
      await Promise.all([
        this.cguRepo.getLatestByClientId(clientId),
        this.pepRepo.getLatestByClientId(clientId),
        this.pgfnRepo.getLatestByClientId(clientId),
        this.cndtRepo.getLatestByClientId(clientId),
        this.addressRepo.getLatestByClientId(clientId),
        this.sanctionsRepo.getLatestByClientId(clientId),
        this.slaveLaborRepo.getLatestByClientId(clientId),
        this.negativeMediaRepo.getAllByClientId(clientId),
        this.digitalPresenceRepo.getLatestByClientId(clientId),
      ]);

    const ceisCheck = cguResults.find(r => r.checkType === 'CEIS');
    const cnepCheck = cguResults.find(r => r.checkType === 'CNEP');
    const cepimCheck = cguResults.find(r => r.checkType === 'CEPIM');

    const emptyCguCheck = { hasMatch: false, matchCount: 0, summary: null, rawData: null, queriedAt: null };

    const output: ComplianceResultsOutput = {
      overallRisk: 'PENDING',
      cgu: {
        ceis: ceisCheck
          ? { hasMatch: ceisCheck.hasMatch, matchCount: ceisCheck.matchCount, summary: ceisCheck.summary, rawData: ceisCheck.rawData, queriedAt: ceisCheck.queriedAt.toISOString() }
          : emptyCguCheck,
        cnep: cnepCheck
          ? { hasMatch: cnepCheck.hasMatch, matchCount: cnepCheck.matchCount, summary: cnepCheck.summary, rawData: cnepCheck.rawData, queriedAt: cnepCheck.queriedAt.toISOString() }
          : emptyCguCheck,
        cepim: cepimCheck
          ? { hasMatch: cepimCheck.hasMatch, matchCount: cepimCheck.matchCount, summary: cepimCheck.summary, rawData: cepimCheck.rawData, queriedAt: cepimCheck.queriedAt.toISOString() }
          : emptyCguCheck,
      },
      pep: pepResults.map(r => ({
        cpf: r.cpf ?? '',
        personName: r.personName,
        hasMatch: r.hasMatch,
        matchedRole: r.matchedRole,
        matchedOrg: r.matchedOrg,
        rawData: r.rawData,
        queriedAt: r.queriedAt.toISOString(),
      })),
      pgfn: pgfnResult
        ? {
            hasDebt: pgfnResult.hasDebt,
            totalDebtAmount: pgfnResult.totalDebtAmount,
            debtCount: pgfnResult.debtCount,
            summary: pgfnResult.summary,
            rawData: pgfnResult.rawData,
            queriedAt: pgfnResult.queriedAt.toISOString(),
          }
        : null,
      cndt: cndtResult
        ? {
            certificateStatus: cndtResult.certificateStatus,
            certificateNumber: cndtResult.certificateNumber,
            validUntil: cndtResult.validUntil?.toISOString() ?? null,
            rawData: cndtResult.rawData,
            queriedAt: cndtResult.queriedAt.toISOString(),
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
      sanctions: sanctionsResults.map(r => ({
        entityName: r.entityName,
        source: r.source,
        hasMatch: r.hasMatch,
        matchScore: r.matchScore,
        matchDetails: r.matchDetails,
        rawData: r.rawData,
        queriedAt: r.queriedAt.toISOString(),
      })),
      slaveLaborCheck: slaveLaborResult
        ? {
            hasMatch: slaveLaborResult.hasMatch,
            employerName: slaveLaborResult.employerName,
            rescuedWorkers: slaveLaborResult.rescuedWorkers,
            inspectionDate: slaveLaborResult.inspectionDate?.toISOString() ?? null,
            rawData: slaveLaborResult.rawData,
            queriedAt: slaveLaborResult.queriedAt.toISOString(),
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
      digitalPresence: digitalPresenceResult
        ? {
            domain: digitalPresenceResult.domain,
            emailType: digitalPresenceResult.emailType,
            hasDns: digitalPresenceResult.hasDns,
            hasActiveSite: digitalPresenceResult.hasActiveSite,
            siteTitle: digitalPresenceResult.siteTitle,
            queriedAt: digitalPresenceResult.queriedAt.toISOString(),
          }
        : null,
    };

    output.overallRisk = this.calculateOverallRisk(output);
    return output;
  }

  private calculateOverallRisk(data: ComplianceResultsOutput): RiskLevel {
    const hasCritical =
      data.cgu.ceis.hasMatch ||
      data.cgu.cnep.hasMatch ||
      data.slaveLaborCheck?.hasMatch ||
      data.sanctions.some(s => s.hasMatch);

    if (hasCritical) return 'CRITICAL';

    const hasHigh =
      data.pgfn?.hasDebt ||
      data.cndt?.certificateStatus === 'POSITIVE' ||
      data.pep.some(p => p.hasMatch) ||
      data.negativeMedia[0]?.riskLevel === 'HIGH';

    if (hasHigh) return 'HIGH';

    const hasMedium =
      data.cndt?.certificateStatus === 'POSITIVE_WITH_EFFECTS' ||
      data.addressValidation?.matchesRegistered === false ||
      data.negativeMedia[0]?.riskLevel === 'MEDIUM';

    if (hasMedium) return 'MEDIUM';

    const hasAnyData =
      data.cgu.ceis.queriedAt ||
      data.pgfn ||
      data.cndt;

    if (!hasAnyData) return 'PENDING';

    const hasUnavailable =
      data.cndt?.certificateStatus === 'UNAVAILABLE' ||
      data.cndt?.certificateStatus === 'UNKNOWN';

    if (hasUnavailable) return 'LOW';

    return 'CLEAR';
  }
}
