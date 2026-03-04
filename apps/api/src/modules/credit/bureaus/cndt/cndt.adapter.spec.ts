import { CndtAdapter } from './cndt.adapter';

describe('CndtAdapter', () => {
  let adapter: CndtAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new CndtAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return UNAVAILABLE when portal page contains captcha', async () => {
    const html = `
      <html><body>
        <script src="https://www.google.com/recaptcha/api.js"></script>
        <form id="gerarCertidaoForm">
          <input id="idCampoResposta" />
        </form>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toContain('CAPTCHA');
    expect(result.certificateNumber).toBeNull();
    expect(result.validUntil).toBeNull();
    expect(result.rawHtml).toBe('');
  });

  it('should return UNAVAILABLE when portal page contains idCampoResposta captcha', async () => {
    const html = `
      <html><body>
        <input id="idCampoResposta" name="resposta" />
        <input name="tokenDesafio" id="tokenDesafio" type="hidden"/>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toContain('CAPTCHA');
  });

  it('should parse "Certidão Negativa" when page has no captcha', async () => {
    const html = `
      <html><body>
        <p>Certidão Negativa de Débitos Trabalhistas</p>
        <p>Certidão nº: CNDT-2024-00123</p>
        <p>Validade: 15/06/2025</p>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('NEGATIVE');
    expect(result.certificateNumber).toBe('CNDT-2024-00123');
    expect(result.validUntil).toBe('15/06/2025');
    expect(result.reason).toBeNull();
    expect(result.rawHtml).toBe(html);
  });

  it('should parse "positiva com efeito de negativa" as POSITIVE_WITH_EFFECTS', async () => {
    const html = `
      <html><body>
        <p>Certidão Positiva com Efeito de Negativa</p>
        <p>Certidão número: TST-2024-789</p>
        <p>Validade: 20/03/2025</p>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('POSITIVE_WITH_EFFECTS');
    expect(result.certificateNumber).toBe('TST-2024-789');
    expect(result.validUntil).toBe('20/03/2025');
  });

  it('should parse "positiva com efeitos de negativa" variant as POSITIVE_WITH_EFFECTS', async () => {
    const html = '<p>Certidão Positiva com Efeitos de Negativa</p>';

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('POSITIVE_WITH_EFFECTS');
  });

  it('should parse "Certidão Positiva" (without "efeito") as POSITIVE', async () => {
    const html = `
      <html><body>
        <p>Certidão Positiva de Débitos Trabalhistas</p>
        <p>Certidão n°: POS-2024-456</p>
        <p>Validade: 10/12/2025</p>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('POSITIVE');
    expect(result.certificateNumber).toBe('POS-2024-456');
  });

  it('should return UNKNOWN for unrecognizable HTML without captcha', async () => {
    const html = '<html><body><p>Something completely different</p></body></html>';

    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('UNKNOWN');
    expect(result.certificateNumber).toBeNull();
    expect(result.validUntil).toBeNull();
  });

  it('should return UNAVAILABLE on non-200 response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toContain('indisponível');
    expect(result.rawHtml).toBe('');
  });

  it('should return UNAVAILABLE on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const result = await adapter.queryByCnpj('12345678000190');

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toContain('Erro');
    expect(result.rawHtml).toBe('');
  });

  it('should call portal URL (gerarCertidao.faces)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<p>Certidão Negativa</p>'),
    });

    await adapter.queryByCnpj('12.345.678/0001-90');

    const url = mockFetch.mock.calls[0]![0] as string;
    expect(url).toBe('https://cndt-certidao.tst.jus.br/gerarCertidao.faces');
  });
});
