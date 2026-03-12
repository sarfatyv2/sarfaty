import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { AllcheckAdapter } from '../bureaus/allcheck/allcheck.adapter';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../../drawees/domain/drawee.repository';
import { EnrichDraweeFromBureauUseCase } from '../../drawees/use-cases/enrich-drawee-from-bureau.use-case';
import { ALLCHECK_DRAWEE_RESULT_REPOSITORY, type AllcheckDraweeResultRepository } from '../domain/allcheck-drawee-result.repository';
import { AllcheckDraweeResult } from '../domain/allcheck-drawee-result.entity';

export interface SyncAllcheckDraweeInput {
  draweeId: string;
}

@Injectable()
export class SyncAllcheckDraweeUseCase {
  private readonly logger = new Logger(SyncAllcheckDraweeUseCase.name);

  constructor(
    private readonly allcheckAdapter: AllcheckAdapter,
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepository: DraweeRepository,
    @Inject(ALLCHECK_DRAWEE_RESULT_REPOSITORY)
    private readonly allcheckDraweeResultRepository: AllcheckDraweeResultRepository,
    private readonly enrichDraweeUseCase: EnrichDraweeFromBureauUseCase,
  ) {}

  async execute(input: SyncAllcheckDraweeInput): Promise<void> {
    const { draweeId } = input;

    const drawee = await this.draweeRepository.findById(draweeId);
    if (!drawee) throw new NotFoundException(`Drawee ${draweeId} not found`);

    const document = drawee.cnpj ?? drawee.cpf;
    if (!document) {
      this.logger.warn(`Drawee ${draweeId} has no CPF/CNPJ, skipping Allcheck sync`);
      return;
    }

    this.logger.log(`Starting Allcheck sync for drawee ${draweeId} (doc: ${document})`);

    try {
      const result = await this.allcheckAdapter.query(document);

      const entity = AllcheckDraweeResult.create({
        draweeId,
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

      await this.allcheckDraweeResultRepository.save(entity);

      if (result.isPep) {
        await this.draweeRepository.update(draweeId, { isPep: true });
        this.logger.log(`Marked drawee ${draweeId} as PEP based on Allcheck data`);
      }

      const primaryPhone = result.phones.find((p) => p.type === 'FIXO') ?? result.phones[0] ?? null;

      await this.enrichDraweeUseCase.execute({
        draweeId,
        source: 'allcheck',
        data: {
          address: result.currentAddress ?? undefined,
          contact: primaryPhone
            ? {
                phone: primaryPhone.fullNumber,
                email: result.emails[0] ?? null,
              }
            : result.emails.length > 0
              ? { phone: null, email: result.emails[0] }
              : undefined,
          partners: result.partners.map((p) => ({
            fullName: p.name,
            cpf: p.cpf,
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

      this.logger.log(`Allcheck sync completed for drawee ${draweeId}`);
    } catch (error) {
      this.logger.error(`Allcheck sync failed for drawee ${draweeId}: ${(error as Error).message}`);
      throw error;
    }
  }
}
