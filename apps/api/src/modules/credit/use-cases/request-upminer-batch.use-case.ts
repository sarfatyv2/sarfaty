import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import { UpminerResult } from '../domain/upminer-result.entity';
import { type UpminerResultRepository, UPMINER_RESULT_REPOSITORY } from '../domain/upminer-result.repository';

const DEFAULT_SEARCH_PROFILE_ID = 4; // "Consulta PJ" profile in upMiner
const PJ_INPUT_TYPE = 2;

export interface RequestUpminerBatchInput {
  searchProfileId?: number;
  notificationUrl?: string;
  checkDuplicates?: boolean;
}

@Injectable()
export class RequestUpminerBatchUseCase {
  private readonly logger = new Logger(RequestUpminerBatchUseCase.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    @Inject(UPMINER_RESULT_REPOSITORY)
    private readonly upminerRepository: UpminerResultRepository,
    private readonly upminerAdapter: UpminerAdapter,
  ) {}

  async execute(clientId: string, input: RequestUpminerBatchInput = {}): Promise<UpminerResult> {
    this.logger.log(`Requesting upMiner batch for client ${clientId}`);

    const clientRows = await this.db
      .select({ cnpj: clients.cnpj })
      .from(clients)
      .where(eq(clients.id, clientId))
      .execute();

    const client = clientRows[0];
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (!client.cnpj) {
      throw new Error(`Client ${clientId} does not have a CNPJ`);
    }

    const cleanCnpj = client.cnpj.replaceAll(/\D/g, '');
    const maskedCnpj = cleanCnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );
    const searchProfileId = input.searchProfileId ?? DEFAULT_SEARCH_PROFILE_ID;

    if (input.checkDuplicates) {
      try {
        const duplicateCheck = await this.upminerAdapter.checkDuplicates({ criterions: [maskedCnpj] });
        if (duplicateCheck.total_batches > 0) {
          this.logger.warn(
            `upMiner duplicate detected for client ${clientId}: ${duplicateCheck.total_batches} existing batch(es)`,
          );
        }
      } catch (error) {
        this.logger.warn(`upMiner duplicate check failed for client ${clientId}: ${String(error)}`);
      }
    }

    let result = UpminerResult.create({
      clientId,
      document: cleanCnpj,
      inputType: PJ_INPUT_TYPE,
      searchProfileId,
      batchId: null,
      status: 'PENDING',
      dossiersData: null,
      errorMessage: null,
      processedAt: null,
      parallelProcessId: null,
      parallelStatus: null,
    });

    try {
      const batchResponse = await this.upminerAdapter.createBatch({
        inputs: [cleanCnpj],
        input_type: PJ_INPUT_TYPE,
        search_profile_id: searchProfileId,
        break_batches: false,
        parameterization: {
          cade: {
            auto_relevante: false,
            parameters: {
              pesquisa: ['167', '168', '169'],
              target: '0',
            },
          },
          bancoCentralCrsfnEmentasAcordaos: {
            parameters: {
              exato: false,
            },
          },
        },
      });

      result.markAsQueued(batchResponse.batchID);
      await this.upminerRepository.save(result);

      try {
        await this.upminerAdapter.addBatchToQueue(batchResponse.batchID);
        this.logger.log(`upMiner batch ${batchResponse.batchID} added to queue for client ${clientId}`);
      } catch (queueError) {
        this.logger.warn(
          `upMiner addBatchToQueue failed for batch ${batchResponse.batchID}: ${String(queueError)}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error requesting upMiner batch for client ${clientId}`, (error as Error).stack);
      result.markAsError((error as Error).message);
      await this.upminerRepository.save(result);
      return result;
    }
  }
}
