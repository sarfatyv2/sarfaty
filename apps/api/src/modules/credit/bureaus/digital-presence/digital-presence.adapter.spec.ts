import { DigitalPresenceAdapter } from './digital-presence.adapter';
import * as dns from 'node:dns/promises';

vi.mock('node:dns/promises', () => ({
  resolve: vi.fn(),
}));

describe('DigitalPresenceAdapter', () => {
  let adapter: DigitalPresenceAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new DigitalPresenceAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.mocked(dns.resolve).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should classify corporate email with active site', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><head><title>Empresa LTDA - Site Oficial</title></head></html>'),
    });

    const result = await adapter.check('contato@empresa.com.br');

    expect(result.domain).toBe('empresa.com.br');
    expect(result.emailType).toBe('corporate');
    expect(result.hasDns).toBe(true);
    expect(result.hasActiveSite).toBe(true);
    expect(result.siteTitle).toBe('Empresa LTDA - Site Oficial');
  });

  it('should classify free email (gmail)', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><head><title>Google</title></head></html>'),
    });

    const result = await adapter.check('joao@gmail.com');

    expect(result.domain).toBe('gmail.com');
    expect(result.emailType).toBe('free');
    expect(result.hasDns).toBe(true);
  });

  it('should classify free email (hotmail)', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

    const result = await adapter.check('user@hotmail.com');
    expect(result.emailType).toBe('free');
  });

  it('should classify free email (uol)', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

    const result = await adapter.check('user@uol.com.br');
    expect(result.emailType).toBe('free');
  });

  it('should handle domain with no DNS records', async () => {
    vi.mocked(dns.resolve).mockRejectedValue(new Error('ENOTFOUND'));

    const result = await adapter.check('contato@inexistent-domain-xyz.com.br');

    expect(result.domain).toBe('inexistent-domain-xyz.com.br');
    expect(result.hasDns).toBe(false);
    expect(result.hasActiveSite).toBe(false);
  });

  it('should handle site returning non-200 status', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const result = await adapter.check('contato@empresa.com.br');

    expect(result.hasDns).toBe(true);
    expect(result.hasActiveSite).toBe(false);
    expect(result.siteTitle).toBeNull();
  });

  it('should fallback to HTTP when HTTPS fails', async () => {
    vi.mocked(dns.resolve).mockResolvedValue(['1.2.3.4'] as any);

    let callCount = 0;
    mockFetch.mockImplementation((url: string) => {
      callCount++;
      if (url.startsWith('https://')) {
        return Promise.reject(new Error('SSL error'));
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<html><head><title>HTTP Site</title></head></html>'),
      });
    });

    const result = await adapter.check('contato@empresa.com.br');

    expect(result.hasActiveSite).toBe(true);
    expect(result.siteTitle).toBe('HTTP Site');
    expect(callCount).toBe(2);
  });

  it('should return empty result for invalid email', async () => {
    const result = await adapter.check('invalidemail');

    expect(result.domain).toBeNull();
    expect(result.emailType).toBe('unknown');
    expect(result.hasDns).toBe(false);
    expect(result.hasActiveSite).toBe(false);
  });

  it('should handle DNS resolve returning via CNAME fallback', async () => {
    vi.mocked(dns.resolve).mockImplementation((_domain: string, type?: string) => {
      if (type === 'A') return Promise.reject(new Error('ENODATA'));
      if (type === 'CNAME') return Promise.resolve(['alias.example.com'] as any);
      return Promise.reject(new Error('ENODATA'));
    });

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<title>Test</title>'),
    });

    const result = await adapter.check('test@empresa-cname.com.br');

    expect(result.hasDns).toBe(true);
  });
});
