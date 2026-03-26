import { Injectable, Inject, Logger } from '@nestjs/common';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import { type UpminerResult } from '../domain/upminer-result.entity';
import { type UpminerResultRepository, UPMINER_RESULT_REPOSITORY } from '../domain/upminer-result.repository';
import { UpminerDossierPersistenceService } from '../infra/upminer-dossier-persistence.service';
import { UpminerParallelPersistenceService } from '../infra/upminer-parallel-persistence.service';
import { UPMINER_RELATIONAL_DOSSIERS_DATA_MARKER } from '../infra/upminer-relational.constants';

const PROCESSED_STATUS = 'processed';
const SOURCE_ID_EMPRESA_PJ = 285;
const SOURCE_ID_PROCESSOS = 410;

/**
 * The /batches/{id}/status endpoint returns numeric status codes instead of strings.
 * Confirmed: "4" = processed. Mapping based on upMiner API conventions.
 */
const BATCH_STATUS_CODE_MAP: Record<string, string> = {
  '1': 'queued',
  '2': 'processing',
  '3': 'error',
  '4': 'processed',
  '5': 'processed', // processed with partial source errors
};

function normalizeBatchStatus(raw: string): string {
  return BATCH_STATUS_CODE_MAP[raw] ?? raw.toLowerCase();
}

@Injectable()
export class SyncUpminerBatchUseCase {
  private readonly logger = new Logger(SyncUpminerBatchUseCase.name);

  constructor(
    @Inject(UPMINER_RESULT_REPOSITORY)
    private readonly upminerRepository: UpminerResultRepository,
    private readonly upminerAdapter: UpminerAdapter,
    private readonly upminerDossierPersistence: UpminerDossierPersistenceService,
    private readonly upminerParallelPersistence: UpminerParallelPersistenceService,
  ) {}

  async execute(clientId: string): Promise<UpminerResult | null> {
    this.logger.log(`Syncing upMiner batch for client ${clientId}`);

    const result = await this.upminerRepository.getLatestByClientId(clientId);

    if (!result) {
      this.logger.debug(`No upMiner result found for client ${clientId}`);
      return null;
    }

    // If batch processed but parallel sources were never triggered, trigger them now
    if (result.status === 'PROCESSED' && result.parallelProcessId === null) {
      this.logger.log(`Triggering parallel sources for already-processed result ${result.id}`);
      await this.triggerParallelSources(result);
      await this.upminerRepository.update(result);
      return result;
    }

    if (result.isTerminal()) {
      this.logger.debug(`upMiner result for client ${clientId} is already terminal`);
      return result;
    }

    // ── Parallel sources polling (dossier already processed, parallel in flight) ──
    if (result.status === 'PROCESSED' && result.parallelProcessId && result.parallelStatus !== 'PROCESSED' && result.parallelStatus !== 'ERROR') {
      await this.syncParallelSources(result);
      return result;
    }

    const batchId = result.batchId;
    if (!batchId) {
      this.logger.error(`upMiner result ${result.id} has no batchId. Marking as ERROR.`);
      result.markAsError('Missing batchId');
      await this.upminerRepository.update(result);
      return result;
    }

    try {
      const statusItems = await this.upminerAdapter.getBatchStatus(batchId);
      const statusItem = statusItems[0];

      if (!statusItem) {
        this.logger.warn(`upMiner batch ${batchId} returned empty status`);
        return result;
      }

      const apiStatus = normalizeBatchStatus(statusItem.status);
      this.logger.log(`upMiner batch ${batchId} raw status: "${statusItem.status}" → normalized: "${apiStatus}"`);

      if (apiStatus === 'error' || apiStatus === 'failed') {
        result.markAsError(`Batch status: ${statusItem.status}`);
        await this.upminerRepository.update(result);
        return result;
      }

      if (apiStatus === PROCESSED_STATUS) {
        this.logger.log(`upMiner batch ${batchId} is processed, fetching dossiers for client ${clientId}`);

        try {
          const dossiersResponse = await this.upminerAdapter.getBatchDossiers(batchId);
          try {
            await this.upminerDossierPersistence.persistForResult(result.id, batchId, dossiersResponse);
            result.markAsProcessed(UPMINER_RELATIONAL_DOSSIERS_DATA_MARKER);
          } catch (persistError) {
            this.logger.error(
              `Failed to persist upMiner dossiers for batch ${batchId}: ${String(persistError)}`,
            );
            result.markAsError(`Dossier persist failed: ${(persistError as Error).message}`);
            await this.upminerRepository.update(result);
            return result;
          }
        } catch (fetchError) {
          this.logger.error(
            `Failed to fetch upMiner dossiers for batch ${batchId}: ${String(fetchError)}`,
          );
          result.markAsError(`Dossier fetch failed: ${(fetchError as Error).message}`);
          await this.upminerRepository.update(result);
          return result;
        }

        // ── Parallel sources: trigger if never started, sync if already in flight ──
        if (result.parallelProcessId === null) {
          await this.triggerParallelSources(result);
        } else if (result.parallelStatus !== 'PROCESSED' && result.parallelStatus !== 'ERROR') {
          await this.syncParallelSources(result);
        }
        await this.upminerRepository.update(result);
        return result;
      }

      if (result.status === 'QUEUED' || result.status === 'PENDING') {
        result.markAsProcessing();
        await this.upminerRepository.update(result);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error syncing upMiner batch ${batchId} for client ${clientId}`, (error as Error).stack);
      return result;
    }
  }

  private async triggerParallelSources(result: UpminerResult): Promise<void> {
    try {
      const parallelResponse = await this.upminerAdapter.processSourcesParallel({
        sources: [
          { id: SOURCE_ID_EMPRESA_PJ, params: { cnpj: result.document } },
          { id: SOURCE_ID_PROCESSOS, params: { document: result.document, limit: '100' } },
        ],
      });

      result.markParallelPending(parallelResponse.id);
      this.logger.log(`upMiner parallel process ${parallelResponse.id} triggered for result ${result.id}`);
    } catch (error) {
      this.logger.warn(`Failed to trigger upMiner parallel sources for result ${result.id}: ${String(error)}`);
      result.markParallelError();
    }
  }

  private async syncParallelSources(result: UpminerResult): Promise<void> {
    const processId = result.parallelProcessId!;

    try {
      const statusResponse = await this.upminerAdapter.getParallelProcessStatus(processId);

      const allProcessed = statusResponse.items.every((item) => item.status === PROCESSED_STATUS);
      const anyError = statusResponse.items.some((item) => item.status === 'error' || item.status === 'failed');

      if (anyError) {
        this.logger.warn(`upMiner parallel process ${processId} has errors`);
        result.markParallelError();
        await this.upminerRepository.update(result);
        return;
      }

      if (!allProcessed) {
        result.markParallelProcessing();
        await this.upminerRepository.update(result);
        return;
      }

      // All items processed — fetch results
      const item285 = statusResponse.items.find((i) => i.source_id === SOURCE_ID_EMPRESA_PJ);
      const item410 = statusResponse.items.find((i) => i.source_id === SOURCE_ID_PROCESSOS);

      let rawEmpresaPj: unknown = null;
      let rawProcessos: unknown = null;

      if (item285) {
        try {
          const itemResult = await this.upminerAdapter.getParallelItemResult(processId, item285.id) as Record<string, unknown>;
          rawEmpresaPj = itemResult?.results ?? null;
        } catch (error) {
          this.logger.warn(`Failed to fetch parallel item result 285 for process ${processId}: ${String(error)}`);
        }
      }

      if (item410) {
        try {
          const itemResult = await this.upminerAdapter.getParallelItemResult(processId, item410.id) as Record<string, unknown>;
          rawProcessos = itemResult?.results ?? null;
        } catch (error) {
          this.logger.warn(`Failed to fetch parallel item result 410 for process ${processId}: ${String(error)}`);
        }
      }

      await this.upminerParallelPersistence.persist(result.id, rawEmpresaPj, rawProcessos);

      result.markParallelProcessed();
      await this.upminerRepository.update(result);

      this.logger.log(`upMiner parallel sources persisted for result ${result.id}`);
    } catch (error) {
      this.logger.error(`Error syncing upMiner parallel sources for process ${processId}: ${String(error)}`);
      result.markParallelError();
      await this.upminerRepository.update(result);
    }
  }
}
