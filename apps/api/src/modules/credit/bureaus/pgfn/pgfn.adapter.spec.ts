import { PgfnAdapter } from './pgfn.adapter';

describe('PgfnAdapter', () => {
  let adapter: PgfnAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new PgfnAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return found=false when API returns empty array', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result).toEqual({
      found: false,
      totalDebtAmount: null,
      debtCount: 0,
      rawEntries: [],
    });
  });

  it('should return found=false when API returns object with empty resultados', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ resultados: [] }),
    });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result).toEqual({
      found: false,
      totalDebtAmount: null,
      debtCount: 0,
      rawEntries: [],
    });
  });

  it('should return found=true with debt totals when data exists (array response)', async () => {
    const entries = [
      { valorConsolidado: '15000.50' },
      { valorConsolidado: '8000.00' },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(entries),
    });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.found).toBe(true);
    expect(result.totalDebtAmount).toBeCloseTo(23000.5);
    expect(result.debtCount).toBe(2);
    expect(result.rawEntries).toEqual(entries);
  });

  it('should return found=true with debt totals when data exists (object with resultados)', async () => {
    const entries = [
      { valorConsolidado: '5000.00', valor: '5000.00' },
      { valorConsolidado: '3000.00', valor: '3000.00' },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ resultados: entries }),
    });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.found).toBe(true);
    expect(result.totalDebtAmount).toBeCloseTo(8000);
    expect(result.debtCount).toBe(2);
  });

  it('should handle entries with no valid debt values', async () => {
    const entries = [
      { valorConsolidado: 'invalid' },
      { descricao: 'some entry without value' },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(entries),
    });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.found).toBe(true);
    expect(result.totalDebtAmount).toBeNull();
    expect(result.debtCount).toBe(2);
  });

  it('should strip non-digit characters from CNPJ', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await adapter.queryByCnpj('12.345.678/0001-90');

    const url = mockFetch.mock.calls[0]![0] as string;
    expect(url).toContain('cpfCnpj=12345678000190');
  });

  it('should return found=false on API error status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result).toEqual({
      found: false,
      totalDebtAmount: null,
      debtCount: 0,
      rawEntries: [],
    });
  });

  it('should return found=false on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result).toEqual({
      found: false,
      totalDebtAmount: null,
      debtCount: 0,
      rawEntries: [],
    });
  });
});
