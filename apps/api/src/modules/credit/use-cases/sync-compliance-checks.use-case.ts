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
import { CguCheckRepository, CGU_CHECK_REPOSITORY } from '../domain/cgu-check.repository';
import { PepCheckRepository, PEP_CHECK_REPOSITORY } from '../domain/pep-check.repository';
import { PgfnCheckRepository, PGFN_CHECK_REPOSITORY } from '../domain/pgfn-check.repository';
import { CndtCheckRepository, CNDT_CHECK_REPOSITORY } from '../domain/cndt-check.repository';
import { AddressValidationRepository, ADDRESS_VALIDATION_REPOSITORY } from '../domain/address-validation.repository';
import { SanctionsCheckRepository, SANCTIONS_CHECK_REPOSITORY } from '../domain/sanctions-check.repository';
import { SlaveLaborCheckRepository, SLAVE_LABOR_CHECK_REPOSITORY } from '../domain/slave-labor-check.repository';
import { NegativeMediaRepository, NEGATIVE_MEDIA_REPOSITORY } from '../domain/negative-media.repository';
import { DigitalPresenceRepository, DIGITAL_PRESENCE_REPOSITORY } from '../domain/digital-presence.repository';
import { CguCheckResult, type CguCheckType } from '../domain/cgu-check-result.entity';
import { PepCheckResult } from '../domain/pep-check-result.entity';
import { PgfnCheckResult } from '../domain/pgfn-check-result.entity';
import { CndtCheckResult } from '../domain/cndt-check-result.entity';
import { AddressValidationResult } from '../domain/address-validation-result.entity';
import { SanctionsCheckResult } from '../domain/sanctions-check-result.entity';
import { SlaveLaborCheckResult } from '../domain/slave-labor-check-result.entity';
import { NegativeMediaResult } from '../domain/negative-media-result.entity';
import { DigitalPresenceResult } from '../domain/digital-presence-result.entity';

export interface SyncComplianceChecksInput {
  clientId: string;
  cnpj?: string;
  companyName?: string;
  tradeName?: string;
  cep?: string;
  registeredStreet?: string;
  registeredCity?: string;
  registeredState?: string;
  email?: string;
  authorizedPersons?: Array<{ cpf: string; name: string }>;
}

@Injectable()
export class SyncComplianceChecksUseCase {
  private readonly logger = new Logger(SyncComplianceChecksUseCase.name);

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

  async execute(input: SyncComplianceChecksInput): Promise<void> {
    this.logger.log(`Starting compliance checks for client ${input.clientId}`);

    const tasks: Promise<void>[] = [];

    if (input.cnpj) {
      tasks.push(
        this.syncCgu(input.clientId, input.cnpj),
        this.syncPgfn(input.clientId, input.cnpj),
        this.syncCndt(input.clientId, input.cnpj),
        this.syncSlaveLaborCheck(input.clientId, input.cnpj),
      );
    }

    if (input.companyName) {
      tasks.push(this.syncSanctions(input.clientId, input.companyName, input.tradeName, input.cnpj));
    }

    if (input.cep) {
      tasks.push(this.syncAddressValidation(
        input.clientId, input.cep, input.registeredStreet, input.registeredCity, input.registeredState,
      ));
    }

    if (input.authorizedPersons && input.authorizedPersons.length > 0) {
      tasks.push(this.syncPep(input.clientId, input.authorizedPersons));
    }

    if (input.companyName && input.cnpj) {
      tasks.push(this.syncNegativeMedia(input.clientId, input.cnpj, input.companyName, input.tradeName));
    }

    if (input.email) {
      tasks.push(this.syncDigitalPresence(input.clientId, input.email));
    }

    await Promise.allSettled(tasks);
    this.logger.log(`Completed compliance checks for client ${input.clientId}`);
  }

  private async syncCgu(clientId: string, cnpj: string): Promise<void> {
    try {
      const results = await this.cguAdapter.checkAll(cnpj);

      const checks: Array<{ type: CguCheckType; data: any[] }> = [
        { type: 'CEIS', data: results.ceis },
        { type: 'CNEP', data: results.cnep },
        { type: 'CEPIM', data: results.cepim },
      ];

      for (const check of checks) {
        const entity = CguCheckResult.create({
          clientId,
          cnpj,
          checkType: check.type,
          hasMatch: check.data.length > 0,
          matchCount: check.data.length,
          summary: check.data.length > 0
            ? `${check.data.length} registro(s) encontrado(s) no ${check.type}`
            : null,
          rawData: check.data.length > 0 ? check.data : null,
        });
        await this.cguRepo.save(entity);
      }
    } catch (error) {
      this.logger.error(`CGU check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncPep(clientId: string, persons: Array<{ cpf: string; name: string }>): Promise<void> {
    try {
      const matches = await this.pepAdapter.checkCpfs(persons);

      for (const person of persons) {
        const cleanCpf = person.cpf.replaceAll(/\D/g, '');
        const match = matches.find(m => m.cpf.replaceAll(/\D/g, '') === cleanCpf);

        const entity = PepCheckResult.create({
          clientId,
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
      this.logger.error(`PEP check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncPgfn(clientId: string, cnpj: string): Promise<void> {
    try {
      const result = await this.pgfnAdapter.queryByCnpj(cnpj);

      const entity = PgfnCheckResult.create({
        clientId,
        cnpj,
        hasDebt: result.found,
        totalDebtAmount: result.totalDebtAmount,
        debtCount: result.debtCount,
        summary: result.found
          ? `${result.debtCount} dívida(s) ativa(s) encontrada(s)`
          : null,
        rawData: result.rawEntries.length > 0 ? result.rawEntries : null,
      });
      await this.pgfnRepo.save(entity);
    } catch (error) {
      this.logger.error(`PGFN check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncCndt(clientId: string, cnpj: string): Promise<void> {
    try {
      const result = await this.cndtAdapter.queryByCnpj(cnpj);

      let validUntil: Date | null = null;
      if (result.validUntil) {
        const [day, month, year] = result.validUntil.split('/');
        if (day && month && year) {
          validUntil = new Date(`${year}-${month}-${day}T00:00:00Z`);
        }
      }

      const entity = CndtCheckResult.create({
        clientId,
        cnpj,
        certificateStatus: result.status,
        certificateNumber: result.certificateNumber,
        validUntil,
        rawData: {
          status: result.status,
          certificateNumber: result.certificateNumber,
          validUntil: result.validUntil,
          reason: result.reason,
        },
      });
      await this.cndtRepo.save(entity);
    } catch (error) {
      this.logger.error(`CNDT check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncAddressValidation(
    clientId: string,
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

      const entity = AddressValidationResult.create({
        clientId,
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
      this.logger.error(`Address validation failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncSanctions(clientId: string, companyName: string, tradeName?: string, cnpj?: string): Promise<void> {
    try {
      const matches = await this.sanctionsAdapter.screenEntity(companyName, tradeName);

      if (matches.length === 0) {
        const entity = SanctionsCheckResult.create({
          clientId,
          entityName: companyName,
          documentSearched: cnpj ?? null,
          source: 'OFAC',
          hasMatch: false,
          matchScore: null,
          matchDetails: null,
          rawData: null,
        });
        await this.sanctionsRepo.save(entity);
      } else {
        for (const match of matches) {
          const entity = SanctionsCheckResult.create({
            clientId,
            entityName: match.entitySearched,
            documentSearched: cnpj ?? null,
            source: match.source,
            hasMatch: true,
            matchScore: match.score,
            matchDetails: `Match: ${match.matchedName} (score: ${match.score.toFixed(2)})`,
            rawData: match.rawRecord,
          });
          await this.sanctionsRepo.save(entity);
        }
      }
    } catch (error) {
      this.logger.error(`Sanctions check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncSlaveLaborCheck(clientId: string, cnpj: string): Promise<void> {
    try {
      const match = await this.slaveLaborAdapter.checkByCnpj(cnpj);

      const entity = SlaveLaborCheckResult.create({
        clientId,
        cnpj,
        hasMatch: !!match,
        employerName: match?.employerName ?? null,
        rescuedWorkers: match?.rescuedWorkers ?? null,
        inspectionDate: match?.inspectionDate ? new Date(match.inspectionDate) : null,
        rawData: match ?? null,
      });
      await this.slaveLaborRepo.save(entity);
    } catch (error) {
      this.logger.error(`Slave labor check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncNegativeMedia(clientId: string, cnpj: string, companyName: string, tradeName?: string): Promise<void> {
    try {
      const result = await this.negativeMediaAdapter.search(companyName, cnpj, tradeName);

      const entity = NegativeMediaResult.create({
        clientId,
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
      this.logger.error(`Negative media check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }

  private async syncDigitalPresence(clientId: string, email: string): Promise<void> {
    try {
      const result = await this.digitalPresenceAdapter.check(email);

      const entity = DigitalPresenceResult.create({
        clientId,
        domain: result.domain,
        emailType: result.emailType,
        hasDns: result.hasDns,
        hasActiveSite: result.hasActiveSite,
        siteTitle: result.siteTitle,
        rawData: result.rawData,
      });
      await this.digitalPresenceRepo.save(entity);
    } catch (error) {
      this.logger.error(`Digital presence check failed for client ${clientId}: ${(error as Error).message}`);
    }
  }
}
