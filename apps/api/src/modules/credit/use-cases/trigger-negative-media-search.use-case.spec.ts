import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TriggerNegativeMediaSearchUseCase } from './trigger-negative-media-search.use-case';

const CLIENT_ID = 'client-789';

function createMockClient(overrides: Record<string, unknown> = {}) {
  return {
    id: CLIENT_ID,
    companyName: 'Acme Corp LTDA',
    cnpj: '12345678000190',
    tradeName: 'Acme',
    ...overrides,
  };
}

function createMockSearchResult(overrides: Record<string, unknown> = {}) {
  return {
    riskLevel: 'CLEAR' as const,
    findings: [],
    findingsCount: 0,
    summary: 'Nenhuma menção negativa encontrada.',
    groundingSources: [{ uri: 'https://example.com', title: 'Example' }],
    rawResponse: {},
    ...overrides,
  };
}

function createMocks() {
  return {
    clientRepo: {
      findById: vi.fn(),
    },
    negativeMediaAdapter: {
      search: vi.fn(),
    },
    negativeMediaRepo: {
      save: vi.fn(),
      getLatestByClientId: vi.fn(),
      getAllByClientId: vi.fn(),
    },
  };
}

function buildUseCase(mocks: ReturnType<typeof createMocks>) {
  return new TriggerNegativeMediaSearchUseCase(
    mocks.clientRepo as any,
    mocks.negativeMediaAdapter as any,
    mocks.negativeMediaRepo as any,
  );
}

describe('TriggerNegativeMediaSearchUseCase', () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: TriggerNegativeMediaSearchUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = buildUseCase(mocks);
  });

  it('should throw NotFoundException when client does not exist', async () => {
    mocks.clientRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(CLIENT_ID)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when client has no CNPJ', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient({ cnpj: null }));

    await expect(useCase.execute(CLIENT_ID)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when client has no companyName', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient({ companyName: '' }));

    await expect(useCase.execute(CLIENT_ID)).rejects.toThrow(BadRequestException);
  });

  it('should call adapter.search with correct parameters', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient());
    mocks.negativeMediaAdapter.search.mockResolvedValue(createMockSearchResult());

    await useCase.execute(CLIENT_ID);

    expect(mocks.negativeMediaAdapter.search).toHaveBeenCalledWith('Acme Corp LTDA', '12345678000190', 'Acme');
  });

  it('should save the result to the repository', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient());
    mocks.negativeMediaAdapter.search.mockResolvedValue(createMockSearchResult());

    await useCase.execute(CLIENT_ID);

    expect(mocks.negativeMediaRepo.save).toHaveBeenCalledTimes(1);
    const savedEntity = mocks.negativeMediaRepo.save.mock.calls[0][0];
    expect(savedEntity.clientId).toBe(CLIENT_ID);
    expect(savedEntity.riskLevel).toBe('CLEAR');
    expect(savedEntity.cnpj).toBe('12345678000190');
    expect(savedEntity.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('should return formatted result with all fields', async () => {
    const searchResult = createMockSearchResult({
      riskLevel: 'HIGH',
      findingsCount: 1,
      findings: [{
        category: 'fraude',
        title: 'Empresa investigada',
        snippet: 'Investigação em andamento',
        sourceUrl: 'https://news.example.com',
        sourceName: 'Portal Notícias',
        date: '2024-06-01',
      }],
      summary: 'Empresa com histórico de fraude.',
      groundingSources: [{ uri: 'https://news.example.com', title: 'Notícia' }],
    });

    mocks.clientRepo.findById.mockResolvedValue(createMockClient());
    mocks.negativeMediaAdapter.search.mockResolvedValue(searchResult);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.riskLevel).toBe('HIGH');
    expect(result.findingsCount).toBe(1);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].category).toBe('fraude');
    expect(result.findings[0].sourceUrl).toBe('https://news.example.com');
    expect(result.summary).toBe('Empresa com histórico de fraude.');
    expect(result.groundingSources).toHaveLength(1);
    expect(result.queriedAt).toBeDefined();
    expect(typeof result.queriedAt).toBe('string');
  });

  it('should return empty findings for CLEAR result', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient());
    mocks.negativeMediaAdapter.search.mockResolvedValue(createMockSearchResult());

    const result = await useCase.execute(CLIENT_ID);

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.findings).toEqual([]);
    expect(result.findingsCount).toBe(0);
  });

  it('should pass tradeName as null when client has no tradeName', async () => {
    mocks.clientRepo.findById.mockResolvedValue(createMockClient({ tradeName: null }));
    mocks.negativeMediaAdapter.search.mockResolvedValue(createMockSearchResult());

    await useCase.execute(CLIENT_ID);

    expect(mocks.negativeMediaAdapter.search).toHaveBeenCalledWith('Acme Corp LTDA', '12345678000190', null);
  });
});
