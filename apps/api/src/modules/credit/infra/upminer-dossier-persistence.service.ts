import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import {
  upminerCadeAndamentos,
  upminerCadeProcessos,
  upminerCadeProtocolos,
  upminerDossierSources,
  upminerDossiers,
  upminerQsa,
  upminerQsaSocios,
  upminerReceitaFederalPj,
  upminerReceitaSecundarias,
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

    await this.db.transaction(async (tx) => {
      await tx.delete(upminerDossiers).where(eq(upminerDossiers.upminerResultId, upminerResultId));

      for (const row of collected) {
        const { listItem, detail } = row;

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
          .returning({ id: upminerDossiers.id });

        const dossierUuid = insertedDossier?.id;
        if (!dossierUuid) {
          throw new Error('upminer_dossiers insert returned no id');
        }

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

        await this.insertReceitaBlock(tx, dossierUuid, row.sourcesByMethod);
        await this.insertQsaBlock(tx, dossierUuid, row.sourcesByMethod);
        await this.insertCadeBlock(tx, dossierUuid, row.sourcesByMethod);
      }
    });
  }

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
}
