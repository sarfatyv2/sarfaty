import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
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

    const [sourceRows, receitaRows, qsaRows, cadeProcRows] = await Promise.all([
      this.db
        .select()
        .from(upminerDossierSources)
        .where(inArray(upminerDossierSources.upminerDossierId, dossierIds))
        .execute(),
      this.db
        .select()
        .from(upminerReceitaFederalPj)
        .where(inArray(upminerReceitaFederalPj.upminerDossierId, dossierIds))
        .execute(),
      this.db
        .select()
        .from(upminerQsa)
        .where(inArray(upminerQsa.upminerDossierId, dossierIds))
        .execute(),
      this.db
        .select()
        .from(upminerCadeProcessos)
        .where(inArray(upminerCadeProcessos.upminerDossierId, dossierIds))
        .execute(),
    ]);

    const receitaIds = receitaRows.map((r) => r.id);
    const qsaIds = qsaRows.map((q) => q.id);
    const cadeProcIds = cadeProcRows.map((p) => p.id);

    const [secundariasRows, sociosRows, protocolosRows, andamentosRows] = await Promise.all([
      receitaIds.length > 0
        ? this.db
            .select()
            .from(upminerReceitaSecundarias)
            .where(inArray(upminerReceitaSecundarias.receitaFederalPjId, receitaIds))
            .orderBy(asc(upminerReceitaSecundarias.ordem))
            .execute()
        : Promise.resolve([]),
      qsaIds.length > 0
        ? this.db
            .select()
            .from(upminerQsaSocios)
            .where(inArray(upminerQsaSocios.upminerQsaId, qsaIds))
            .execute()
        : Promise.resolve([]),
      cadeProcIds.length > 0
        ? this.db
            .select()
            .from(upminerCadeProtocolos)
            .where(inArray(upminerCadeProtocolos.cadeProcessoId, cadeProcIds))
            .execute()
        : Promise.resolve([]),
      cadeProcIds.length > 0
        ? this.db
            .select()
            .from(upminerCadeAndamentos)
            .where(inArray(upminerCadeAndamentos.cadeProcessoId, cadeProcIds))
            .execute()
        : Promise.resolve([]),
    ]);

    const sourcesByDossier = new Map<string, UpminerDossiersDataSource[]>();
    for (const s of sourceRows) {
      const list = sourcesByDossier.get(s.upminerDossierId) ?? [];
      list.push({
        method: s.method,
        name: s.name,
        hasResult: s.hasResult,
        processedStatus: s.processedStatus,
      });
      sourcesByDossier.set(s.upminerDossierId, list);
    }

    const secundariasByReceita = new Map<string, UpminerDossiersDataReceitaSecundaria[]>();
    for (const sec of secundariasRows) {
      const list = secundariasByReceita.get(sec.receitaFederalPjId) ?? [];
      list.push({
        codigo: sec.codigo,
        descricao: sec.descricao,
        ordem: sec.ordem,
      });
      secundariasByReceita.set(sec.receitaFederalPjId, list);
    }

    const receitaByDossier = new Map<string, UpminerDossiersDataReceitaFederalPj>();
    for (const r of receitaRows) {
      receitaByDossier.set(r.upminerDossierId, {
        cnpj: r.cnpj,
        tipo: r.tipo,
        dataAbertura: r.dataAbertura,
        nomeEmpresarial: r.nomeEmpresarial,
        nomeFantasia: r.nomeFantasia,
        atividadeEconomicaPrincipal: r.atividadeEconomicaPrincipal,
        secundarias: secundariasByReceita.get(r.id) ?? [],
      });
    }

    const sociosByQsa = new Map<string, UpminerDossiersDataQsaSocio[]>();
    for (const soc of sociosRows) {
      const list = sociosByQsa.get(soc.upminerQsaId) ?? [];
      list.push({
        cpfCnpj: soc.cpfCnpj,
        nome: soc.nome,
        entrada: soc.entrada,
        qualificacao: soc.qualificacao,
        participacao: soc.participacao,
        situacao: soc.situacao,
        pep: soc.pep,
        tipoSocio: soc.tipoSocio,
      });
      sociosByQsa.set(soc.upminerQsaId, list);
    }

    const qsaByDossier = new Map<string, UpminerDossiersDataQsa>();
    for (const q of qsaRows) {
      qsaByDossier.set(q.upminerDossierId, {
        cnpj: q.cnpj,
        razaoSocial: q.razaoSocial,
        capitalSocial: q.capitalSocial,
        dataConsulta: q.dataConsulta,
        pep: q.pep,
        socios: sociosByQsa.get(q.id) ?? [],
      });
    }

    const protocolosByProcesso = new Map<string, UpminerDossiersDataCadeProtocolo[]>();
    for (const pr of protocolosRows) {
      const list = protocolosByProcesso.get(pr.cadeProcessoId) ?? [];
      list.push({
        docProcesso: pr.docProcesso,
        tipoDoc: pr.tipoDoc,
        dataDocumento: pr.dataDocumento,
        dataRegistro: pr.dataRegistro,
        unidade: pr.unidade,
        linkPdf: pr.linkPdf,
      });
      protocolosByProcesso.set(pr.cadeProcessoId, list);
    }

    const andamentosByProcesso = new Map<string, UpminerDossiersDataCadeAndamento[]>();
    for (const a of andamentosRows) {
      const list = andamentosByProcesso.get(a.cadeProcessoId) ?? [];
      list.push({
        dataHora: a.dataHora,
        unidade: a.unidade,
        descricao: a.descricao,
      });
      andamentosByProcesso.set(a.cadeProcessoId, list);
    }

    const cadeByDossier = new Map<string, UpminerDossiersDataCadeProcesso[]>();
    for (const proc of cadeProcRows) {
      const list = cadeByDossier.get(proc.upminerDossierId) ?? [];
      list.push({
        apiRowId: proc.apiRowId,
        estado: proc.estado,
        processo: proc.processo,
        tipo: proc.tipo,
        dataRegistro: proc.dataRegistro,
        resumoInt: proc.resumoInt,
        interessados: proc.interessados ?? null,
        protocolos: protocolosByProcesso.get(proc.id) ?? [],
        andamentos: andamentosByProcesso.get(proc.id) ?? [],
      });
      cadeByDossier.set(proc.upminerDossierId, list);
    }

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
    }));

    return { dossiers };
  }
}
