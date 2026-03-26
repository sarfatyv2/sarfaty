import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import {
  upminerEmpresaPj,
  upminerEmpresaPjAtividadesSecundarias,
  upminerEmpresaPjEmails,
  upminerEmpresaPjEnderecos,
  upminerEmpresaPjSimplesNacional,
  upminerEmpresaPjSocios,
  upminerEmpresaPjTelefones,
  upminerProcessoAdvogados,
  upminerProcessoAssuntosCnj,
  upminerProcessoJulgamentos,
  upminerProcessoMovimentos,
  upminerProcessoPartes,
  upminerProcessoPenhoras,
  upminerProcessoRelacionados,
  upminerProcessos,
} from '../../../database/schema';

// --- Empresa PJ ---

export interface UpminerEmpresaPjEnderecoOutput {
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

export interface UpminerEmpresaPjTelefoneOutput {
  cnpj: string | null;
  apiId: string | null;
  dataLog: string | null;
  ddd: string | null;
  descricao: string | null;
  telefone: string | null;
  telefoneComDdd: string | null;
  rank: string | null;
}

export interface UpminerEmpresaPjEmailOutput {
  enderecoEmail: string | null;
  ultimaAtualizacao: string | null;
}

export interface UpminerEmpresaPjSocioOutput {
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

export interface UpminerEmpresaPjAtividadeSecundariaOutput {
  codigo: string | null;
  descricao: string | null;
}

export interface UpminerEmpresaPjSimplesNacionalOutput {
  cnpj: string | null;
  dataConsulta: string | null;
  statusSimplesNacional: string | null;
  statusSimei: string | null;
  dataSimplesNacional: string | null;
  dataSimei: string | null;
}

export interface UpminerEmpresaPjOutput {
  id: string;
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
  enderecos: UpminerEmpresaPjEnderecoOutput[];
  telefones: UpminerEmpresaPjTelefoneOutput[];
  emails: UpminerEmpresaPjEmailOutput[];
  socios: UpminerEmpresaPjSocioOutput[];
  atividadesSecundarias: UpminerEmpresaPjAtividadeSecundariaOutput[];
  simplesNacional: UpminerEmpresaPjSimplesNacionalOutput[];
}

// --- Processos ---

export interface UpminerProcessoAssuntoCnjOutput {
  titulo: string | null;
  codigoCnj: string | null;
  ePrincipal: boolean | null;
}

export interface UpminerProcessoAdvogadoOutput {
  tipo: string | null;
  nome: string | null;
  cpf: string | null;
  oabUf: string | null;
  oabNumero: number | null;
  oabTipo: string | null;
  dataAtualizacao: string | null;
}

export interface UpminerProcessoParteOutput {
  tipo: string | null;
  nome: string | null;
  polo: string | null;
  cpf: string | null;
  cnpj: string | null;
  cnpjRaiz: string | null;
  origemDocumento: string | null;
  dataAtualizacao: string | null;
  advogados: UpminerProcessoAdvogadoOutput[];
}

export interface UpminerProcessoMovimentoOutput {
  indice: number | null;
  nomeOriginal: string[];
  classificacaoCnjCodigo: string | null;
  classificacaoCnjNome: string | null;
  data: string | null;
}

export interface UpminerProcessoRelacionadoOutput {
  numeroProcesso: string | null;
}

export interface UpminerProcessoJulgamentoOutput {
  dataJulgamento: string | null;
  statusJulgamento: string | null;
  diasAteJulgamento: number | null;
  tipoJulgamento: string | null;
}

export interface UpminerProcessoPenhoraOutput {
  data: string | null;
  tipo: string | null;
  trechoDecisao: string | null;
}

export interface UpminerProcessoOutput {
  id: string;
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
  dataDistribuicao: string | null;
  dataProcessamento: string | null;
  dataAutuacao: string | null;
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
  assuntosCnj: UpminerProcessoAssuntoCnjOutput[];
  partes: UpminerProcessoParteOutput[];
  movimentos: UpminerProcessoMovimentoOutput[];
  relacionados: UpminerProcessoRelacionadoOutput[];
  julgamentos: UpminerProcessoJulgamentoOutput[];
  penhoras: UpminerProcessoPenhoraOutput[];
}

// --- Output agregado ---

export interface UpminerParallelDataOutput {
  empresaPj: UpminerEmpresaPjOutput | null;
  processos: UpminerProcessoOutput[];
}

@Injectable()
export class GetUpminerParallelDataUseCase {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async execute(upminerResultId: string): Promise<UpminerParallelDataOutput> {
    const [empresaRows, processoRows] = await Promise.all([
      this.db.select().from(upminerEmpresaPj).where(eq(upminerEmpresaPj.upminerResultId, upminerResultId)).execute(),
      this.db.select().from(upminerProcessos).where(eq(upminerProcessos.upminerResultId, upminerResultId)).execute(),
    ]);

    const empresaPj = await this.buildEmpresaPj(empresaRows[0] ?? null);
    const processos = await this.buildProcessos(processoRows);

    return { empresaPj, processos };
  }

  private async buildEmpresaPj(
    row: typeof upminerEmpresaPj.$inferSelect | null,
  ): Promise<UpminerEmpresaPjOutput | null> {
    if (!row) return null;

    const [enderecos, telefones, emails, socios, atividades, simples] = await Promise.all([
      this.db.select().from(upminerEmpresaPjEnderecos).where(eq(upminerEmpresaPjEnderecos.empresaPjId, row.id)).execute(),
      this.db.select().from(upminerEmpresaPjTelefones).where(eq(upminerEmpresaPjTelefones.empresaPjId, row.id)).execute(),
      this.db.select().from(upminerEmpresaPjEmails).where(eq(upminerEmpresaPjEmails.empresaPjId, row.id)).execute(),
      this.db.select().from(upminerEmpresaPjSocios).where(eq(upminerEmpresaPjSocios.empresaPjId, row.id)).execute(),
      this.db.select().from(upminerEmpresaPjAtividadesSecundarias).where(eq(upminerEmpresaPjAtividadesSecundarias.empresaPjId, row.id)).execute(),
      this.db.select().from(upminerEmpresaPjSimplesNacional).where(eq(upminerEmpresaPjSimplesNacional.empresaPjId, row.id)).execute(),
    ]);

    return {
      id: row.id,
      cnpj: row.cnpj,
      razaoSocial: row.razaoSocial,
      nomeFantasia: row.nomeFantasia,
      matriz: row.matriz,
      dataAbertura: row.dataAbertura,
      situacaoCadastral: row.situacaoCadastral,
      dataSituacao: row.dataSituacao,
      naturezaJuridicaCodigo: row.naturezaJuridicaCodigo,
      naturezaJuridicaDescricao: row.naturezaJuridicaDescricao,
      tipoCnae: row.tipoCnae,
      cnae: row.cnae,
      cnaeSegmento: row.cnaeSegmento,
      cnaeDescricao: row.cnaeDescricao,
      dominio: row.dominio,
      catchall: row.catchall,
      optanteSimples: row.optanteSimples,
      numeroFiliais: row.numeroFiliais,
      capitalSocial: row.capitalSocial,
      porte: row.porte,
      setor: row.setor,
      faixaFuncionarios: row.faixaFuncionarios,
      faturamentoAnualEstimado: row.faturamentoAnualEstimado,
      tipo: row.tipo,
      tipoEstabelecimento: row.tipoEstabelecimento,
      operacionalidade: row.operacionalidade,
      motivoSituacao: row.motivoSituacao,
      classeRisco: row.classeRisco,
      ultimaAtualizacao: row.ultimaAtualizacao,
      dataConsulta: row.dataConsulta,
      enderecos: enderecos.map((e) => ({
        bairro: e.bairro,
        cidade: e.cidade,
        uf: e.uf,
        cep: e.cep,
        ibge: e.ibge,
        logradouroTipo: e.logradouroTipo,
        logradouroNumero: e.logradouroNumero,
        logradouroComplemento: e.logradouroComplemento,
        logradouro: e.logradouro,
        latitude: e.latitude,
        longitude: e.longitude,
        ultimaAtualizacao: e.ultimaAtualizacao,
      })),
      telefones: telefones.map((t) => ({
        cnpj: t.cnpj,
        apiId: t.apiId,
        dataLog: t.dataLog,
        ddd: t.ddd,
        descricao: t.descricao,
        telefone: t.telefone,
        telefoneComDdd: t.telefoneComDdd,
        rank: t.rank,
      })),
      emails: emails.map((e) => ({
        enderecoEmail: e.enderecoEmail,
        ultimaAtualizacao: e.ultimaAtualizacao,
      })),
      socios: socios.map((s) => ({
        documentoSocio: s.documentoSocio,
        nome: s.nome,
        tipoSocio: s.tipoSocio,
        qualificacao: s.qualificacao,
        participacao: s.participacao,
        dataEntrada: s.dataEntrada,
        dataCad: s.dataCad,
        dataAlt: s.dataAlt,
        ano: s.ano,
      })),
      atividadesSecundarias: atividades.map((a) => ({
        codigo: a.codigo,
        descricao: a.descricao,
      })),
      simplesNacional: simples.map((s) => ({
        cnpj: s.cnpj,
        dataConsulta: s.dataConsulta,
        statusSimplesNacional: s.statusSimplesNacional,
        statusSimei: s.statusSimei,
        dataSimplesNacional: s.dataSimplesNacional,
        dataSimei: s.dataSimei,
      })),
    };
  }

  private async buildProcessos(
    rows: (typeof upminerProcessos.$inferSelect)[],
  ): Promise<UpminerProcessoOutput[]> {
    if (rows.length === 0) return [];

    const processoIds = rows.map((r) => r.id);

    const [assuntosRows, partesRows, movimentosRows, relacionadosRows, julgamentosRows, penhorasRows] =
      await Promise.all([
        this.db.select().from(upminerProcessoAssuntosCnj).where(inArray(upminerProcessoAssuntosCnj.processoId, processoIds)).execute(),
        this.db.select().from(upminerProcessoPartes).where(inArray(upminerProcessoPartes.processoId, processoIds)).execute(),
        this.db.select().from(upminerProcessoMovimentos).where(inArray(upminerProcessoMovimentos.processoId, processoIds)).execute(),
        this.db.select().from(upminerProcessoRelacionados).where(inArray(upminerProcessoRelacionados.processoId, processoIds)).execute(),
        this.db.select().from(upminerProcessoJulgamentos).where(inArray(upminerProcessoJulgamentos.processoId, processoIds)).execute(),
        this.db.select().from(upminerProcessoPenhoras).where(inArray(upminerProcessoPenhoras.processoId, processoIds)).execute(),
      ]);

    const parteIds = partesRows.map((p) => p.id);
    const advogadosRows = parteIds.length > 0
      ? await this.db.select().from(upminerProcessoAdvogados).where(inArray(upminerProcessoAdvogados.parteId, parteIds)).execute()
      : [];

    const advByParte = new Map<string, UpminerProcessoAdvogadoOutput[]>();
    for (const a of advogadosRows) {
      const list = advByParte.get(a.parteId) ?? [];
      list.push({ tipo: a.tipo, nome: a.nome, cpf: a.cpf, oabUf: a.oabUf, oabNumero: a.oabNumero, oabTipo: a.oabTipo, dataAtualizacao: a.dataAtualizacao });
      advByParte.set(a.parteId, list);
    }

    const group = <T extends { processoId: string }>(arr: T[]) => {
      const map = new Map<string, T[]>();
      for (const item of arr) {
        const list = map.get(item.processoId) ?? [];
        list.push(item);
        map.set(item.processoId, list);
      }
      return map;
    };

    const assuntosByProcesso = group(assuntosRows);
    const partesByProcesso = group(partesRows);
    const movsByProcesso = group(movimentosRows);
    const relByProcesso = group(relacionadosRows);
    const julgByProcesso = group(julgamentosRows);
    const penByProcesso = group(penhorasRows);

    return rows.map((r): UpminerProcessoOutput => ({
      id: r.id,
      apiProcessoId: r.apiProcessoId,
      urlProcesso: r.urlProcesso,
      numeroProcessoUnico: r.numeroProcessoUnico,
      numeroProcessoAntigo: r.numeroProcessoAntigo,
      statusObservacao: r.statusObservacao,
      juiz: r.juiz,
      relator: r.relator,
      orgaoJulgador: r.orgaoJulgador,
      unidadeOrigem: r.unidadeOrigem,
      grauProcesso: r.grauProcesso,
      area: r.area,
      sistema: r.sistema,
      segmento: r.segmento,
      tribunalOrigem: r.tribunalOrigem,
      uf: r.uf,
      tribunal: r.tribunal,
      dataDistribuicao: r.dataDistribuicao?.toISOString() ?? null,
      dataProcessamento: r.dataProcessamento?.toISOString() ?? null,
      dataAutuacao: r.dataAutuacao?.toISOString() ?? null,
      valorCausaMoeda: r.valorCausaMoeda,
      valorCausaValor: r.valorCausaValor,
      classeProcessualNome: r.classeProcessualNome,
      classeProcessualCodigoCnj: r.classeProcessualCodigoCnj,
      eTutelaAntecipada: r.eTutelaAntecipada,
      temInjuncao: r.temInjuncao,
      eJusticaGratuita: r.eJusticaGratuita,
      ePrioritario: r.ePrioritario,
      eSegredoJustica: r.eSegredoJustica,
      eProcessoDigital: r.eProcessoDigital,
      temAcordao: r.temAcordao,
      temSentenca: r.temSentenca,
      statusPredictusStatusProcesso: r.statusPredictusStatusProcesso,
      statusPredictusRamoDireito: r.statusPredictusRamoDireito,
      statusPredictusJusticaGratuita: r.statusPredictusJusticaGratuita,
      assuntosCnj: (assuntosByProcesso.get(r.id) ?? []).map((a) => ({
        titulo: a.titulo,
        codigoCnj: a.codigoCnj,
        ePrincipal: a.ePrincipal,
      })),
      partes: (partesByProcesso.get(r.id) ?? []).map((p) => ({
        tipo: p.tipo,
        nome: p.nome,
        polo: p.polo,
        cpf: p.cpf,
        cnpj: p.cnpj,
        cnpjRaiz: p.cnpjRaiz,
        origemDocumento: p.origemDocumento,
        dataAtualizacao: p.dataAtualizacao,
        advogados: advByParte.get(p.id) ?? [],
      })),
      movimentos: (movsByProcesso.get(r.id) ?? []).map((m) => ({
        indice: m.indice,
        nomeOriginal: m.nomeOriginal ?? [],
        classificacaoCnjCodigo: m.classificacaoCnjCodigo,
        classificacaoCnjNome: m.classificacaoCnjNome,
        data: m.data?.toISOString() ?? null,
      })),
      relacionados: (relByProcesso.get(r.id) ?? []).map((rel) => ({
        numeroProcesso: rel.numeroProcesso,
      })),
      julgamentos: (julgByProcesso.get(r.id) ?? []).map((j) => ({
        dataJulgamento: j.dataJulgamento?.toISOString() ?? null,
        statusJulgamento: j.statusJulgamento,
        diasAteJulgamento: j.diasAteJulgamento,
        tipoJulgamento: j.tipoJulgamento,
      })),
      penhoras: (penByProcesso.get(r.id) ?? []).map((p) => ({
        data: p.data?.toISOString() ?? null,
        tipo: p.tipo,
        trechoDecisao: p.trechoDecisao,
      })),
    }));
  }
}
