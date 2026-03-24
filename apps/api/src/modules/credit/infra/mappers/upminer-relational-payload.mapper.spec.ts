import { UpminerRelationalPayloadMapper } from './upminer-relational-payload.mapper';

describe('UpminerRelationalPayloadMapper', () => {
  it('parseReceitaFederalPj maps main fields and secundarias', () => {
    const parsed = UpminerRelationalPayloadMapper.parseReceitaFederalPj({
      cnpj: '12.345.678/0001-90',
      tipo: 'MATRIZ',
      data_abertura: '01/01/2020',
      nome_empresarial: 'ACME LTDA',
      nome_fantasia: 'ACME',
      atividade_economica_principal: '47.11-3-01',
      aAtividadeSecundaria: [
        { codigo: '01', descricao: 'Sec A' },
        { codigo: '02', descricao: 'Sec B' },
      ],
    });
    expect(parsed).not.toBeNull();
    expect(parsed!.receita.cnpj).toBe('12.345.678/0001-90');
    expect(parsed!.receita.nomeEmpresarial).toBe('ACME LTDA');
    expect(parsed!.secundarias).toHaveLength(2);
    expect(parsed!.secundarias[0]?.ordem).toBe(0);
    expect(parsed!.secundarias[1]?.codigo).toBe('02');
  });

  it('parseBaseEmpresas maps qsa and socios', () => {
    const parsed = UpminerRelationalPayloadMapper.parseBaseEmpresas({
      cnpj: '123',
      razao_social: 'X',
      aSocio: [{ cpf_cnpj: '000', nome: 'João', qualificacao: 'Sócio' }],
    });
    expect(parsed).not.toBeNull();
    expect(parsed!.qsa.razaoSocial).toBe('X');
    expect(parsed!.socios).toHaveLength(1);
    expect(parsed!.socios[0]?.nome).toBe('João');
  });

  it('parseCade maps processos protocolos and andamentos', () => {
    const parsed = UpminerRelationalPayloadMapper.parseCade([
      {
        estado: 'R',
        id: '41863',
        dados: {
          autuacao: {
            processo: 'P1',
            tipo: 'T1',
            data_registro: '01/01/2012',
            interessados: ['A', 'B'],
            resumo_int: 'R1',
          },
          protocolos: [{ doc_processo: 'D1', link_pdf: 'https://x' }],
          andamentos: [{ data_hora: 'h1', descricao: 'd1' }],
        },
      },
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.apiRowId).toBe('41863');
    expect(parsed[0]?.processo).toBe('P1');
    expect(parsed[0]?.interessados).toEqual(['A', 'B']);
    expect(parsed[0]?.protocolos).toHaveLength(1);
    expect(parsed[0]?.protocolos[0]?.linkPdf).toBe('https://x');
    expect(parsed[0]?.andamentos).toHaveLength(1);
    expect(parsed[0]?.andamentos[0]?.descricao).toBe('d1');
  });

  it('parseCade returns empty array for non-array payload', () => {
    expect(UpminerRelationalPayloadMapper.parseCade({})).toEqual([]);
  });
});
