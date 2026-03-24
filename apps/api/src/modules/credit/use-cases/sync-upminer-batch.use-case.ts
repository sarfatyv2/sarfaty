import { Injectable, Inject, Logger } from '@nestjs/common';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import { type UpminerResult } from '../domain/upminer-result.entity';
import { type UpminerResultRepository, UPMINER_RESULT_REPOSITORY } from '../domain/upminer-result.repository';
import { UpminerDossierPersistenceService } from '../infra/upminer-dossier-persistence.service';
import { UPMINER_RELATIONAL_DOSSIERS_DATA_MARKER } from '../infra/upminer-relational.constants';

const PROCESSED_STATUS = 'processed';

@Injectable()
export class SyncUpminerBatchUseCase {
  private readonly logger = new Logger(SyncUpminerBatchUseCase.name);

  constructor(
    @Inject(UPMINER_RESULT_REPOSITORY)
    private readonly upminerRepository: UpminerResultRepository,
    private readonly upminerAdapter: UpminerAdapter,
    private readonly upminerDossierPersistence: UpminerDossierPersistenceService,
  ) {}

  async execute(clientId: string): Promise<UpminerResult | null> {
    this.logger.log(`Syncing upMiner batch for client ${clientId}`);

    const result = await this.upminerRepository.getLatestByClientId(clientId);

    if (!result) {
      this.logger.debug(`No upMiner result found for client ${clientId}`);
      return null;
    }

    if (result.isTerminal()) {
      this.logger.debug(`upMiner result for client ${clientId} is already ${result.status}`);
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

      const apiStatus = statusItem.status.toLowerCase();

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
          }
        } catch (fetchError) {
          this.logger.error(
            `Failed to fetch upMiner dossiers for batch ${batchId}: ${String(fetchError)}`,
          );
          result.markAsError(`Dossier fetch failed: ${(fetchError as Error).message}`);
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
}
