import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import { UpminerResult } from '../domain/upminer-result.entity';
import { type UpminerResultRepository, UPMINER_RESULT_REPOSITORY } from '../domain/upminer-result.repository';
import { UpminerParallelPersistenceService } from '../infra/upminer-parallel-persistence.service';

const PROCESSED_STATUS = 'processed';
const SOURCE_ID_EMPRESA_PJ = 285;
const SOURCE_ID_PROCESSOS = 410;

export interface TriggerUpminerParallelOutput {
  parallelStatus: string | null;
}

@Injectable()
export class TriggerUpminerParallelUseCase {
  private readonly logger = new Logger(TriggerUpminerParallelUseCase.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(UPMINER_RESULT_REPOSITORY) private readonly upminerRepository: UpminerResultRepository,
    private readonly upminerAdapter: UpminerAdapter,
    private readonly upminerParallelPersistence: UpminerParallelPersistenceService,
  ) {}

  async execute(clientId: string): Promise<TriggerUpminerParallelOutput> {
    const clientRows = await this.db
      .select({ cnpj: clients.cnpj })
      .from(clients)
      .where(eq(clients.id, clientId))
      .execute();

    const client = clientRows[0];
    if (!client?.cnpj) throw new NotFoundException(`Client ${clientId} not found or has no CNPJ`);

    const cleanCnpj = client.cnpj.replaceAll(/\D/g, '');

    // Reuse an existing result if available, otherwise create a minimal one
    let result = await this.upminerRepository.getLatestByClientId(clientId);

    if (!result) {
      result = UpminerResult.create({
        clientId,
        document: cleanCnpj,
        inputType: 2,
        searchProfileId: 4,
        batchId: null,
        status: 'PROCESSED',
        dossiersData: null,
        errorMessage: null,
        processedAt: new Date(),
        parallelProcessId: null,
        parallelStatus: null,
      });
      await this.upminerRepository.save(result);
    }

    // If parallel data already processed, just sync it to return status
    if (result.parallelStatus === 'PROCESSED') {
      return { parallelStatus: 'PROCESSED' };
    }

    // If a parallel process is already running, poll it
    if (result.parallelProcessId && result.parallelStatus !== 'ERROR') {
      await this.syncParallel(result);
      return { parallelStatus: result.parallelStatus };
    }

    // Trigger fresh parallel sources
    try {
      const parallelResponse = await this.upminerAdapter.processSourcesParallel({
        sources: [
          { id: SOURCE_ID_EMPRESA_PJ, params: { cnpj: cleanCnpj } },
          { id: SOURCE_ID_PROCESSOS, params: { document: cleanCnpj, limit: '100' } },
        ],
      });

      result.markParallelPending(parallelResponse.id);
      await this.upminerRepository.update(result);

      this.logger.log(`Parallel process ${parallelResponse.id} triggered for client ${clientId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger parallel sources for client ${clientId}: ${String(error)}`);
      result.markParallelError();
      await this.upminerRepository.update(result);
      return { parallelStatus: 'ERROR' };
    }

    // Immediately try to poll (sources may be fast)
    await this.syncParallel(result);
    return { parallelStatus: result.parallelStatus };
  }

  private async syncParallel(result: UpminerResult): Promise<void> {
    const processId = result.parallelProcessId ?? '';

    try {
      const statusResponse = await this.upminerAdapter.getParallelProcessStatus(processId);

      const allProcessed = statusResponse.items.every((item) => item.status === PROCESSED_STATUS);
      const anyError = statusResponse.items.some((item) => item.status === 'error' || item.status === 'failed');

      if (anyError) {
        result.markParallelError();
        await this.upminerRepository.update(result);
        return;
      }

      if (!allProcessed) {
        result.markParallelProcessing();
        await this.upminerRepository.update(result);
        return;
      }

      const item285 = statusResponse.items.find((i) => i.source_id === SOURCE_ID_EMPRESA_PJ);
      const item410 = statusResponse.items.find((i) => i.source_id === SOURCE_ID_PROCESSOS);

      let rawEmpresaPj: unknown = null;
      let rawProcessos: unknown = null;

      if (item285) {
        try {
          const r = await this.upminerAdapter.getParallelItemResult(processId, item285.id) as Record<string, unknown>;
          rawEmpresaPj = r?.results ?? null;
        } catch (err) {
          this.logger.warn(`Failed to fetch item 285: ${String(err)}`);
        }
      }

      if (item410) {
        try {
          const r = await this.upminerAdapter.getParallelItemResult(processId, item410.id) as Record<string, unknown>;
          rawProcessos = r?.results ?? null;
        } catch (err) {
          this.logger.warn(`Failed to fetch item 410: ${String(err)}`);
        }
      }

      await this.upminerParallelPersistence.persist(result.id, rawEmpresaPj, rawProcessos);
      result.markParallelProcessed();
      await this.upminerRepository.update(result);
    } catch (error) {
      this.logger.error(`Error syncing parallel for process ${processId}: ${String(error)}`);
      result.markParallelError();
      await this.upminerRepository.update(result);
    }
  }
}
