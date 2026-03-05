import { Injectable, Inject, Logger } from '@nestjs/common';
import { CguAdapter } from '../bureaus/cgu/cgu.adapter';
import { PepAdapter } from '../bureaus/pep/pep.adapter';
import { PgfnAdapter } from '../bureaus/pgfn/pgfn.adapter';
import { CndtAdapter } from '../bureaus/cndt/cndt.adapter';
import { ViacepAdapter } from '../bureaus/viacep/viacep.adapter';
import { SanctionsAdapter } from '../bureaus/sanctions/sanctions.adapter';
import { SlaveLaborAdapter } from '../bureaus/slave-labor/slave-labor.adapter';
import { NegativeMediaAdapter } from '../bureaus/negative-media/negative-media.adapter';
import { DigitalPresenceAdapter } from '../bureaus/digital-presence/digital-presence.adapter';
import { CguDraweeCheckRepository, CGU_DRAWEE_CHECK_REPOSITORY } from '../domain/cgu-drawee-check.repository';
import { PepDraweeCheckRepository, PEP_DRAWEE_CHECK_REPOSITORY } from '../domain/pep-drawee-check.repository';
import { PgfnDraweeCheckRepository, PGFN_DRAWEE_CHECK_REPOSITORY } from '../domain/pgfn-drawee-check.repository';
import { CndtDraweeCheckRepository, CNDT_DRAWEE_CHECK_REPOSITORY } from '../domain/cndt-drawee-check.repository';
import { AddressValidationDraweeResultRepository, ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY } from '../domain/address-validation-drawee-result.repository';
import { SanctionsDraweeCheckRepository, SANCTIONS_DRAWEE_CHECK_REPOSITORY } from '../domain/sanctions-drawee-check.repository';
import { SlaveLaborDraweeCheckRepository, SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY } from '../domain/slave-labor-drawee-check.repository';
import { NegativeMediaDraweeResultRepository, NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY } from '../domain/negative-media-drawee-result.repository';
import { DigitalPresenceDraweeResultRepository, DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY } from '../domain/digital-presence-drawee-result.repository';
import { CguDraweeCheckResult, type CguCheckType } from '../domain/cgu-drawee-check-result.entity';
import { PepDraweeCheckResult } from '../domain/pep-drawee-check-result.entity';
import { PgfnDraweeCheckResult } from '../domain/pgfn-drawee-check-result.entity';
import { CndtDraweeCheckResult } from '../domain/cndt-drawee-check-result.entity';
import { AddressValidationDraweeResult } from '../domain/address-validation-drawee-result.entity';
import { SanctionsDraweeCheckResult } from '../domain/sanctions-drawee-check-result.entity';
import { SlaveLaborDraweeCheckResult } from '../domain/slave-labor-drawee-check-result.entity';
import { NegativeMediaDraweeResult } from '../domain/negative-media-drawee-result.entity';
import { DigitalPresenceDraweeResult } from '../domain/digital-presence-drawee-result.entity';

export interface SyncComplianceChecksDraweeInput {
  draweeId: string;
  cnpj?: string;
  companyName?: string;
  tradeName?: string;
  cep?: string;
  registeredStreet?: string;
  registeredCity?: string;
  registeredState?: string;
  email?: string;
  persons?: Array<{ cpf: string; name: string }>;
}

@Injectable()
export class SyncComplianceChecksDraweeUseCase {
  private readonly logger = new Logger(SyncComplianceChecksDraweeUseCase.name);

  constructor(
    private readonly cguAdapter: CguAdapter,
    private readonly pepAdapter: PepAdapter,
    private readonly pgfnAdapter: PgfnAdapter,
    private readonly cndtAdapter: CndtAdapter,
    private readonly viacepAdapter: ViacepAdapter,
    private readonly sanctionsAdapter: SanctionsAdapter,
    private readonly slaveLaborAdapter: SlaveLaborAdapter,
    private readonly negativeMediaAdapter: NegativeMediaAdapter,
    private readonly digitalPresenceAdapter: DigitalPresenceAdapter,
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

  async execute(input: SyncComplianceChecksDraweeInput): Promise<void> {
    this.logger.log(`Starting compliance checks for drawee ${input.draweeId}`);

    const tasks: Promise<void>[] = [];

    if (input.cnpj) {
      tasks.push(
        this.syncCgu(input.draweeId, input.cnpj),
        this.syncPgfn(input.draweeId, input.cnpj),
        this.syncCndt(input.draweeId, input.cnpj),
        this.syncSlaveLaborCheck(input.draweeId, input.cnpj),
      );
    }

    if (input.companyName) {
      tasks.push(this.syncSanctions(input.draweeId, input.companyName, input.tradeName, input.cnpj));
    }

    if (input.cep) {
      tasks.push(this.syncAddressValidation(
        input.draweeId, input.cep, input.registeredStreet, input.registeredCity, input.registeredState,
      ));
    }

    if (input.persons && input.persons.length > 0) {
      tasks.push(this.syncPep(input.draweeId, input.persons));
    }

    if (input.companyName && input.cnpj) {
      tasks.push(this.syncNegativeMedia(input.draweeId, input.cnpj, input.companyName, input.tradeName));
    }

    if (input.email) {
      tasks.push(this.syncDigitalPresence(input.draweeId, input.email));
    }

    await Promise.allSettled(tasks);
    this.logger.log(`Completed compliance checks for drawee ${input.draweeId}`);
  }

  private async syncCgu(draweeId: string, cnpj: string): Promise<void> {
    try {
      const results = await this.cguAdapter.checkAll(cnpj);
      const checks: Array<{ type: CguCheckType; data: unknown[] }> = [
        { type: 'CEIS', data: results.ceis },
        { type: 'CNEP', data: results.cnep },
        { type: 'CEPIM', data: results.cepim },
      ];
      for (const check of checks) {
        const entity = CguDraweeCheckResult.create({
          draweeId,
          cnpj,
          checkType: check.type,
          hasMatch: check.data.length > 0,
          matchCount: check.data.length,
          summary: check.data.length > 0 ? `${check.data.length} registro(s) encontrado(s) no ${check.type}` : null,
          rawData: check.data.length > 0 ? check.data : null,
        });
        await this.cguRepo.save(entity);
      }
    } catch (error) {
      this.logger.error(`CGU check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncPep(draweeId: string, persons: Array<{ cpf: string; name: string }>): Promise<void> {
    try {
      const matches = await this.pepAdapter.checkCpfs(persons);
      for (const person of persons) {
        const cleanCpf = person.cpf.replaceAll(/\D/g, '');
        const match = matches.find(m => m.cpf.replaceAll(/\D/g, '') === cleanCpf);
        const entity = PepDraweeCheckResult.create({
          draweeId,
          cpf: cleanCpf,
          personName: person.name,
          hasMatch: !!match,
          matchedRole: match?.funcao ?? null,
          matchedOrg: match?.orgao ?? null,
          rawData: match ?? null,
        });
        await this.pepRepo.save(entity);
      }
    } catch (error) {
      this.logger.error(`PEP check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncPgfn(draweeId: string, cnpj: string): Promise<void> {
    try {
      const result = await this.pgfnAdapter.queryByCnpj(cnpj);
      const entity = PgfnDraweeCheckResult.create({
        draweeId,
        cnpj,
        hasDebt: result.found,
        totalDebtAmount: result.totalDebtAmount,
        debtCount: result.debtCount,
        summary: result.found ? `${result.debtCount} dívida(s) ativa(s) encontrada(s)` : null,
        rawData: result.rawEntries.length > 0 ? result.rawEntries : null,
      });
      await this.pgfnRepo.save(entity);
    } catch (error) {
      this.logger.error(`PGFN check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncCndt(draweeId: string, cnpj: string): Promise<void> {
    try {
      const result = await this.cndtAdapter.queryByCnpj(cnpj);
      let validUntil: Date | null = null;
      if (result.validUntil) {
        const [day, month, year] = result.validUntil.split('/');
        if (day && month && year) validUntil = new Date(`${year}-${month}-${day}T00:00:00Z`);
      }
      const entity = CndtDraweeCheckResult.create({
        draweeId,
        cnpj,
        certificateStatus: result.status,
        certificateNumber: result.certificateNumber,
        validUntil,
        rawData: { status: result.status, certificateNumber: result.certificateNumber, validUntil: result.validUntil, reason: result.reason },
      });
      await this.cndtRepo.save(entity);
    } catch (error) {
      this.logger.error(`CNDT check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncAddressValidation(
    draweeId: string,
    cep: string,
    registeredStreet?: string,
    registeredCity?: string,
    registeredState?: string,
  ): Promise<void> {
    try {
      const result = await this.viacepAdapter.queryCep(cep);
      let matchesRegistered: boolean | null = null;
      if (result && registeredCity) {
        const normalize = (s: string) => s.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').trim();
        const cityMatch = normalize(result.localidade) === normalize(registeredCity);
        const stateMatch = !registeredState || result.uf.toLowerCase() === registeredState.toLowerCase();
        const streetMatch = !registeredStreet || normalize(result.logradouro).includes(normalize(registeredStreet).slice(0, 15));
        matchesRegistered = cityMatch && stateMatch && streetMatch;
      }
      const entity = AddressValidationDraweeResult.create({
        draweeId,
        cep,
        isValid: !!result,
        street: result?.logradouro ?? null,
        neighborhood: result?.bairro ?? null,
        city: result?.localidade ?? null,
        state: result?.uf ?? null,
        matchesRegistered,
        rawData: result,
      });
      await this.addressRepo.save(entity);
    } catch (error) {
      this.logger.error(`Address validation failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncSanctions(draweeId: string, companyName: string, tradeName?: string, cnpj?: string): Promise<void> {
    try {
      const matches = await this.sanctionsAdapter.screenEntity(companyName, tradeName);
      if (matches.length === 0) {
        await this.sanctionsRepo.save(SanctionsDraweeCheckResult.create({
          draweeId,
          entityName: companyName,
          documentSearched: cnpj ?? null,
          source: 'OFAC',
          hasMatch: false,
          matchScore: null,
          matchDetails: null,
          rawData: null,
        }));
      } else {
        for (const match of matches) {
          await this.sanctionsRepo.save(SanctionsDraweeCheckResult.create({
            draweeId,
            entityName: match.entitySearched,
            documentSearched: cnpj ?? null,
            source: match.source,
            hasMatch: true,
            matchScore: match.score,
            matchDetails: `Match: ${match.matchedName} (score: ${match.score.toFixed(2)})`,
            rawData: match.rawRecord,
          }));
        }
      }
    } catch (error) {
      this.logger.error(`Sanctions check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncSlaveLaborCheck(draweeId: string, cnpj: string): Promise<void> {
    try {
      const match = await this.slaveLaborAdapter.checkByCnpj(cnpj);
      const entity = SlaveLaborDraweeCheckResult.create({
        draweeId,
        cnpj,
        hasMatch: !!match,
        employerName: match?.employerName ?? null,
        rescuedWorkers: match?.rescuedWorkers ?? null,
        inspectionDate: match?.inspectionDate ? new Date(match.inspectionDate) : null,
        rawData: match ?? null,
      });
      await this.slaveLaborRepo.save(entity);
    } catch (error) {
      this.logger.error(`Slave labor check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncNegativeMedia(draweeId: string, cnpj: string, companyName: string, tradeName?: string): Promise<void> {
    try {
      const result = await this.negativeMediaAdapter.search(companyName, cnpj, tradeName);
      const entity = NegativeMediaDraweeResult.create({
        draweeId,
        cnpj,
        companyName,
        riskLevel: result.riskLevel,
        findingsCount: result.findingsCount,
        findings: result.findings as unknown as Record<string, unknown>[],
        summary: result.summary || null,
        groundingSources: result.groundingSources as unknown as Record<string, unknown>[],
        rawResponse: result.rawResponse,
      });
      await this.negativeMediaRepo.save(entity);
    } catch (error) {
      this.logger.error(`Negative media check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async syncDigitalPresence(draweeId: string, email: string): Promise<void> {
    try {
      const result = await this.digitalPresenceAdapter.check(email);
      const entity = DigitalPresenceDraweeResult.create({
        draweeId,
        domain: result.domain,
        emailType: result.emailType,
        hasDns: result.hasDns,
        hasActiveSite: result.hasActiveSite,
        siteTitle: result.siteTitle,
        rawData: result.rawData,
      });
      await this.digitalPresenceRepo.save(entity);
    } catch (error) {
      this.logger.error(`Digital presence check failed for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }
}
