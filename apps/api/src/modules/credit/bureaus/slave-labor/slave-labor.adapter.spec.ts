vi.mock('../../../../config/env', () => ({ env: { CGU_API_KEY: 'test-key' } }));

import { SlaveLaborAdapter } from './slave-labor.adapter';

describe('SlaveLaborAdapter', () => {
  let adapter: SlaveLaborAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new SlaveLaborAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return match data when API finds an entry', async () => {
    const apiResponse = [
      {
        nomeEmpregador: 'Empresa Teste LTDA',
        quantidadeTrabalhadores: '15',
        dataFiscalizacao: '2023-05-10',
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const result = await adapter.checkByCnpj('12345678000190');

    expect(result).toEqual({
      cnpj: '12345678000190',
      employerName: 'Empresa Teste LTDA',
      rescuedWorkers: 15,
      inspectionDate: '2023-05-10',
    });
  });

  it('should use empregador fallback field for employer name', async () => {
    const apiResponse = [
      {
        empregador: 'Fallback Employer Name',
        quantidadeTrabalhadores: '3',
        dataFiscalizacao: null,
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const result = await adapter.checkByCnpj('12345678000190');

    expect(result).toEqual({
      cnpj: '12345678000190',
      employerName: 'Fallback Employer Name',
      rescuedWorkers: 3,
      inspectionDate: null,
    });
  });

  it('should return null when API returns empty array', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await adapter.checkByCnpj('12345678000190');
    expect(result).toBeNull();
  });

  it('should return null when API returns non-200 status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.checkByCnpj('12345678000190');
    expect(result).toBeNull();
  });

  it('should return null on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.checkByCnpj('12345678000190');
    expect(result).toBeNull();
  });

  it('should strip non-digit characters from CNPJ', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await adapter.checkByCnpj('12.345.678/0001-90');

    const url = mockFetch.mock.calls[0]![0] as string;
    expect(url).toContain('cpfCnpj=12345678000190');
  });

  it('should send CGU_API_KEY in request headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await adapter.checkByCnpj('12345678000190');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'chave-api-dados': 'test-key',
        }),
      }),
    );
  });

  describe('when CGU_API_KEY is not set', () => {
    it('should return null without calling fetch', async () => {
      const { env } = await import('../../../../config/env');
      const original = env.CGU_API_KEY;
      (env as any).CGU_API_KEY = '';

      const freshAdapter = new SlaveLaborAdapter();
      const result = await freshAdapter.checkByCnpj('12345678000190');

      expect(result).toBeNull();

      (env as any).CGU_API_KEY = original;
    });
  });
});
