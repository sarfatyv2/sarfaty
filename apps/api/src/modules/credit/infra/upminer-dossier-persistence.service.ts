import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import type { UpminerBatchDossiersResponse } from '../bureaus/upminer/upminer.types';
import { UpminerRelationalPayloadMapper } from './mappers/upminer-relational-payload.mapper';

export interface CollectedDossierPayload {
  listItem: UpminerBatchDossiersResponse['dossiers'][number];
  detail: Awaited<ReturnType<UpminerAdapter['getDossier']>>;
  sourcesByMethod: Map<string, unknown>;
}

type DbLike = Pick<DrizzleDB, 'insert' | 'delete'>;

@Injectable()
export class UpminerDossierPersistenceService {
  private readonly logger = new Logger(UpminerDossierPersistenceService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly upminerAdapter: UpminerAdapter,
  ) {}

  /**
   * Fetches dossier detail + source payloads from upMiner API, then persists in one DB transaction.
   */
  async persistForResult(
    upminerResultId: string,
    _batchId: number,
    dossiersResponse: UpminerBatchDossiersResponse,
  ): Promise<void> {
    const collected: CollectedDossierPayload[] = [];

    for (const listItem of dossiersResponse.dossiers) {
      const detail = await this.upminerAdapter.getDossier(listItem.id);
      const sourcesByMethod = new Map<string, unknown>();

      for (const src of detail.sources.items) {
        if (!src.has_result || !src.method) continue;
        try {
          const body = await this.upminerAdapter.getDossierSource(listItem.id, src.method);
          sourcesByMethod.set(src.method, body);
        } catch (err) {
          this.logger.warn(
            `upMiner getDossierSource failed dossier=${listItem.id} method=${src.method}: ${String(err)}`,
          );
        }
      }

      collected.push({ listItem, detail, sourcesByMethod });
    }

    // Delete previous data in a dedicated short-lived transaction to avoid
    // a long-running cascade delete inside the bigger persistence transaction.
    await this.db.delete(upminerDossiers).where(eq(upminerDossiers.upminerResultId, upminerResultId));

    // Persist each dossier in its own transaction so no single transaction
    // exceeds the Supabase statement timeout.
    for (const row of collected) {
      await this.persistOneDossier(upminerResultId, row);
    }
  }

  private async persistOneDossier(
    upminerResultId: string,
    row: CollectedDossierPayload,
  ): Promise<void> {
    const { listItem, detail } = row;

    await this.db.transaction(async (tx) => {
      const [insertedDossier] = await tx
        .insert(upminerDossiers)
        .values({
          upminerResultId,
          apiDossierId: listItem.id,
          criterionInput: listItem.criterion.input,
          criterionName: listItem.criterion.name ?? null,
          dossierStatus: listItem.status,
          dossierState: listItem.state,
          hasUpflag: listItem.has_upflag,
          searchProfileName: detail.search_profile_name ?? null,
          homonyms: detail.homonyms ?? null,
          apiBatchId: detail.batch?.id ?? null,
          apiUserId: detail.user?.id ?? null,
          apiUserName: detail.user?.name ?? null,
          createdAtApi: listItem.created_at ?? null,
          processedAtApi: listItem.processed_at ?? null,
        })
        .onConflictDoNothing()
        .returning({ id: upminerDossiers.id });

      // Parallel sync requests can race — if another request already inserted
      // this dossier, skip all child inserts (idempotency guard).
      if (!insertedDossier) return;

      const dossierUuid = insertedDossier.id;

      for (const src of detail.sources.items) {
        await tx.insert(upminerDossierSources).values({
          upminerDossierId: dossierUuid,
          method: src.method,
          name: src.name ?? null,
          hasResult: src.has_result,
          processedStatus: src.processed_status ?? null,
          processedAtApi: src.processed_at ?? null,
        });
      }

      // Existing sources
      await this.insertReceitaBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertQsaBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertCadeBlock(tx, dossierUuid, row.sourcesByMethod);

      // Phase 1: Certidões
      await this.insertCertidoesBlock(tx, dossierUuid, row.sourcesByMethod);

      // Phase 2: Sanções
      await this.insertSancaoHitsBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertSicafBlock(tx, dossierUuid, row.sourcesByMethod);

      // Phase 3: Administrative processes
      await this.insertMpfBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertDjenBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertProconBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertReclameAquiBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertCrsfnBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertTcuBlock(tx, dossierUuid, row.sourcesByMethod);

      // Phase 4: Especiais
      await this.insertContratosBlock(tx, dossierUuid, row.sourcesByMethod);
      await this.insertGoogleBlock(tx, dossierUuid, row.sourcesByMethod);
    });
  }

  // ─── Existing blocks ──────────────────────────────────────────────────────

  private async insertReceitaBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_RECEITA);
    if (raw === undefined) return;

    const parsed = UpminerRelationalPayloadMapper.parseReceitaFederalPj(raw);
    if (!parsed) return;

    const [receitaRow] = await tx
      .insert(upminerReceitaFederalPj)
      .values({
        upminerDossierId: dossierUuid,
        cnpj: parsed.receita.cnpj,
        tipo: parsed.receita.tipo,
        dataAbertura: parsed.receita.dataAbertura,
        nomeEmpresarial: parsed.receita.nomeEmpresarial,
        nomeFantasia: parsed.receita.nomeFantasia,
        atividadeEconomicaPrincipal: parsed.receita.atividadeEconomicaPrincipal,
      })
      .returning({ id: upminerReceitaFederalPj.id });

    const receitaId = receitaRow?.id;
    if (!receitaId || parsed.secundarias.length === 0) return;

    await tx.insert(upminerReceitaSecundarias).values(
      parsed.secundarias.map((s) => ({
        receitaFederalPjId: receitaId,
        codigo: s.codigo,
        descricao: s.descricao,
        ordem: s.ordem,
      })),
    );
  }

  private async insertQsaBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_QSA);
    if (raw === undefined) return;

    const parsed = UpminerRelationalPayloadMapper.parseBaseEmpresas(raw);
    if (!parsed) return;

    const [qsaRow] = await tx
      .insert(upminerQsa)
      .values({
        upminerDossierId: dossierUuid,
        cnpj: parsed.qsa.cnpj,
        razaoSocial: parsed.qsa.razaoSocial,
        capitalSocial: parsed.qsa.capitalSocial,
        dataConsulta: parsed.qsa.dataConsulta,
        pep: parsed.qsa.pep,
      })
      .returning({ id: upminerQsa.id });

    const qsaId = qsaRow?.id;
    if (!qsaId || parsed.socios.length === 0) return;

    await tx.insert(upminerQsaSocios).values(
      parsed.socios.map((s) => ({
        upminerQsaId: qsaId,
        cpfCnpj: s.cpfCnpj,
        nome: s.nome,
        entrada: s.entrada,
        qualificacao: s.qualificacao,
        participacao: s.participacao,
        situacao: s.situacao,
        pep: s.pep,
        tipoSocio: s.tipoSocio,
      })),
    );
  }

  private async insertCadeBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_CADE);
    if (raw === undefined) return;

    const processos = UpminerRelationalPayloadMapper.parseCade(raw);
    for (const proc of processos) {
      const [procRow] = await tx
        .insert(upminerCadeProcessos)
        .values({
          upminerDossierId: dossierUuid,
          apiRowId: proc.apiRowId,
          estado: proc.estado,
          processo: proc.processo,
          tipo: proc.tipo,
          dataRegistro: proc.dataRegistro,
          resumoInt: proc.resumoInt,
          interessados: proc.interessados ?? undefined,
        })
        .returning({ id: upminerCadeProcessos.id });

      const procId = procRow?.id;
      if (!procId) continue;

      if (proc.protocolos.length > 0) {
        await tx.insert(upminerCadeProtocolos).values(
          proc.protocolos.map((p) => ({
            cadeProcessoId: procId,
            docProcesso: p.docProcesso,
            tipoDoc: p.tipoDoc,
            dataDocumento: p.dataDocumento,
            dataRegistro: p.dataRegistro,
            unidade: p.unidade,
            linkPdf: p.linkPdf,
          })),
        );
      }
      if (proc.andamentos.length > 0) {
        await tx.insert(upminerCadeAndamentos).values(
          proc.andamentos.map((a) => ({
            cadeProcessoId: procId,
            dataHora: a.dataHora,
            unidade: a.unidade,
            descricao: a.descricao,
          })),
        );
      }
    }
  }

  // ─── Phase 1: Certidões ────────────────────────────────────────────────────

  private async insertCertidoesBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    for (const method of UpminerRelationalPayloadMapper.CERTIDAO_METHODS) {
      const raw = sourcesByMethod.get(method);
      if (raw === undefined) continue;
      const parsed = UpminerRelationalPayloadMapper.parseCertidao(method, raw);
      if (!parsed) continue;
      await tx.insert(upminerCertidoes).values({
        upminerDossierId: dossierUuid,
        method: parsed.method,
        nome: parsed.nome,
        documento: parsed.documento,
        conteudo: parsed.conteudo,
        pdf: parsed.pdf,
        dataEmissao: parsed.dataEmissao,
        dataValidade: parsed.dataValidade,
        certidaoNumero: parsed.certidaoNumero,
        seloDigital: parsed.seloDigital,
      });
    }
  }

  // ─── Phase 2: Sanções ──────────────────────────────────────────────────────

  private async insertSancaoHitsBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    for (const method of UpminerRelationalPayloadMapper.SANCAO_METHODS) {
      const raw = sourcesByMethod.get(method);
      if (raw === undefined) continue;
      const hits = UpminerRelationalPayloadMapper.parseSancaoHits(method, raw);
      if (hits.length === 0) continue;
      await tx.insert(upminerSancaoHits).values(
        hits.map((h) => ({
          upminerDossierId: dossierUuid,
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
        })),
      );
    }
  }

  private async insertSicafBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_SICAF);
    if (raw === undefined) return;
    const parsed = UpminerRelationalPayloadMapper.parseSicaf(raw);
    if (!parsed) return;
    await tx.insert(upminerSicaf).values({
      upminerDossierId: dossierUuid,
      cnpj: parsed.cnpj,
      razaoSocial: parsed.razaoSocial,
      nomeFantasia: parsed.nomeFantasia,
      situacao: parsed.situacao,
      situacaoCadastral: parsed.situacaoCadastral,
    });
  }

  // ─── Phase 3: Administrative processes ────────────────────────────────────

  private async insertMpfBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_MPF);
    if (raw === undefined) return;
    const processos = UpminerRelationalPayloadMapper.parseMpfRelevancia(raw);
    for (const proc of processos) {
      const [procRow] = await tx
        .insert(upminerMpfProcessos)
        .values({ upminerDossierId: dossierUuid, apiId: proc.apiId, nome: proc.nome, estado: proc.estado })
        .returning({ id: upminerMpfProcessos.id });
      const procId = procRow?.id;
      if (!procId || proc.detalhes.length === 0) continue;
      await tx.insert(upminerMpfProcessoDetalhes).values(
        proc.detalhes.map((d) => ({
          mpfProcessoId: procId,
          numProcesso: d.numProcesso,
          partes: d.partes ?? undefined,
          orgaoPoder: d.orgaoPoder,
          vara: d.vara,
          localizacaoAtual: d.localizacaoAtual,
          classe: d.classe,
          camara: d.camara,
          dataAutuacao: d.dataAutuacao,
          assunto: d.assunto,
          distribuicao: d.distribuicao,
        })),
      );
    }
  }

  private async insertDjenBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_DJEN);
    if (raw === undefined) return;
    const citacoes = UpminerRelationalPayloadMapper.parseDjen(raw);
    for (const cit of citacoes) {
      const [citRow] = await tx
        .insert(upminerDjenCitacoes)
        .values({
          upminerDossierId: dossierUuid,
          apiId: cit.apiId,
          estado: cit.estado,
          data: cit.data,
          sigla: cit.sigla,
          tipoComunicacao: cit.tipoComunicacao,
          nomeOrgao: cit.nomeOrgao,
          tipoDocumento: cit.tipoDocumento,
          nomeClasse: cit.nomeClasse,
          numeroProcesso: cit.numeroProcesso,
          numeroProcessoMascara: cit.numeroProcessoMascara,
          link: cit.link,
          texto: cit.texto,
        })
        .returning({ id: upminerDjenCitacoes.id });
      const citId = citRow?.id;
      if (!citId || cit.destinatarios.length === 0) continue;
      await tx.insert(upminerDjenDestinatarios).values(
        cit.destinatarios.map((d) => ({
          djenCitacaoId: citId,
          nome: d.nome,
          tipoDestinatario: d.tipoDestinatario,
          numeroOab: d.numeroOab,
          ufOab: d.ufOab,
        })),
      );
    }
  }

  private async insertProconBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_PROCON);
    if (raw === undefined) return;
    const anos = UpminerRelationalPayloadMapper.parseProconSp(raw);
    for (const ano of anos) {
      const [anoRow] = await tx
        .insert(upminerProconAnos)
        .values({ upminerDossierId: dossierUuid, nomeFantasia: ano.nomeFantasia, razaoSocial: ano.razaoSocial, ano: ano.ano })
        .returning({ id: upminerProconAnos.id });
      const anoId = anoRow?.id;
      if (!anoId || ano.reclamacoes.length === 0) continue;
      await tx.insert(upminerProconReclamacoes).values(
        ano.reclamacoes.map((r) => ({
          proconAnoId: anoId,
          descricao: r.descricao,
          atendida: r.atendida,
          naoAtendida: r.naoAtendida,
        })),
      );
    }
  }

  private async insertReclameAquiBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_RECLAME_AQUI);
    if (raw === undefined) return;
    const parsed = UpminerRelationalPayloadMapper.parseReclameAqui(raw);
    if (!parsed) return;
    const [raRow] = await tx
      .insert(upminerReclameAqui)
      .values({
        upminerDossierId: dossierUuid,
        empresa: parsed.empresa,
        dataCadastro: parsed.dataCadastro,
        site: parsed.site,
        telefone: parsed.telefone,
        classificacao: parsed.classificacao,
        atendidas: parsed.atendidas,
        solucao: parsed.solucao,
        voltaria: parsed.voltaria,
        notaConsumidor: parsed.notaConsumidor,
        tempoMedioResposta: parsed.tempoMedioResposta,
        totalAtendidas: parsed.totalAtendidas,
        totalNaoAtendidas: parsed.totalNaoAtendidas,
        totalReclamacoes: parsed.totalReclamacoes,
      })
      .returning({ id: upminerReclameAqui.id });
    const raId = raRow?.id;
    if (!raId || parsed.reclamacoes.length === 0) return;
    await tx.insert(upminerReclameAquiReclamacoes).values(
      parsed.reclamacoes.map((texto) => ({ reclameAquiId: raId, texto })),
    );
  }

  private async insertCrsfnBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_CRSFN);
    if (raw === undefined) return;
    const acoes = UpminerRelationalPayloadMapper.parseCrsfn(raw);
    if (acoes.length === 0) return;
    await tx.insert(upminerCrsfnAcoes).values(
      acoes.map((a) => ({
        upminerDossierId: dossierUuid,
        processo: a.processo,
        ementa: a.ementa,
        dataJulgamento: a.dataJulgamento,
        resultado: a.resultado,
        relator: a.relator,
        recurso: a.recurso,
      })),
    );
  }

  private async insertTcuBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_TCU);
    if (raw === undefined) return;
    const processos = UpminerRelationalPayloadMapper.parseTcu(raw);
    if (processos.length === 0) return;
    await tx.insert(upminerTcuProcessos).values(
      processos.map((p) => ({
        upminerDossierId: dossierUuid,
        numProcesso: p.numProcesso,
        tipo: p.tipo,
        assunto: p.assunto,
        situacao: p.situacao,
        orgao: p.orgao,
        acordao: p.acordao,
        dataAcordao: p.dataAcordao,
      })),
    );
  }

  // ─── Phase 4: Especiais ────────────────────────────────────────────────────

  private async insertContratosBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_CONTRATOS);
    if (raw === undefined) return;
    const contratos = UpminerRelationalPayloadMapper.parseContratos(raw);
    if (contratos.length === 0) return;
    await tx.insert(upminerContratos).values(
      contratos.map((c) => ({
        upminerDossierId: dossierUuid,
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
      })),
    );
  }

  private async insertGoogleBlock(
    tx: DbLike,
    dossierUuid: string,
    sourcesByMethod: Map<string, unknown>,
  ): Promise<void> {
    const raw = sourcesByMethod.get(UpminerRelationalPayloadMapper.METHOD_GOOGLE);
    if (raw === undefined) return;
    const hits = UpminerRelationalPayloadMapper.parseGoogleGlobal(raw);
    if (hits.length === 0) return;
    await tx.insert(upminerGoogleHits).values(
      hits.map((h) => ({
        upminerDossierId: dossierUuid,
        pais: h.pais,
        criterio: h.criterio,
        url: h.url,
        titulo: h.titulo,
        snippet: h.snippet,
      })),
    );
  }
}

