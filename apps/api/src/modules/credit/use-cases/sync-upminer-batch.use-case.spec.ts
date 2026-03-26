import { UpminerResult } from '../domain/upminer-result.entity';
import { UPMINER_RELATIONAL_DOSSIERS_DATA_MARKER } from '../infra/upminer-relational.constants';
import { SyncUpminerBatchUseCase } from './sync-upminer-batch.use-case';

const CLIENT_ID = 'client-uuid-123';
const BATCH_ID = 42;

function makeResult(overrides: Partial<{ status: string; batchId: number | null }> = {}): UpminerResult {
  const batchId = 'batchId' in overrides ? overrides.batchId! : BATCH_ID;
  return UpminerResult.reconstruct({
    id: 'result-uuid',
    clientId: CLIENT_ID,
    document: '12345678000190',
    inputType: 2,
    searchProfileId: 100,
    batchId,
    status: (overrides.status as any) ?? 'QUEUED',
    dossiersData: null,
    errorMessage: null,
    parallelProcessId: null,
    parallelStatus: null,
    requestedAt: new Date(),
    processedAt: null,
  });
}

function createMocks() {
  const upminerAdapter = {
    getBatchStatus: vi.fn(),
    getBatchDossiers: vi.fn(),
  };

  const upminerDossierPersistence = {
    persistForResult: vi.fn(),
  };

  const upminerRepository = {
    save: vi.fn(),
    update: vi.fn(),
    getLatestByClientId: vi.fn(),
    getByBatchId: vi.fn(),
    getByClientId: vi.fn(),
    getPending: vi.fn(),
  };

  const upminerParallelPersistence = {
    persist: vi.fn(),
  };

  const useCase = new SyncUpminerBatchUseCase(
    upminerRepository as any,
    upminerAdapter as any,
    upminerDossierPersistence as any,
    upminerParallelPersistence as any,
  );

  return { useCase, upminerAdapter, upminerRepository, upminerDossierPersistence, upminerParallelPersistence };
}

describe('SyncUpminerBatchUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null when no result exists for client', async () => {
    const { useCase, upminerRepository } = createMocks();
    upminerRepository.getLatestByClientId.mockResolvedValue(null);

    const result = await useCase.execute(CLIENT_ID);

    expect(result).toBeNull();
    expect(upminerRepository.update).not.toHaveBeenCalled();
  });

  it('should return existing result without polling when already PROCESSED', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'PROCESSED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('PROCESSED');
    expect(upminerAdapter.getBatchStatus).not.toHaveBeenCalled();
  });

  it('should return existing result without polling when already ERROR', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'ERROR' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('ERROR');
    expect(upminerAdapter.getBatchStatus).not.toHaveBeenCalled();
  });

  it('should mark as ERROR when result has no batchId', async () => {
    const { useCase, upminerRepository } = createMocks();
    const existing = makeResult({ batchId: null, status: 'PENDING' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('ERROR');
    expect(result?.errorMessage).toContain('batchId');
    expect(upminerRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should mark as PROCESSED and persist dossiers when API returns "processed"', async () => {
    const { useCase, upminerRepository, upminerAdapter, upminerDossierPersistence } = createMocks();
    const existing = makeResult({ status: 'QUEUED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: false, status: 'processed', parent_batch_id: null },
    ]);

    const mockDossiers = { id: BATCH_ID, status: 'processed', dossiers: [] };
    upminerAdapter.getBatchDossiers.mockResolvedValue(mockDossiers);
    upminerDossierPersistence.persistForResult.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('PROCESSED');
    expect(result?.dossiersData).toEqual(UPMINER_RELATIONAL_DOSSIERS_DATA_MARKER);
    expect(upminerAdapter.getBatchDossiers).toHaveBeenCalledWith(BATCH_ID);
    expect(upminerDossierPersistence.persistForResult).toHaveBeenCalledWith(
      'result-uuid',
      BATCH_ID,
      mockDossiers,
    );
    expect(upminerRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should mark as ERROR when status is "processed" but dossier fetch fails', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'QUEUED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: false, status: 'processed', parent_batch_id: null },
    ]);
    upminerAdapter.getBatchDossiers.mockRejectedValue(new Error('Dossier fetch failed'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('ERROR');
    expect(result?.errorMessage).toContain('Dossier fetch failed');
  });

  it('should mark as ERROR when fetch succeeds but relational persist fails', async () => {
    const { useCase, upminerRepository, upminerAdapter, upminerDossierPersistence } = createMocks();
    const existing = makeResult({ status: 'QUEUED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: false, status: 'processed', parent_batch_id: null },
    ]);
    upminerAdapter.getBatchDossiers.mockResolvedValue({ id: BATCH_ID, dossiers: [] });
    upminerDossierPersistence.persistForResult.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('ERROR');
    expect(result?.errorMessage).toContain('Dossier persist failed');
  });

  it('should transition from QUEUED to PROCESSING when batch is still running', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'QUEUED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: false, status: 'processing', parent_batch_id: null },
    ]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('PROCESSING');
    expect(upminerRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should not update when PROCESSING status is returned and result is already PROCESSING', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'PROCESSING' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: true, status: 'processing', parent_batch_id: null },
    ]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('PROCESSING');
    expect(upminerRepository.update).not.toHaveBeenCalled();
  });

  it('should mark as ERROR when API returns error status', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'QUEUED' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);
    upminerRepository.update.mockResolvedValue(undefined);

    upminerAdapter.getBatchStatus.mockResolvedValue([
      { batch_id: BATCH_ID, in_queue: false, status: 'error', parent_batch_id: null },
    ]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('ERROR');
    expect(upminerRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should return current state without marking error on network failure during poll', async () => {
    const { useCase, upminerRepository, upminerAdapter } = createMocks();
    const existing = makeResult({ status: 'PROCESSING' });
    upminerRepository.getLatestByClientId.mockResolvedValue(existing);

    upminerAdapter.getBatchStatus.mockRejectedValue(new Error('Network timeout'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result?.status).toBe('PROCESSING');
    expect(upminerRepository.update).not.toHaveBeenCalled();
  });
});
