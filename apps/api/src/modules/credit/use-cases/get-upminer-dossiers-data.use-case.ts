import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import {
  upminerCadeAndamentos,
  upminerCadeProcessos,
  upminerCadeProtocolos,
  upminerCertidoes,
  upminerContratos,
  upminerCrsfnAcoes,
  upminerDjenCitacoes,
  upminerDjenDestinatarios,
  upminerDossierSources,
  upminerDossiers,
  upminerGoogleHits,
  upminerMpfProcessoDetalhes,
  upminerMpfProcessos,
  upminerProconAnos,
  upminerProconReclamacoes,
  upminerQsa,
  upminerQsaSocios,
  upminerReclameAqui,
  upminerReclameAquiReclamacoes,
  upminerReceitaFederalPj,
  upminerReceitaSecundarias,
  upminerSancaoHits,
  upminerSicaf,
  upminerTcuProcessos,
} from '../../../database/schema';

// ─── Existing DTOs ────────────────────────────────────────────────────────────

export interface UpminerDossiersDataReceitaSecundaria {
  codigo: string | null;
  descricao: string | null;
  ordem: number;
}

export interface UpminerDossiersDataReceitaFederalPj {
  cnpj: string | null;
  tipo: string | null;
  dataAbertura: string | null;
  nomeEmpresarial: string | null;
  nomeFantasia: string | null;
  atividadeEconomicaPrincipal: string | null;
  secundarias: UpminerDossiersDataReceitaSecundaria[];
}

export interface UpminerDossiersDataQsaSocio {
  cpfCnpj: string | null;
  nome: string | null;
  entrada: string | null;
  qualificacao: string | null;
  participacao: string | null;
  situacao: string | null;
  pep: string | null;
  tipoSocio: string | null;
}

export interface UpminerDossiersDataQsa {
  cnpj: string | null;
  razaoSocial: string | null;
  capitalSocial: string | null;
  dataConsulta: string | null;
  pep: string | null;
  socios: UpminerDossiersDataQsaSocio[];
}

export interface UpminerDossiersDataCadeProtocolo {
  docProcesso: string | null;
  tipoDoc: string | null;
  dataDocumento: string | null;
  dataRegistro: string | null;
  unidade: string | null;
  linkPdf: string | null;
}

export interface UpminerDossiersDataCadeAndamento {
  dataHora: string | null;
  unidade: string | null;
  descricao: string | null;
}

export interface UpminerDossiersDataCadeProcesso {
  apiRowId: string | null;
  estado: string | null;
  processo: string | null;
  tipo: string | null;
  dataRegistro: string | null;
  resumoInt: string | null;
  interessados: string[] | null;
  protocolos: UpminerDossiersDataCadeProtocolo[];
  andamentos: UpminerDossiersDataCadeAndamento[];
}

// ─── Phase 1: Certidões DTOs ──────────────────────────────────────────────────

export interface UpminerDossiersDataCertidao {
  method: string;
  nome: string | null;
  documento: string | null;
  conteudo: string | null;
  pdf: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  certidaoNumero: string | null;
  seloDigital: string | null;
}

// ─── Phase 2: Sanções DTOs ────────────────────────────────────────────────────

export interface UpminerDossiersDataSancaoHit {
  method: string;
  nome: string | null;
  cpfCnpj: string | null;
  tipoSancao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  orgaoSancionador: string | null;
  fundamentacao: string | null;
  pais: string | null;
  observacao: string | null;
}

export interface UpminerDossiersDataSicaf {
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacao: string | null;
  situacaoCadastral: string | null;
}

// ─── Phase 3: Administrative processes DTOs ───────────────────────────────────

export interface UpminerDossiersDataMpfDetalhe {
  numProcesso: string | null;
  partes: string[] | null;
  orgaoPoder: string | null;
  vara: string | null;
  localizacaoAtual: string | null;
  classe: string | null;
  camara: string | null;
  dataAutuacao: string | null;
  assunto: string | null;
  distribuicao: string | null;
}

export interface UpminerDossiersDataMpfProcesso {
  apiId: string | null;
  nome: string | null;
  estado: string | null;
  detalhes: UpminerDossiersDataMpfDetalhe[];
}

export interface UpminerDossiersDataDjenDestinatario {
  nome: string | null;
  tipoDestinatario: string | null;
  numeroOab: string | null;
  ufOab: string | null;
}

export interface UpminerDossiersDataDjenCitacao {
  apiId: string | null;
  estado: string | null;
  data: string | null;
  sigla: string | null;
  tipoComunicacao: string | null;
  nomeOrgao: string | null;
  tipoDocumento: string | null;
  nomeClasse: string | null;
  numeroProcesso: string | null;
  numeroProcessoMascara: string | null;
  link: string | null;
  texto: string | null;
  destinatarios: UpminerDossiersDataDjenDestinatario[];
}

export interface UpminerDossiersDataProconReclamacao {
  descricao: string | null;
  atendida: string | null;
  naoAtendida: string | null;
}

export interface UpminerDossiersDataProconAno {
  nomeFantasia: string | null;
  razaoSocial: string | null;
  ano: string | null;
  reclamacoes: UpminerDossiersDataProconReclamacao[];
}

export interface UpminerDossiersDataReclameAqui {
  empresa: string | null;
  dataCadastro: string | null;
  site: string | null;
  telefone: string | null;
  classificacao: string | null;
  atendidas: string | null;
  solucao: string | null;
  voltaria: string | null;
  notaConsumidor: string | null;
  tempoMedioResposta: string | null;
  totalAtendidas: string | null;
  totalNaoAtendidas: string | null;
  totalReclamacoes: string | null;
  reclamacoes: string[];
}

export interface UpminerDossiersDataCrsfnAcao {
  processo: string | null;
  ementa: string | null;
  dataJulgamento: string | null;
  resultado: string | null;
  relator: string | null;
  recurso: string | null;
}

export interface UpminerDossiersDataTcuProcesso {
  numProcesso: string | null;
  tipo: string | null;
  assunto: string | null;
  situacao: string | null;
  orgao: string | null;
  acordao: string | null;
  dataAcordao: string | null;
}

// ─── Phase 4: Especiais DTOs ──────────────────────────────────────────────────

export interface UpminerDossiersDataContrato {
  apiId: string | null;
  ano: string | null;
  mes: string | null;
  numeroContrato: string | null;
  objeto: string | null;
  fundamentoLegal: string | null;
  modalidadeCompra: string | null;
  situacaoCompra: string | null;
  nomeOrgaoSuperior: string | null;
  nomeOrgao: string | null;
  nomeUg: string | null;
  assinaturaContrato: string | null;
  publicacaoDou: string | null;
  inicioVigencia: string | null;
  fimVigencia: string | null;
  cnpj: string | null;
  nomeEmpresa: string | null;
  valorInicial: string | null;
  valorFinal: string | null;
}

export interface UpminerDossiersDataGoogleHit {
  pais: string | null;
  criterio: string | null;
  url: string | null;
  titulo: string | null;
  snippet: string | null;
}

// ─── Source + Dossier DTOs ────────────────────────────────────────────────────

export interface UpminerDossiersDataSource {
  method: string;
  name: string | null;
  hasResult: boolean;
  processedStatus: string | null;
}

export interface UpminerDossiersDataDossier {
  id: string;
  apiDossierId: number;
  criterionInput: string;
  criterionName: string | null;
  dossierStatus: string | null;
  dossierState: string | null;
  hasUpflag: boolean;
  searchProfileName: string | null;
  createdAtApi: string | null;
  processedAtApi: string | null;
  sources: UpminerDossiersDataSource[];
  receitaFederalPj: UpminerDossiersDataReceitaFederalPj | null;
  qsa: UpminerDossiersDataQsa | null;
  cadeProcessos: UpminerDossiersDataCadeProcesso[];
  // Phase 1
  certidoes: UpminerDossiersDataCertidao[];
  // Phase 2
  sancaoHits: UpminerDossiersDataSancaoHit[];
  sicaf: UpminerDossiersDataSicaf | null;
  // Phase 3
  mpfProcessos: UpminerDossiersDataMpfProcesso[];
  djenCitacoes: UpminerDossiersDataDjenCitacao[];
  proconAnos: UpminerDossiersDataProconAno[];
  reclameAqui: UpminerDossiersDataReclameAqui | null;
  crsfnAcoes: UpminerDossiersDataCrsfnAcao[];
  tcuProcessos: UpminerDossiersDataTcuProcesso[];
  // Phase 4
  contratos: UpminerDossiersDataContrato[];
  googleHits: UpminerDossiersDataGoogleHit[];
}

export interface UpminerDossiersDataOutput {
  dossiers: UpminerDossiersDataDossier[];
}

@Injectable()
export class GetUpminerDossiersDataUseCase {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async execute(upminerResultId: string): Promise<UpminerDossiersDataOutput> {
    const dossierRows = await this.db
      .select()
      .from(upminerDossiers)
      .where(eq(upminerDossiers.upminerResultId, upminerResultId))
      .execute();

    if (dossierRows.length === 0) {
      return { dossiers: [] };
    }

    const dossierIds = dossierRows.map((d) => d.id);

    const [
      sourceRows,
      receitaRows,
      qsaRows,
      cadeProcRows,
      certidaoRows,
      sancaoHitRows,
      sicafRows,
      mpfProcRows,
      djenRows,
      proconAnoRows,
      reclameAquiRows,
      crsfnRows,
      tcuRows,
      contratoRows,
      googleRows,
    ] = await Promise.all([
      this.db.select().from(upminerDossierSources).where(inArray(upminerDossierSources.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerReceitaFederalPj).where(inArray(upminerReceitaFederalPj.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerQsa).where(inArray(upminerQsa.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerCadeProcessos).where(inArray(upminerCadeProcessos.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerCertidoes).where(inArray(upminerCertidoes.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerSancaoHits).where(inArray(upminerSancaoHits.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerSicaf).where(inArray(upminerSicaf.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerMpfProcessos).where(inArray(upminerMpfProcessos.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerDjenCitacoes).where(inArray(upminerDjenCitacoes.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerProconAnos).where(inArray(upminerProconAnos.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerReclameAqui).where(inArray(upminerReclameAqui.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerCrsfnAcoes).where(inArray(upminerCrsfnAcoes.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerTcuProcessos).where(inArray(upminerTcuProcessos.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerContratos).where(inArray(upminerContratos.upminerDossierId, dossierIds)).execute(),
      this.db.select().from(upminerGoogleHits).where(inArray(upminerGoogleHits.upminerDossierId, dossierIds)).execute(),
    ]);

    const receitaIds = receitaRows.map((r) => r.id);
    const qsaIds = qsaRows.map((q) => q.id);
    const cadeProcIds = cadeProcRows.map((p) => p.id);
    const mpfProcIds = mpfProcRows.map((p) => p.id);
    const djenIds = djenRows.map((c) => c.id);
    const proconAnoIds = proconAnoRows.map((a) => a.id);
    const reclameAquiIds = reclameAquiRows.map((r) => r.id);

    const [secundariasRows, sociosRows, protocolosRows, andamentosRows, mpfDetRows, djenDestRows, proconRecRows, reclameRecRows] =
      await Promise.all([
        receitaIds.length > 0
          ? this.db.select().from(upminerReceitaSecundarias).where(inArray(upminerReceitaSecundarias.receitaFederalPjId, receitaIds)).orderBy(asc(upminerReceitaSecundarias.ordem)).execute()
          : Promise.resolve([]),
        qsaIds.length > 0
          ? this.db.select().from(upminerQsaSocios).where(inArray(upminerQsaSocios.upminerQsaId, qsaIds)).execute()
          : Promise.resolve([]),
        cadeProcIds.length > 0
          ? this.db.select().from(upminerCadeProtocolos).where(inArray(upminerCadeProtocolos.cadeProcessoId, cadeProcIds)).execute()
          : Promise.resolve([]),
        cadeProcIds.length > 0
          ? this.db.select().from(upminerCadeAndamentos).where(inArray(upminerCadeAndamentos.cadeProcessoId, cadeProcIds)).execute()
          : Promise.resolve([]),
        mpfProcIds.length > 0
          ? this.db.select().from(upminerMpfProcessoDetalhes).where(inArray(upminerMpfProcessoDetalhes.mpfProcessoId, mpfProcIds)).execute()
          : Promise.resolve([]),
        djenIds.length > 0
          ? this.db.select().from(upminerDjenDestinatarios).where(inArray(upminerDjenDestinatarios.djenCitacaoId, djenIds)).execute()
          : Promise.resolve([]),
        proconAnoIds.length > 0
          ? this.db.select().from(upminerProconReclamacoes).where(inArray(upminerProconReclamacoes.proconAnoId, proconAnoIds)).execute()
          : Promise.resolve([]),
        reclameAquiIds.length > 0
          ? this.db.select().from(upminerReclameAquiReclamacoes).where(inArray(upminerReclameAquiReclamacoes.reclameAquiId, reclameAquiIds)).execute()
          : Promise.resolve([]),
      ]);

    // ─── Build lookup maps ──────────────────────────────────────────────────

    const sourcesByDossier = buildGroupMap(sourceRows, 'upminerDossierId', (s) => ({
      method: s.method,
      name: s.name,
      hasResult: s.hasResult,
      processedStatus: s.processedStatus,
    }));

    const secundariasByReceita = buildGroupMap(secundariasRows, 'receitaFederalPjId', (s) => ({
      codigo: s.codigo,
      descricao: s.descricao,
      ordem: s.ordem,
    }));

    const receitaByDossier = buildSingleMap(receitaRows, 'upminerDossierId', (r) => ({
      cnpj: r.cnpj,
      tipo: r.tipo,
      dataAbertura: r.dataAbertura,
      nomeEmpresarial: r.nomeEmpresarial,
      nomeFantasia: r.nomeFantasia,
      atividadeEconomicaPrincipal: r.atividadeEconomicaPrincipal,
      secundarias: secundariasByReceita.get(r.id) ?? [],
    }));

    const sociosByQsa = buildGroupMap(sociosRows, 'upminerQsaId', (s) => ({
      cpfCnpj: s.cpfCnpj,
      nome: s.nome,
      entrada: s.entrada,
      qualificacao: s.qualificacao,
      participacao: s.participacao,
      situacao: s.situacao,
      pep: s.pep,
      tipoSocio: s.tipoSocio,
    }));

    const qsaByDossier = buildSingleMap(qsaRows, 'upminerDossierId', (q) => ({
      cnpj: q.cnpj,
      razaoSocial: q.razaoSocial,
      capitalSocial: q.capitalSocial,
      dataConsulta: q.dataConsulta,
      pep: q.pep,
      socios: sociosByQsa.get(q.id) ?? [],
    }));

    const protocolosByProcesso = buildGroupMap(protocolosRows, 'cadeProcessoId', (p) => ({
      docProcesso: p.docProcesso,
      tipoDoc: p.tipoDoc,
      dataDocumento: p.dataDocumento,
      dataRegistro: p.dataRegistro,
      unidade: p.unidade,
      linkPdf: p.linkPdf,
    }));

    const andamentosByProcesso = buildGroupMap(andamentosRows, 'cadeProcessoId', (a) => ({
      dataHora: a.dataHora,
      unidade: a.unidade,
      descricao: a.descricao,
    }));

    const cadeByDossier = buildGroupMap(cadeProcRows, 'upminerDossierId', (p) => ({
      apiRowId: p.apiRowId,
      estado: p.estado,
      processo: p.processo,
      tipo: p.tipo,
      dataRegistro: p.dataRegistro,
      resumoInt: p.resumoInt,
      interessados: p.interessados ?? null,
      protocolos: protocolosByProcesso.get(p.id) ?? [],
      andamentos: andamentosByProcesso.get(p.id) ?? [],
    }));

    const certidoesByDossier = buildGroupMap(certidaoRows, 'upminerDossierId', (c) => ({
      method: c.method,
      nome: c.nome,
      documento: c.documento,
      conteudo: c.conteudo,
      pdf: c.pdf,
      dataEmissao: c.dataEmissao,
      dataValidade: c.dataValidade,
      certidaoNumero: c.certidaoNumero,
      seloDigital: c.seloDigital,
    }));

    const sancaoHitsByDossier = buildGroupMap(sancaoHitRows, 'upminerDossierId', (h) => ({
      method: h.method,
      nome: h.nome,
      cpfCnpj: h.cpfCnpj,
      tipoSancao: h.tipoSancao,
      dataInicio: h.dataInicio,
      dataFim: h.dataFim,
      orgaoSancionador: h.orgaoSancionador,
      fundamentacao: h.fundamentacao,
      pais: h.pais,
      observacao: h.observacao,
    }));

    const sicafByDossier = buildSingleMap(sicafRows, 'upminerDossierId', (s) => ({
      cnpj: s.cnpj,
      razaoSocial: s.razaoSocial,
      nomeFantasia: s.nomeFantasia,
      situacao: s.situacao,
      situacaoCadastral: s.situacaoCadastral,
    }));

    const mpfDetsByProc = buildGroupMap(mpfDetRows, 'mpfProcessoId', (d) => ({
      numProcesso: d.numProcesso,
      partes: d.partes ?? null,
      orgaoPoder: d.orgaoPoder,
      vara: d.vara,
      localizacaoAtual: d.localizacaoAtual,
      classe: d.classe,
      camara: d.camara,
      dataAutuacao: d.dataAutuacao,
      assunto: d.assunto,
      distribuicao: d.distribuicao,
    }));

    const mpfByDossier = buildGroupMap(mpfProcRows, 'upminerDossierId', (p) => ({
      apiId: p.apiId,
      nome: p.nome,
      estado: p.estado,
      detalhes: mpfDetsByProc.get(p.id) ?? [],
    }));

    const djenDestsByItem = buildGroupMap(djenDestRows, 'djenCitacaoId', (d) => ({
      nome: d.nome,
      tipoDestinatario: d.tipoDestinatario,
      numeroOab: d.numeroOab,
      ufOab: d.ufOab,
    }));

    const djenByDossier = buildGroupMap(djenRows, 'upminerDossierId', (c) => ({
      apiId: c.apiId,
      estado: c.estado,
      data: c.data,
      sigla: c.sigla,
      tipoComunicacao: c.tipoComunicacao,
      nomeOrgao: c.nomeOrgao,
      tipoDocumento: c.tipoDocumento,
      nomeClasse: c.nomeClasse,
      numeroProcesso: c.numeroProcesso,
      numeroProcessoMascara: c.numeroProcessoMascara,
      link: c.link,
      texto: c.texto,
      destinatarios: djenDestsByItem.get(c.id) ?? [],
    }));

    const proconRecByAno = buildGroupMap(proconRecRows, 'proconAnoId', (r) => ({
      descricao: r.descricao,
      atendida: r.atendida,
      naoAtendida: r.naoAtendida,
    }));

    const proconByDossier = buildGroupMap(proconAnoRows, 'upminerDossierId', (a) => ({
      nomeFantasia: a.nomeFantasia,
      razaoSocial: a.razaoSocial,
      ano: a.ano,
      reclamacoes: proconRecByAno.get(a.id) ?? [],
    }));

    const reclameRecByRa = buildGroupMap(reclameRecRows, 'reclameAquiId', (r) => r.texto ?? '');

    const reclameAquiByDossier = buildSingleMap(reclameAquiRows, 'upminerDossierId', (r) => ({
      empresa: r.empresa,
      dataCadastro: r.dataCadastro,
      site: r.site,
      telefone: r.telefone,
      classificacao: r.classificacao,
      atendidas: r.atendidas,
      solucao: r.solucao,
      voltaria: r.voltaria,
      notaConsumidor: r.notaConsumidor,
      tempoMedioResposta: r.tempoMedioResposta,
      totalAtendidas: r.totalAtendidas,
      totalNaoAtendidas: r.totalNaoAtendidas,
      totalReclamacoes: r.totalReclamacoes,
      reclamacoes: reclameRecByRa.get(r.id) ?? [],
    }));

    const crsfnByDossier = buildGroupMap(crsfnRows, 'upminerDossierId', (a) => ({
      processo: a.processo,
      ementa: a.ementa,
      dataJulgamento: a.dataJulgamento,
      resultado: a.resultado,
      relator: a.relator,
      recurso: a.recurso,
    }));

    const tcuByDossier = buildGroupMap(tcuRows, 'upminerDossierId', (p) => ({
      numProcesso: p.numProcesso,
      tipo: p.tipo,
      assunto: p.assunto,
      situacao: p.situacao,
      orgao: p.orgao,
      acordao: p.acordao,
      dataAcordao: p.dataAcordao,
    }));

    const contratosByDossier = buildGroupMap(contratoRows, 'upminerDossierId', (c) => ({
      apiId: c.apiId,
      ano: c.ano,
      mes: c.mes,
      numeroContrato: c.numeroContrato,
      objeto: c.objeto,
      fundamentoLegal: c.fundamentoLegal,
      modalidadeCompra: c.modalidadeCompra,
      situacaoCompra: c.situacaoCompra,
      nomeOrgaoSuperior: c.nomeOrgaoSuperior,
      nomeOrgao: c.nomeOrgao,
      nomeUg: c.nomeUg,
      assinaturaContrato: c.assinaturaContrato,
      publicacaoDou: c.publicacaoDou,
      inicioVigencia: c.inicioVigencia,
      fimVigencia: c.fimVigencia,
      cnpj: c.cnpj,
      nomeEmpresa: c.nomeEmpresa,
      valorInicial: c.valorInicial,
      valorFinal: c.valorFinal,
    }));

    const googleByDossier = buildGroupMap(googleRows, 'upminerDossierId', (h) => ({
      pais: h.pais,
      criterio: h.criterio,
      url: h.url,
      titulo: h.titulo,
      snippet: h.snippet,
    }));

    // ─── Assemble dossier DTOs ───────────────────────────────────────────────

    const dossiers: UpminerDossiersDataDossier[] = dossierRows.map((d) => ({
      id: d.id,
      apiDossierId: d.apiDossierId,
      criterionInput: d.criterionInput,
      criterionName: d.criterionName,
      dossierStatus: d.dossierStatus,
      dossierState: d.dossierState,
      hasUpflag: d.hasUpflag,
      searchProfileName: d.searchProfileName,
      createdAtApi: d.createdAtApi,
      processedAtApi: d.processedAtApi,
      sources: sourcesByDossier.get(d.id) ?? [],
      receitaFederalPj: receitaByDossier.get(d.id) ?? null,
      qsa: qsaByDossier.get(d.id) ?? null,
      cadeProcessos: cadeByDossier.get(d.id) ?? [],
      certidoes: certidoesByDossier.get(d.id) ?? [],
      sancaoHits: sancaoHitsByDossier.get(d.id) ?? [],
      sicaf: sicafByDossier.get(d.id) ?? null,
      mpfProcessos: mpfByDossier.get(d.id) ?? [],
      djenCitacoes: djenByDossier.get(d.id) ?? [],
      proconAnos: proconByDossier.get(d.id) ?? [],
      reclameAqui: reclameAquiByDossier.get(d.id) ?? null,
      crsfnAcoes: crsfnByDossier.get(d.id) ?? [],
      tcuProcessos: tcuByDossier.get(d.id) ?? [],
      contratos: contratosByDossier.get(d.id) ?? [],
      googleHits: googleByDossier.get(d.id) ?? [],
    }));

    return { dossiers };
  }
}

// ─── Map builder helpers ──────────────────────────────────────────────────────

function buildGroupMap<TRow extends Record<string, unknown>, TOut>(
  rows: TRow[],
  keyField: keyof TRow,
  mapper: (row: TRow) => TOut,
): Map<string, TOut[]> {
  const map = new Map<string, TOut[]>();
  for (const row of rows) {
    const key = String(row[keyField]);
    const list = map.get(key) ?? [];
    list.push(mapper(row));
    map.set(key, list);
  }
  return map;
}

function buildSingleMap<TRow extends Record<string, unknown>, TOut>(
  rows: TRow[],
  keyField: keyof TRow,
  mapper: (row: TRow) => TOut,
): Map<string, TOut> {
  const map = new Map<string, TOut>();
  for (const row of rows) {
    map.set(String(row[keyField]), mapper(row));
  }
  return map;
}


export interface UpminerDossiersDataReceitaSecundaria {
  codigo: string | null;
  descricao: string | null;
  ordem: number;
}

export interface UpminerDossiersDataReceitaFederalPj {
  cnpj: string | null;
  tipo: string | null;
  dataAbertura: string | null;
  nomeEmpresarial: string | null;
  nomeFantasia: string | null;
  atividadeEconomicaPrincipal: string | null;
  secundarias: UpminerDossiersDataReceitaSecundaria[];
}

export interface UpminerDossiersDataQsaSocio {
  cpfCnpj: string | null;
  nome: string | null;
  entrada: string | null;
  qualificacao: string | null;
  participacao: string | null;
  situacao: string | null;
  pep: string | null;
  tipoSocio: string | null;
}

export interface UpminerDossiersDataQsa {
  cnpj: string | null;
  razaoSocial: string | null;
  capitalSocial: string | null;
  dataConsulta: string | null;
  pep: string | null;
  socios: UpminerDossiersDataQsaSocio[];
}

export interface UpminerDossiersDataCadeProtocolo {
  docProcesso: string | null;
  tipoDoc: string | null;
  dataDocumento: string | null;
  dataRegistro: string | null;
  unidade: string | null;
  linkPdf: string | null;
}

export interface UpminerDossiersDataCadeAndamento {
  dataHora: string | null;
  unidade: string | null;
  descricao: string | null;
}

export interface UpminerDossiersDataCadeProcesso {
  apiRowId: string | null;
  estado: string | null;
  processo: string | null;
  tipo: string | null;
  dataRegistro: string | null;
  resumoInt: string | null;
  interessados: string[] | null;
  protocolos: UpminerDossiersDataCadeProtocolo[];
  andamentos: UpminerDossiersDataCadeAndamento[];
}

export interface UpminerDossiersDataSource {
  method: string;
  name: string | null;
  hasResult: boolean;
  processedStatus: string | null;
}

export interface UpminerDossiersDataDossier {
  id: string;
  apiDossierId: number;
  criterionInput: string;
  criterionName: string | null;
  dossierStatus: string | null;
  dossierState: string | null;
  hasUpflag: boolean;
  searchProfileName: string | null;
  createdAtApi: string | null;
  processedAtApi: string | null;
  sources: UpminerDossiersDataSource[];
  receitaFederalPj: UpminerDossiersDataReceitaFederalPj | null;
  qsa: UpminerDossiersDataQsa | null;
  cadeProcessos: UpminerDossiersDataCadeProcesso[];
}

export interface UpminerDossiersDataOutput {
  dossiers: UpminerDossiersDataDossier[];
}
