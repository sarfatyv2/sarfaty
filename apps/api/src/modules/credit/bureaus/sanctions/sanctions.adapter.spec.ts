import { SanctionsAdapter } from './sanctions.adapter';

const SDN_CSV = [
  '1001,"ACME CORP",Entity,"SDGT"',
  '1002,"GLOBEX CORPORATION",Entity,"CUBA"',
  '1003,"EVIL INDUSTRIES LTD",Entity,"IRAN"',
  '1004,"SOYLENT GREEN INC",Entity,"SYRIA"',
].join('\n');

describe('SanctionsAdapter', () => {
  let adapter: SanctionsAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new SanctionsAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return empty when OFAC data is unavailable (non-200)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.screenEntity('Some Company');
    expect(result).toEqual([]);
  });

  it('should return empty when fetch throws a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.screenEntity('Some Company');
    expect(result).toEqual([]);
  });

  it('should return empty when companyName is empty string', async () => {
    const result = await adapter.screenEntity('');
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should match exact company name with score 1.0', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    const result = await adapter.screenEntity('ACME CORP');

    expect(result.length).toBeGreaterThanOrEqual(1);
    const match = result.find(m => m.matchedName === 'ACME CORP');
    expect(match).toBeDefined();
    expect(match?.score).toBe(1);
    expect(match?.source).toBe('OFAC');
    expect(match?.entitySearched).toBe('ACME CORP');
  });

  it('should match similar name above threshold (>=0.85)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    const result = await adapter.screenEntity('ACME CORPP');

    const match = result.find(m => m.matchedName === 'ACME CORP');
    expect(match).toBeDefined();
    expect(match?.score).toBeGreaterThanOrEqual(0.85);
  });

  it('should NOT match dissimilar names (below 0.85 threshold)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    const result = await adapter.screenEntity('Totally Different Company Name XYZ');

    expect(result).toEqual([]);
  });

  it('should check both companyName and tradeName', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    const result = await adapter.screenEntity('Innocent Company', 'ACME CORP');

    const matchByTrade = result.find(
      m => m.entitySearched === 'ACME CORP' && m.matchedName === 'ACME CORP',
    );
    expect(matchByTrade).toBeDefined();
    expect(matchByTrade?.score).toBe(1);
  });

  it('should not check tradeName when it is null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    const result = await adapter.screenEntity('Innocent Company', null);
    expect(result).toEqual([]);
  });

  it('should use cached data on subsequent calls', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SDN_CSV),
    });

    await adapter.screenEntity('ACME CORP');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await adapter.screenEntity('GLOBEX CORPORATION');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  describe('Levenshtein distance correctness', () => {
    it('should compute distance 0 for identical strings', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(SDN_CSV),
      });

      const result = await adapter.screenEntity('GLOBEX CORPORATION');

      const match = result.find(m => m.matchedName === 'GLOBEX CORPORATION');
      expect(match).toBeDefined();
      expect(match?.score).toBe(1);
    });

    it('should compute distance 1 for single-character difference and score >= 0.85', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('1001,"ABCDEFGH",Entity,"TEST"\n'),
      });

      const result = await adapter.screenEntity('ABCDEFGI');

      const match = result.find(m => m.matchedName === 'ABCDEFGH');
      expect(match).toBeDefined();
      expect(match?.score).toBe(0.875);
    });

    it('should reject names where distance makes score < 0.85', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('1001,"ABCDE",Entity,"TEST"\n'),
      });

      const result = await adapter.screenEntity('XYZWV');
      expect(result).toEqual([]);
    });
  });
});
