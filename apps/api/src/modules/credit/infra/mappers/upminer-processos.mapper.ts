function str(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function boolOrNull(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  return null;
}

function intOrNull(value: unknown): number | null {
  if (typeof value === 'number') return Math.round(value);
  return null;
}

function parseTimestamp(value: unknown): Date | null {
  if (!value || typeof value !== 'string') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export interface ProcessoInsertShape {
  apiProcessoId: string | null;
  urlProcesso: string | null;
  numeroProcessoUnico: string | null;
  numeroProcessoAntigo: string | null;
  statusObservacao: string | null;
  juiz: string | null;
  relator: string | null;
  orgaoJulgador: string | null;
  unidadeOrigem: string | null;
  grauProcesso: number | null;
  area: string | null;
  sistema: string | null;
  segmento: string | null;
  tribunalOrigem: string | null;
  uf: string | null;
  tribunal: string | null;
  dataDistribuicao: Date | null;
  dataProcessamento: Date | null;
  dataAutuacao: Date | null;
  valorCausaMoeda: string | null;
  valorCausaValor: string | null;
  classeProcessualNome: string | null;
  classeProcessualCodigoCnj: string | null;
  eTutelaAntecipada: boolean | null;
  temInjuncao: boolean | null;
  eJusticaGratuita: boolean | null;
  ePrioritario: boolean | null;
  eSegredoJustica: boolean | null;
  eProcessoDigital: boolean | null;
  temAcordao: boolean | null;
  temSentenca: boolean | null;
  statusPredictusStatusProcesso: string | null;
  statusPredictusRamoDireito: string | null;
  statusPredictusJusticaGratuita: string | null;
}

export interface AssuntoCnjInsertShape {
  titulo: string | null;
  codigoCnj: string | null;
  ePrincipal: boolean | null;
}

export interface ParteInsertShape {
  tipo: string | null;
  nome: string | null;
  polo: string | null;
  cpf: string | null;
  cnpj: string | null;
  cnpjRaiz: string | null;
  origemDocumento: string | null;
  dataAtualizacao: string | null;
}

export interface AdvogadoInsertShape {
  tipo: string | null;
  nome: string | null;
  cpf: string | null;
  oabUf: string | null;
  oabNumero: number | null;
  oabTipo: string | null;
  dataAtualizacao: string | null;
}

export interface MovimentoInsertShape {
  indice: number | null;
  nomeOriginal: string[];
  classificacaoCnjCodigo: string | null;
  classificacaoCnjNome: string | null;
  data: Date | null;
}

export interface RelacionadoInsertShape {
  numeroProcesso: string | null;
}

export interface JulgamentoInsertShape {
  dataJulgamento: Date | null;
  statusJulgamento: string | null;
  diasAteJulgamento: number | null;
  tipoJulgamento: string | null;
}

export interface PenhoraInsertShape {
  data: Date | null;
  tipo: string | null;
  trechoDecisao: string | null;
}

export interface ParsedProcesso {
  processo: ProcessoInsertShape;
  assuntos: AssuntoCnjInsertShape[];
  partes: Array<{ parte: ParteInsertShape; advogados: AdvogadoInsertShape[] }>;
  movimentos: MovimentoInsertShape[];
  relacionados: RelacionadoInsertShape[];
  julgamentos: JulgamentoInsertShape[];
  penhoras: PenhoraInsertShape[];
}

export class UpminerProcessosMapper {
  static parse(payload: unknown): ParsedProcesso[] {
    if (!Array.isArray(payload)) return [];
    return payload
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
      .map((item) => UpminerProcessosMapper.parseOne(item))
      .filter((p): p is ParsedProcesso => p !== null);
  }

  private static parseOne(o: Record<string, unknown>): ParsedProcesso | null {
    const valorCausa = toObject(o.valorCausa);
    const classeProcessual = toObject(o.classeProcessual);
    const statusPredictus = toObject(o.statusPredictus);

    return {
      processo: UpminerProcessosMapper.parseProcesso(o, valorCausa, classeProcessual, statusPredictus),
      assuntos: UpminerProcessosMapper.parseAssuntos(o),
      partes: UpminerProcessosMapper.parsePartes(o),
      movimentos: UpminerProcessosMapper.parseMovimentos(o),
      relacionados: UpminerProcessosMapper.parseRelacionados(o),
      julgamentos: UpminerProcessosMapper.parseJulgamentos(statusPredictus),
      penhoras: UpminerProcessosMapper.parsePenhoras(statusPredictus),
    };
  }

  private static parseProcesso(
    o: Record<string, unknown>,
    valorCausa: Record<string, unknown> | null,
    classeProcessual: Record<string, unknown> | null,
    statusPredictus: Record<string, unknown> | null,
  ): ProcessoInsertShape {
    return {
      apiProcessoId: str(o.id),
      urlProcesso: str(o.urlProcesso),
      numeroProcessoUnico: str(o.numeroProcessoUnico),
      numeroProcessoAntigo: str(o.numeroProcessoAntigo),
      statusObservacao: str(o.statusObservacao),
      juiz: str(o.juiz),
      relator: str(o.relator),
      orgaoJulgador: str(o.orgaoJulgador),
      unidadeOrigem: str(o.unidadeOrigem),
      grauProcesso: intOrNull(o.grauProcesso),
      area: str(o.area),
      sistema: str(o.sistema),
      segmento: str(o.segmento),
      tribunalOrigem: str(o.tribunalOrigem),
      uf: str(o.uf),
      tribunal: str(o.tribunal),
      dataDistribuicao: parseTimestamp(o.dataDistribuicao),
      dataProcessamento: parseTimestamp(o.dataProcessamento),
      dataAutuacao: parseTimestamp(o.dataAutuacao),
      valorCausaMoeda: valorCausa ? str(valorCausa.moeda) : null,
      valorCausaValor: valorCausa ? str(valorCausa.valor) : null,
      classeProcessualNome: classeProcessual ? str(classeProcessual.nome) : null,
      classeProcessualCodigoCnj: classeProcessual ? str(classeProcessual.codigoCNJ) : null,
      eTutelaAntecipada: boolOrNull(o.eTutelaAntecipada),
      temInjuncao: boolOrNull(o.temInjuncao),
      eJusticaGratuita: boolOrNull(o.eJusticaGratuita),
      ePrioritario: boolOrNull(o.ePrioritario),
      eSegredoJustica: boolOrNull(o.eSegredoJustica),
      eProcessoDigital: boolOrNull(o.eProcessoDigital),
      temAcordao: boolOrNull(o.temAcordao),
      temSentenca: boolOrNull(o.temSentenca),
      statusPredictusStatusProcesso: statusPredictus ? str(statusPredictus.statusProcesso) : null,
      statusPredictusRamoDireito: statusPredictus ? str(statusPredictus.ramoDireito) : null,
      statusPredictusJusticaGratuita: statusPredictus ? str(statusPredictus.justicaGratuita) : null,
    };
  }

  private static parseAssuntos(o: Record<string, unknown>): AssuntoCnjInsertShape[] {
    if (!Array.isArray(o.assuntosCNJ)) return [];
    return o.assuntosCNJ
      .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object')
      .map((r) => ({
        titulo: str(r.titulo),
        codigoCnj: str(r.codigoCNJ),
        ePrincipal: boolOrNull(r.ePrincipal),
      }));
  }

  private static parsePartes(o: Record<string, unknown>): ParsedProcesso['partes'] {
    if (!Array.isArray(o.partes)) return [];
    return o.partes
      .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === 'object')
      .map((r) => ({
        parte: {
          tipo: str(r.tipo),
          nome: str(r.nome),
          polo: str(r.polo),
          cpf: str(r.cpf),
          cnpj: str(r.cnpj),
          cnpjRaiz: str(r.cnpjRaiz),
          origemDocumento: str(r.origemDocumento),
          dataAtualizacao: str(r.dataAtualizacao),
        },
        advogados: UpminerProcessosMapper.parseAdvogados(r),
      }));
  }

  private static parseAdvogados(parte: Record<string, unknown>): AdvogadoInsertShape[] {
    if (!Array.isArray(parte.advogados)) return [];
    return parte.advogados
      .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object')
      .map((a) => {
        const oab = toObject(a.oab);
        return {
          tipo: str(a.tipo),
          nome: str(a.nome),
          cpf: str(a.cpf),
          oabUf: oab ? str(oab.uf) : null,
          oabNumero: oab ? intOrNull(oab.numero) : null,
          oabTipo: oab ? str(oab.tipo) : null,
          dataAtualizacao: str(a.dataAtualizacao),
        };
      });
  }

  private static parseMovimentos(o: Record<string, unknown>): MovimentoInsertShape[] {
    if (!Array.isArray(o.movimentos)) return [];
    return o.movimentos
      .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === 'object')
      .map((r) => {
        const classif = toObject(r.classificacaoCNJ);
        const nomeOriginal: string[] = Array.isArray(r.nomeOriginal)
          ? r.nomeOriginal.filter((x): x is string => typeof x === 'string')
          : [];
        return {
          indice: intOrNull(r.indice),
          nomeOriginal,
          classificacaoCnjCodigo: classif ? str(classif.codigoCNJ) : null,
          classificacaoCnjNome: classif ? str(classif.nome) : null,
          data: parseTimestamp(r.data),
        };
      });
  }

  private static parseRelacionados(o: Record<string, unknown>): RelacionadoInsertShape[] {
    if (!Array.isArray(o.processosRelacionados)) return [];
    return o.processosRelacionados
      .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
      .map((r) => ({ numeroProcesso: str(r.numeroProcesso) }));
  }

  private static parseJulgamentos(statusPredictus: Record<string, unknown> | null): JulgamentoInsertShape[] {
    if (!statusPredictus || !Array.isArray(statusPredictus.julgamentos)) return [];
    return statusPredictus.julgamentos
      .filter((j): j is Record<string, unknown> => Boolean(j) && typeof j === 'object')
      .map((r) => ({
        dataJulgamento: parseTimestamp(r.dataJulgamento),
        statusJulgamento: str(r.statusJulgamento),
        diasAteJulgamento: intOrNull(r.diasAteJulgamento),
        tipoJulgamento: str(r.tipoJulgamento),
      }));
  }

  private static parsePenhoras(statusPredictus: Record<string, unknown> | null): PenhoraInsertShape[] {
    if (!statusPredictus || !Array.isArray(statusPredictus.penhoras)) return [];
    return statusPredictus.penhoras
      .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === 'object')
      .map((r) => ({
        data: parseTimestamp(r.data),
        tipo: str(r.tipo),
        trechoDecisao: str(r.trechoDecisao),
      }));
  }
}
