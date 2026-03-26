function str(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function num(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && value.trim() !== '') return value;
  return null;
}

export interface EmpresaPjInsertShape {
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  matriz: string | null;
  dataAbertura: string | null;
  situacaoCadastral: string | null;
  dataSituacao: string | null;
  naturezaJuridicaCodigo: string | null;
  naturezaJuridicaDescricao: string | null;
  tipoCnae: string | null;
  cnae: string | null;
  cnaeSegmento: string | null;
  cnaeDescricao: string | null;
  dominio: string | null;
  catchall: string | null;
  optanteSimples: string | null;
  numeroFiliais: number | null;
  capitalSocial: string | null;
  porte: string | null;
  setor: string | null;
  faixaFuncionarios: string | null;
  faturamentoAnualEstimado: string | null;
  tipo: string | null;
  tipoEstabelecimento: string | null;
  operacionalidade: string | null;
  motivoSituacao: string | null;
  classeRisco: string | null;
  ultimaAtualizacao: string | null;
  dataConsulta: string | null;
}

export interface EmpresaPjEnderecoInsertShape {
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  ibge: string | null;
  logradouroTipo: string | null;
  logradouroNumero: string | null;
  logradouroComplemento: string | null;
  logradouro: string | null;
  latitude: string | null;
  longitude: string | null;
  ultimaAtualizacao: string | null;
}

export interface EmpresaPjTelefoneInsertShape {
  cnpj: string | null;
  apiId: string | null;
  dataLog: string | null;
  ddd: string | null;
  descricao: string | null;
  telefone: string | null;
  telefoneComDdd: string | null;
  rank: string | null;
}

export interface EmpresaPjEmailInsertShape {
  enderecoEmail: string | null;
  ultimaAtualizacao: string | null;
}

export interface EmpresaPjSocioInsertShape {
  documentoSocio: string | null;
  nome: string | null;
  tipoSocio: string | null;
  qualificacao: string | null;
  participacao: string | null;
  dataEntrada: string | null;
  dataCad: string | null;
  dataAlt: string | null;
  ano: string | null;
}

export interface EmpresaPjAtividadeSecundariaInsertShape {
  codigo: string | null;
  descricao: string | null;
}

export interface EmpresaPjSimplesNacionalInsertShape {
  cnpj: string | null;
  dataConsulta: string | null;
  statusSimplesNacional: string | null;
  statusSimei: string | null;
  dataSimplesNacional: string | null;
  dataSimei: string | null;
}

export interface ParsedEmpresaPj {
  empresa: EmpresaPjInsertShape;
  enderecos: EmpresaPjEnderecoInsertShape[];
  telefones: EmpresaPjTelefoneInsertShape[];
  emails: EmpresaPjEmailInsertShape[];
  socios: EmpresaPjSocioInsertShape[];
  atividadesSecundarias: EmpresaPjAtividadeSecundariaInsertShape[];
  simplesNacional: EmpresaPjSimplesNacionalInsertShape[];
}

export class UpminerEmpresaPjMapper {
  static parse(payload: unknown): ParsedEmpresaPj | null {
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;

    const o = payload as Record<string, unknown>;

    const empresa = UpminerEmpresaPjMapper.parseEmpresa(o);
    const enderecos = UpminerEmpresaPjMapper.parseEnderecos(o);
    const telefones = UpminerEmpresaPjMapper.parseTelefones(o);
    const emails = UpminerEmpresaPjMapper.parseEmails(o);
    const socios = UpminerEmpresaPjMapper.parseSocios(o);
    const atividadesSecundarias = UpminerEmpresaPjMapper.parseAtividadesSecundarias(o);
    const simplesNacional = UpminerEmpresaPjMapper.parseSimplesNacional(o);

    return { empresa, enderecos, telefones, emails, socios, atividadesSecundarias, simplesNacional };
  }

  private static parseEmpresa(o: Record<string, unknown>): EmpresaPjInsertShape {
    return {
      cnpj: str(o.cnpj),
      razaoSocial: str(o.razaoSocial),
      nomeFantasia: str(o.nomeFantasia),
      matriz: str(o.matriz),
      dataAbertura: str(o.dataAbertura),
      situacaoCadastral: str(o.situacaoCadastral),
      dataSituacao: str(o.dataSituacao),
      naturezaJuridicaCodigo: str(o.naturezaJuridicaCodigo),
      naturezaJuridicaDescricao: str(o.naturezaJuridicaDescricao),
      tipoCnae: str(o.tipoCnae),
      cnae: str(o.cnae),
      cnaeSegmento: str(o.cnaeSegmento),
      cnaeDescricao: str(o.cnaeDescricao),
      dominio: str(o.dominio),
      catchall: str(o.catchall),
      optanteSimples: str(o.optanteSimples),
      numeroFiliais: typeof o.numeroFiliais === 'number' ? o.numeroFiliais : null,
      capitalSocial: num(o.capitalSocial),
      porte: str(o.porte),
      setor: str(o.setor),
      faixaFuncionarios: str(o.faixaFuncionarios),
      faturamentoAnualEstimado: str(o.faturamentoAnualEstimado),
      tipo: str(o.tipo),
      tipoEstabelecimento: str(o.tipoEstabelecimento),
      operacionalidade: str(o.operacionalidade),
      motivoSituacao: str(o.motivoSituacao),
      classeRisco: str(o.classeRisco),
      ultimaAtualizacao: str(o.ultimaAtualizacao),
      dataConsulta: str(o.dataConsulta),
    };
  }

  private static parseEnderecos(o: Record<string, unknown>): EmpresaPjEnderecoInsertShape[] {
    if (!Array.isArray(o.enderecos)) return [];
    return o.enderecos
      .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
      .map((r) => ({
        bairro: str(r.Bairro),
        cidade: str(r.Cidade),
        uf: str(r.UF),
        cep: str(r.CEP),
        ibge: str(r.IBGE),
        logradouroTipo: str(r.LogradouroTipo),
        logradouroNumero: str(r.LogradouroNumero),
        logradouroComplemento: str(r.LogradouroComplemento),
        logradouro: str(r.Logradouro),
        latitude: num(r.Latitude),
        longitude: num(r.Longitude),
        ultimaAtualizacao: str(r.UltimaAtualizacao),
      }));
  }

  private static parseTelefones(o: Record<string, unknown>): EmpresaPjTelefoneInsertShape[] {
    if (!Array.isArray(o.telefones)) return [];
    return o.telefones
      .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === 'object')
      .map((r) => ({
        cnpj: str(r.CNPJ),
        apiId: str(r.ID),
        dataLog: str(r.DataLog),
        ddd: str(r.DDD),
        descricao: str(r.Descricao),
        telefone: str(r.Telefone),
        telefoneComDdd: str(r.TelefoneComDDD),
        rank: str(r.Rank),
      }));
  }

  private static parseEmails(o: Record<string, unknown>): EmpresaPjEmailInsertShape[] {
    if (!Array.isArray(o.emails)) return [];
    return o.emails
      .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
      .map((r) => ({
        enderecoEmail: str(r.EnderecoEmail),
        ultimaAtualizacao: str(r.UltimaAtualizacao),
      }));
  }

  private static parseSocios(o: Record<string, unknown>): EmpresaPjSocioInsertShape[] {
    if (!Array.isArray(o.socios)) return [];
    return o.socios
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === 'object')
      .map((r) => ({
        documentoSocio: str(r.documento_socio),
        nome: str(r.nome),
        tipoSocio: str(r.tipo_socio),
        qualificacao: str(r.qualificacao),
        participacao: num(r.participacao),
        dataEntrada: str(r.data_entrada),
        dataCad: str(r.data_cad),
        dataAlt: str(r.data_alt),
        ano: str(r.ano),
      }));
  }

  private static parseAtividadesSecundarias(o: Record<string, unknown>): EmpresaPjAtividadeSecundariaInsertShape[] {
    if (!Array.isArray(o.atividadesSecundarias)) return [];
    return o.atividadesSecundarias
      .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object')
      .map((r) => ({ codigo: str(r.codigo), descricao: str(r.descricao) }));
  }

  private static parseSimplesNacional(o: Record<string, unknown>): EmpresaPjSimplesNacionalInsertShape[] {
    const rawSimples = o.simplesNacional ?? o.simples_nacional;
    if (!rawSimples) return [];

    if (Array.isArray(rawSimples)) {
      return rawSimples
        .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === 'object')
        .map(UpminerEmpresaPjMapper.parseSimples);
    }

    if (typeof rawSimples === 'object') {
      return [UpminerEmpresaPjMapper.parseSimples(rawSimples as Record<string, unknown>)];
    }

    return [];
  }

  private static parseSimples(r: Record<string, unknown>): EmpresaPjSimplesNacionalInsertShape {
    return {
      cnpj: str(r.CNPJ),
      dataConsulta: str(r.DataConsulta),
      statusSimplesNacional: str(r.StatusSimplesNacional),
      statusSimei: str(r.StatusSimei),
      dataSimplesNacional: str(r.DataSimplesNacional),
      dataSimei: str(r.DataSimei),
    };
  }
}
