import { NotFoundException } from '@nestjs/common';
import { RequestUpminerBatchUseCase } from './request-upminer-batch.use-case';

vi.mock('../../../database/database.module', () => ({ DRIZZLE: 'DRIZZLE' }));

const CLIENT_ID = 'client-uuid-123';
const CNPJ = '12345678000190';
const BATCH_ID = 42;

function createMocks() {
  const db = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  };

  const upminerAdapter = {
    checkDuplicates: vi.fn(),
    createBatch: vi.fn(),
    addBatchToQueue: vi.fn(),
  };

  const upminerRepository = {
    save: vi.fn(),
    update: vi.fn(),
    getLatestByClientId: vi.fn(),
    getByBatchId: vi.fn(),
    getByClientId: vi.fn(),
    getPending: vi.fn(),
  };

  const useCase = new RequestUpminerBatchUseCase(
    db as any,
    upminerRepository as any,
    upminerAdapter as any,
  );

  return { useCase, db, upminerAdapter, upminerRepository };
}

describe('RequestUpminerBatchUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create batch, add to queue and save result as QUEUED', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: CNPJ }]);
    upminerAdapter.createBatch.mockResolvedValue({ batchID: BATCH_ID });
    upminerAdapter.addBatchToQueue.mockResolvedValue({ message: 'OK' });
    upminerRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID, { searchProfileId: 100 });

    expect(result.status).toBe('QUEUED');
    expect(result.batchId).toBe(BATCH_ID);
    expect(result.clientId).toBe(CLIENT_ID);
    expect(result.document).toBe(CNPJ);
    expect(result.inputType).toBe(2);
    expect(result.searchProfileId).toBe(100);
    expect(upminerRepository.save).toHaveBeenCalledTimes(1);
    expect(upminerAdapter.addBatchToQueue).toHaveBeenCalledWith(BATCH_ID);
  });

  it('should strip non-digits from CNPJ before sending to API', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: '12.345.678/0001-90' }]);
    upminerAdapter.createBatch.mockResolvedValue({ batchID: BATCH_ID });
    upminerAdapter.addBatchToQueue.mockResolvedValue({ message: 'OK' });
    upminerRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.document).toBe('12345678000190');
    const [createBatchArg] = upminerAdapter.createBatch.mock.calls[0] as [{ inputs: string[] }][];
    expect(createBatchArg.inputs[0]).toBe('12345678000190');
  });

  it('should throw NotFoundException when client does not exist', async () => {
    const { useCase, db } = createMocks();

    db.execute.mockResolvedValue([]);

    await expect(useCase.execute(CLIENT_ID)).rejects.toThrow(NotFoundException);
  });

  it('should throw when client has no CNPJ', async () => {
    const { useCase, db } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: null }]);

    await expect(useCase.execute(CLIENT_ID)).rejects.toThrow('does not have a CNPJ');
  });

  it('should save result as ERROR when createBatch throws', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: CNPJ }]);
    upminerAdapter.createBatch.mockRejectedValue(new Error('API unavailable'));
    upminerRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.status).toBe('ERROR');
    expect(result.errorMessage).toContain('API unavailable');
    expect(upminerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should continue after addBatchToQueue fails (non-fatal)', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: CNPJ }]);
    upminerAdapter.createBatch.mockResolvedValue({ batchID: BATCH_ID });
    upminerAdapter.addBatchToQueue.mockRejectedValue(new Error('Queue error'));
    upminerRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.status).toBe('QUEUED');
    expect(result.batchId).toBe(BATCH_ID);
    expect(upminerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call checkDuplicates when flag is set', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: CNPJ }]);
    upminerAdapter.checkDuplicates.mockResolvedValue({ total_batches: 1, duplicity_days: 30, batches: [], upflags: [] });
    upminerAdapter.createBatch.mockResolvedValue({ batchID: BATCH_ID });
    upminerAdapter.addBatchToQueue.mockResolvedValue({ message: 'OK' });
    upminerRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(CLIENT_ID, { checkDuplicates: true });

    expect(upminerAdapter.checkDuplicates).toHaveBeenCalledWith({ criterions: [CNPJ] });
    expect(result.status).toBe('QUEUED');
  });

  it('should not call checkDuplicates when flag is not set', async () => {
    const { useCase, db, upminerAdapter, upminerRepository } = createMocks();

    db.execute.mockResolvedValue([{ cnpj: CNPJ }]);
    upminerAdapter.createBatch.mockResolvedValue({ batchID: BATCH_ID });
    upminerAdapter.addBatchToQueue.mockResolvedValue({ message: 'OK' });
    upminerRepository.save.mockResolvedValue(undefined);

    await useCase.execute(CLIENT_ID);

    expect(upminerAdapter.checkDuplicates).not.toHaveBeenCalled();
  });
});
