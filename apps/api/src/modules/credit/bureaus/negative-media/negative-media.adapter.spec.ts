vi.mock('../../../../config/env', () => ({ env: { GEMINI_API_KEY: 'test-gemini-key' } }));

import { NegativeMediaAdapter } from './negative-media.adapter';

describe('NegativeMediaAdapter', () => {
  let adapter: NegativeMediaAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new NegativeMediaAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return CLEAR result when Gemini finds no negative media', async () => {
    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              riskLevel: 'CLEAR',
              findings: [],
              summary: 'Nenhuma menção negativa encontrada para a empresa.',
            }),
          }],
        },
        groundingMetadata: { groundingChunks: [] },
      }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const result = await adapter.search('Empresa Teste LTDA', '12345678000190', 'Teste');

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.findings).toEqual([]);
    expect(result.summary).toBe('Nenhuma menção negativa encontrada para a empresa.');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect(url).toContain('key=test-gemini-key');
  });

  it('should return HIGH risk when Gemini finds fraud-related news', async () => {
    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              riskLevel: 'HIGH',
              findings: [{
                category: 'fraude',
                title: 'Empresa investigada por fraude fiscal',
                snippet: 'A empresa foi alvo de operação policial por suspeita de fraude.',
                sourceUrl: 'https://example.com/news',
                sourceName: 'Portal de Notícias',
                date: '2024-01-15',
              }],
              summary: 'Empresa envolvida em investigação de fraude fiscal.',
            }),
          }],
        },
        groundingMetadata: {
          groundingChunks: [
            { web: { uri: 'https://example.com/news', title: 'Notícia sobre fraude' } },
          ],
        },
      }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const result = await adapter.search('Empresa Investigada LTDA', '99999999000199');

    expect(result.riskLevel).toBe('HIGH');
    expect(result.findingsCount).toBe(1);
    expect(result.findings[0].category).toBe('fraude');
    expect(result.findings[0].title).toBe('Empresa investigada por fraude fiscal');
    expect(result.groundingSources).toHaveLength(1);
    expect(result.groundingSources[0].uri).toBe('https://example.com/news');
  });

  it('should handle JSON wrapped in markdown code blocks', async () => {
    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '```json\n{"riskLevel":"CLEAR","findings":[],"summary":"Nada encontrado."}\n```',
          }],
        },
        groundingMetadata: { groundingChunks: [] },
      }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const result = await adapter.search('Clean Company', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.summary).toBe('Nada encontrado.');
  });

  it('should return empty result when API key is missing', async () => {
    const { env } = await import('../../../../config/env');
    const original = env.GEMINI_API_KEY;
    (env as any).GEMINI_API_KEY = '';

    const result = await adapter.search('Test', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.findings).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();

    (env as any).GEMINI_API_KEY = original;
  });

  it('should return empty result on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const result = await adapter.search('Test', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.findings).toEqual([]);
  });

  it('should return empty result on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.search('Test', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
    expect(result.findings).toEqual([]);
  });

  it('should handle Gemini returning no candidates', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [] }),
    });

    const result = await adapter.search('Test', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
  });

  it('should validate and cap findings at 10', async () => {
    const findings = Array.from({ length: 15 }, (_, i) => ({
      category: 'outro',
      title: `Finding ${i}`,
      snippet: 'Short snippet',
      sourceUrl: null,
      sourceName: null,
      date: null,
    }));

    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({ riskLevel: 'HIGH', findings, summary: 'Lots of mentions' }),
          }],
        },
        groundingMetadata: { groundingChunks: [] },
      }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const result = await adapter.search('Test', '12345678000190');

    expect(result.findings).toHaveLength(10);
    expect(result.findingsCount).toBe(10);
  });

  it('should default invalid risk level to CLEAR', async () => {
    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({ riskLevel: 'EXTREME', findings: [], summary: '' }),
          }],
        },
        groundingMetadata: { groundingChunks: [] },
      }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const result = await adapter.search('Test', '12345678000190');

    expect(result.riskLevel).toBe('CLEAR');
  });
});
