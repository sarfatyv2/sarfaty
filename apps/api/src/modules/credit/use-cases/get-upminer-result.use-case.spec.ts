import { UpminerResult } from '../domain/upminer-result.entity';
import { GetUpminerResultUseCase } from './get-upminer-result.use-case';

const CLIENT_ID = 'client-uuid-123';

function makeResult(id: string): UpminerResult {
  return UpminerResult.reconstruct({
    id,
    clientId: CLIENT_ID,
    document: '12345678000190',
    inputType: 2,
    searchProfileId: 100,
    batchId: 42,
    status: 'PROCESSED',
    dossiersData: { dossiers: [] },
    errorMessage: null,
    requestedAt: new Date('2024-01-01T00:00:00Z'),
    processedAt: new Date('2024-01-01T00:05:00Z'),
  });
}

describe('GetUpminerResultUseCase', () => {
  let upminerRepository: { getLatestByClientId: ReturnType<typeof vi.fn>; getByClientId: ReturnType<typeof vi.fn> };
  let useCase: GetUpminerResultUseCase;

  beforeEach(() => {
    upminerRepository = {
      getLatestByClientId: vi.fn(),
      getByClientId: vi.fn(),
    };
    useCase = new GetUpminerResultUseCase(upminerRepository as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return latest result for client', async () => {
      const expected = makeResult('result-uuid-1');
      upminerRepository.getLatestByClientId.mockResolvedValue(expected);

      const result = await useCase.execute(CLIENT_ID);

      expect(result).toBe(expected);
      expect(upminerRepository.getLatestByClientId).toHaveBeenCalledWith(CLIENT_ID);
    });

    it('should return null when no result exists', async () => {
      upminerRepository.getLatestByClientId.mockResolvedValue(null);

      const result = await useCase.execute(CLIENT_ID);

      expect(result).toBeNull();
    });
  });

  describe('executeAll', () => {
    it('should return all results for client ordered by most recent first', async () => {
      const results = [makeResult('result-uuid-2'), makeResult('result-uuid-1')];
      upminerRepository.getByClientId.mockResolvedValue(results);

      const all = await useCase.executeAll(CLIENT_ID);

      expect(all).toHaveLength(2);
      expect(all[0]?.id).toBe('result-uuid-2');
      expect(upminerRepository.getByClientId).toHaveBeenCalledWith(CLIENT_ID);
    });

    it('should return empty array when no history exists', async () => {
      upminerRepository.getByClientId.mockResolvedValue([]);

      const all = await useCase.executeAll(CLIENT_ID);

      expect(all).toEqual([]);
    });
  });
});
