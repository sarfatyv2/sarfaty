import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { AllcheckAdapter } from '../bureaus/allcheck/allcheck.adapter';
import { CLIENT_REPOSITORY, type ClientRepository } from '../../clients/domain/client.repository';
import { EnrichClientFromBureauUseCase } from '../../clients/use-cases/enrich-client-from-bureau.use-case';
import { ALLCHECK_RESULT_REPOSITORY, type AllcheckResultRepository } from '../domain/allcheck-result.repository';
import { AllcheckResult } from '../domain/allcheck-result.entity';

export interface SyncAllcheckClientInput {
  clientId: string;
}

@Injectable()
export class SyncAllcheckClientUseCase {
  private readonly logger = new Logger(SyncAllcheckClientUseCase.name);

  constructor(
    private readonly allcheckAdapter: AllcheckAdapter,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(ALLCHECK_RESULT_REPOSITORY)
    private readonly allcheckResultRepository: AllcheckResultRepository,
    private readonly enrichClientUseCase: EnrichClientFromBureauUseCase,
  ) {}

  async execute(input: SyncAllcheckClientInput): Promise<void> {
    const { clientId } = input;

    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);

    if (!client.cnpj) {
      this.logger.warn(`Client ${clientId} has no CNPJ, skipping Allcheck sync`);
      return;
    }

    this.logger.log(`Starting Allcheck sync for client ${clientId} (CNPJ: ${client.cnpj})`);

    try {
      const result = await this.allcheckAdapter.query(client.cnpj);

      const entity = AllcheckResult.create({
        clientId,
        document: result.document,
        name: result.name,
        emails: result.emails,
        currentAddress: result.currentAddress,
        addressHistory: result.addressHistory,
        phones: result.phones,
        partners: result.partners,
        companyData: result.companyData,
        isPep: result.isPep,
        vehicles: result.vehicles,
        ccfOccurrences: result.ccfOccurrences,
        consultationNetwork: result.consultationNetwork,
        rawData: result.rawXml,
      });

      await this.allcheckResultRepository.save(entity);

      const primaryPhone = result.phones.find((p) => p.type === 'FIXO') ?? result.phones[0] ?? null;

      await this.enrichClientUseCase.execute({
        clientId,
        source: 'allcheck',
        data: {
          address: result.currentAddress ?? undefined,
          contact: primaryPhone
            ? {
                phone: primaryPhone.fullNumber,
                email: result.emails[0] ?? null,
              }
            : result.emails.length > 0
              ? { phone: null, email: result.emails[0] ?? null }
              : undefined,
          partners: result.partners.map((p) => ({
            fullName: p.name,
            cpf: p.cpf,
            cnpj: null,
            authorizationType: p.qualification ?? 'SÓCIO',
            phone: null,
            email: null,
            joinedAt: p.joinedAt,
            mandateEndAt: null,
            role: p.qualification,
            participationPercentage: null,
            capitalTotalValue: null,
            restrictionSign: null,
          })),
        },
      });

      this.logger.log(`Allcheck sync completed for client ${clientId}`);
    } catch (error) {
      this.logger.error(`Allcheck sync failed for client ${clientId}: ${(error as Error).message}`);
      throw error;
    }
  }
}
