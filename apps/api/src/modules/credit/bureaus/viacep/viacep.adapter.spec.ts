import { ViacepAdapter } from './viacep.adapter';

describe('ViacepAdapter', () => {
  let adapter: ViacepAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new ViacepAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return null for CEP with less than 8 digits', async () => {
    const result = await adapter.queryCep('1234');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return null for CEP with more than 8 digits', async () => {
    const result = await adapter.queryCep('123456789');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should strip non-digit characters and validate length', async () => {
    await adapter.queryCep('01310-100');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/01310100/json/'),
      expect.any(Object),
    );
  });

  it('should return data for valid CEP', async () => {
    const viacepResponse = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      unidade: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
      estado: 'São Paulo',
      regiao: 'Sudeste',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(viacepResponse),
    });

    const result = await adapter.queryCep('01310100');

    expect(result).toEqual(viacepResponse);
  });

  it('should return null when API returns { erro: true }', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ erro: true }),
    });

    const result = await adapter.queryCep('00000000');
    expect(result).toBeNull();
  });

  it('should return null when API returns non-200 status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.queryCep('01310100');
    expect(result).toBeNull();
  });

  it('should return null on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.queryCep('01310100');
    expect(result).toBeNull();
  });
});
