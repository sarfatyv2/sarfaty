import { PepAdapter } from './pep.adapter';

const CSV_DATA = [
  'CPF;Nome;Funcao;Orgao;DataInicio;DataFim',
  '12345678901;JOAO SILVA;Diretor;Ministerio X;01/01/2020;',
  '98765432100;MARIA SANTOS;Secretaria;Ministerio Y;15/03/2019;31/12/2022',
  '11122233344;PEDRO OLIVEIRA;Assessor;Presidencia;01/06/2021;',
].join('\n');

describe('PepAdapter', () => {
  let adapter: PepAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new PepAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return empty when PEP data download fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await adapter.checkCpfs([
      { cpf: '12345678901', name: 'Joao' },
    ]);

    expect(result).toEqual([]);
  });

  it('should return empty when fetch throws a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await adapter.checkCpfs([
      { cpf: '12345678901', name: 'Joao' },
    ]);

    expect(result).toEqual([]);
  });

  it('should match CPFs correctly from CSV data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(CSV_DATA),
    });

    const result = await adapter.checkCpfs([
      { cpf: '12345678901', name: 'Joao Silva' },
      { cpf: '98765432100', name: 'Maria Santos' },
    ]);

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      cpf: '12345678901',
      nome: 'JOAO SILVA',
      funcao: 'Diretor',
      orgao: 'Ministerio X',
      dataInicio: '01/01/2020',
      dataFim: null,
    });

    expect(result[1]).toEqual({
      cpf: '98765432100',
      nome: 'MARIA SANTOS',
      funcao: 'Secretaria',
      orgao: 'Ministerio Y',
      dataInicio: '15/03/2019',
      dataFim: '31/12/2022',
    });
  });

  it('should return no match for CPFs not in dataset', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(CSV_DATA),
    });

    const result = await adapter.checkCpfs([
      { cpf: '00000000000', name: 'Unknown Person' },
      { cpf: '99999999999', name: 'Another Unknown' },
    ]);

    expect(result).toEqual([]);
  });

  it('should strip non-digit characters from CPFs before matching', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(CSV_DATA),
    });

    const result = await adapter.checkCpfs([
      { cpf: '123.456.789-01', name: 'Joao Silva' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.cpf).toBe('12345678901');
  });

  it('should use cached data on subsequent calls (no additional fetch)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(CSV_DATA),
    });

    await adapter.checkCpfs([{ cpf: '12345678901', name: 'Joao' }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await adapter.checkCpfs([{ cpf: '98765432100', name: 'Maria' }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle empty CSV gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('CPF;Nome;Funcao;Orgao;DataInicio;DataFim\n'),
    });

    const result = await adapter.checkCpfs([
      { cpf: '12345678901', name: 'Joao' },
    ]);

    expect(result).toEqual([]);
  });

  it('should return empty array when called with empty CPF list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(CSV_DATA),
    });

    const result = await adapter.checkCpfs([]);
    expect(result).toEqual([]);
  });
});
