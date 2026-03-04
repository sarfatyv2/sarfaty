vi.mock('../../../../config/env', () => ({ env: { CGU_API_KEY: 'test-key' } }));

import { CguAdapter } from './cgu.adapter';

describe('CguAdapter', () => {
  let adapter: CguAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new CguAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('checkAll', () => {
    it('should call all 3 endpoints in parallel and return results', async () => {
      const ceisData = [{ id: 1, sancionado: 'Test CEIS' }];
      const cnepData = [{ id: 2, sancionado: 'Test CNEP' }];
      const cepimData = [{ id: 3, sancionado: 'Test CEPIM' }];

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/ceis?')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(ceisData) });
        }
        if (url.includes('/cnep?')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(cnepData) });
        }
        if (url.includes('/cepim?')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(cepimData) });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await adapter.checkAll('12345678000190');

      expect(result.ceis).toEqual(ceisData);
      expect(result.cnep).toEqual(cnepData);
      expect(result.cepim).toEqual(cepimData);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should strip non-digit characters from CNPJ', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

      await adapter.checkAll('12.345.678/0001-90');

      for (const call of mockFetch.mock.calls) {
        const url = call[0] as string;
        const paramValue = new URL(url).searchParams.get('cnpjSancionado');
        expect(paramValue).toBe('12345678000190');
      }
    });

    it('should return empty arrays when one endpoint fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/ceis?')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1 }]) });
        }
        return Promise.reject(new Error('Network error'));
      });

      const result = await adapter.checkAll('12345678000190');

      expect(result.ceis).toEqual([{ id: 1 }]);
      expect(result.cnep).toEqual([]);
      expect(result.cepim).toEqual([]);
    });
  });

  describe('checkCeis', () => {
    it('should return parsed results when API returns data', async () => {
      const data = [{ id: 1, tipo: 'CEIS' }];
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });

      const result = await adapter.checkCeis('12345678000190');

      expect(result).toEqual(data);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ceis?cnpjSancionado=12345678000190'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'chave-api-dados': 'test-key' }),
        }),
      );
    });

    it('should return empty array when API returns non-array', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ message: 'not an array' }) });

      const result = await adapter.checkCeis('12345678000190');
      expect(result).toEqual([]);
    });

    it('should return empty array on API error status', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      const result = await adapter.checkCeis('12345678000190');
      expect(result).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await adapter.checkCeis('12345678000190');
      expect(result).toEqual([]);
    });
  });

  describe('when CGU_API_KEY is empty', () => {
    it('should return empty arrays for all endpoints', async () => {
      const { env } = await import('../../../../config/env');
      const original = env.CGU_API_KEY;
      (env as any).CGU_API_KEY = '';

      const result = await adapter.checkAll('12345678000190');

      expect(result).toEqual({ ceis: [], cnep: [], cepim: [] });
      expect(mockFetch).not.toHaveBeenCalled();

      (env as any).CGU_API_KEY = original;
    });
  });
});
