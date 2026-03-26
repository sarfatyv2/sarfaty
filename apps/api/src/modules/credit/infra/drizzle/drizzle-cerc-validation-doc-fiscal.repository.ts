import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type {
  CercValidationDocFiscalRepository,
  CercValidationDocFiscalAggregate,
  CercValidationDocFiscalRow,
  CercValidationNfeDuplicataRow,
  CercValidationNfeProdutoRow,
  CercValidationNfeEventoFiscalRow,
} from '../../domain/cerc-validation-doc-fiscal.repository';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import {
  cercValidationDocFiscal,
  cercValidationNfeDuplicatas,
  cercValidationNfeProdutos,
  cercValidationNfeEventosFiscais,
} from '../../../../database/schema/cerc-validations';

@Injectable()
export class DrizzleCercValidationDocFiscalRepository implements CercValidationDocFiscalRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(aggregate: CercValidationDocFiscalAggregate): Promise<void> {
    const { docFiscal, duplicatas, produtos, eventosFiscais } = aggregate;

    if (docFiscal) {
      await this.db
        .insert(cercValidationDocFiscal)
        .values({
          cercValidationId: docFiscal.cercValidationId,
          tipo: docFiscal.tipo,
          chaveAcesso: docFiscal.chaveAcesso,
          numero: docFiscal.numero,
          serie: docFiscal.serie,
          modelo: docFiscal.modelo,
          situacao: docFiscal.situacao,
          naturezaOperacao: docFiscal.naturezaOperacao,
          dataEmissao: docFiscal.dataEmissao,
          valorTotal: docFiscal.valorTotal,
          emitenteNome: docFiscal.emitenteNome,
          emitenteCnpj: docFiscal.emitenteCnpj,
          emitenteUf: docFiscal.emitenteUf,
          destinatarioNome: docFiscal.destinatarioNome,
          destinatarioCnpj: docFiscal.destinatarioCnpj,
          destinatarioCpf: docFiscal.destinatarioCpf,
          destinatarioUf: docFiscal.destinatarioUf,
          faturaNumero: docFiscal.faturaNumero,
          faturaValorOriginal: docFiscal.faturaValorOriginal,
          faturaValorLiquido: docFiscal.faturaValorLiquido,
          modalidadeFrete: docFiscal.modalidadeFrete,
          transportadorNome: docFiscal.transportadorNome,
          transportadorCnpj: docFiscal.transportadorCnpj,
          valorIcms: docFiscal.valorIcms,
          valorPis: docFiscal.valorPis,
          valorCofins: docFiscal.valorCofins,
          valorProdutos: docFiscal.valorProdutos,
        })
        .execute();
    }

    if (duplicatas.length > 0) {
      await this.db
        .insert(cercValidationNfeDuplicatas)
        .values(duplicatas.map((d) => ({
          cercValidationId: d.cercValidationId,
          numero: d.numero,
          valor: d.valor,
          vencimento: d.vencimento,
        })))
        .execute();
    }

    if (produtos.length > 0) {
      await this.db
        .insert(cercValidationNfeProdutos)
        .values(produtos.map((p) => ({
          cercValidationId: p.cercValidationId,
          num: p.num,
          codigo: p.codigo,
          descricao: p.descricao,
          ncm: p.ncm,
          cfop: p.cfop,
          unidade: p.unidade,
          quantidade: p.quantidade,
          valorUnitario: p.valorUnitario,
          valorTotal: p.valorTotal,
        })))
        .execute();
    }

    if (eventosFiscais.length > 0) {
      await this.db
        .insert(cercValidationNfeEventosFiscais)
        .values(eventosFiscais.map((e) => ({
          cercValidationId: e.cercValidationId,
          tipo: e.tipo,
          data: e.data,
          orgao: e.orgao,
          protocolo: e.protocolo,
          evento: e.evento,
        })))
        .execute();
    }
  }

  async findByValidationId(cercValidationId: string): Promise<CercValidationDocFiscalAggregate> {
    const [docFiscalRows, duplicatasRows, produtosRows, eventosFiscaisRows] = await Promise.all([
      this.db
        .select()
        .from(cercValidationDocFiscal)
        .where(eq(cercValidationDocFiscal.cercValidationId, cercValidationId))
        .limit(1)
        .execute(),
      this.db
        .select()
        .from(cercValidationNfeDuplicatas)
        .where(eq(cercValidationNfeDuplicatas.cercValidationId, cercValidationId))
        .execute(),
      this.db
        .select()
        .from(cercValidationNfeProdutos)
        .where(eq(cercValidationNfeProdutos.cercValidationId, cercValidationId))
        .execute(),
      this.db
        .select()
        .from(cercValidationNfeEventosFiscais)
        .where(eq(cercValidationNfeEventosFiscais.cercValidationId, cercValidationId))
        .execute(),
    ]);

    const rawDoc = docFiscalRows[0] ?? null;
    const docFiscal: CercValidationDocFiscalRow | null = rawDoc
      ? {
          id: rawDoc.id,
          cercValidationId: rawDoc.cercValidationId,
          tipo: rawDoc.tipo,
          chaveAcesso: rawDoc.chaveAcesso,
          numero: rawDoc.numero,
          serie: rawDoc.serie,
          modelo: rawDoc.modelo,
          situacao: rawDoc.situacao,
          naturezaOperacao: rawDoc.naturezaOperacao,
          dataEmissao: rawDoc.dataEmissao,
          valorTotal: rawDoc.valorTotal,
          emitenteNome: rawDoc.emitenteNome,
          emitenteCnpj: rawDoc.emitenteCnpj,
          emitenteUf: rawDoc.emitenteUf,
          destinatarioNome: rawDoc.destinatarioNome,
          destinatarioCnpj: rawDoc.destinatarioCnpj,
          destinatarioCpf: rawDoc.destinatarioCpf,
          destinatarioUf: rawDoc.destinatarioUf,
          faturaNumero: rawDoc.faturaNumero,
          faturaValorOriginal: rawDoc.faturaValorOriginal,
          faturaValorLiquido: rawDoc.faturaValorLiquido,
          modalidadeFrete: rawDoc.modalidadeFrete,
          transportadorNome: rawDoc.transportadorNome,
          transportadorCnpj: rawDoc.transportadorCnpj,
          valorIcms: rawDoc.valorIcms,
          valorPis: rawDoc.valorPis,
          valorCofins: rawDoc.valorCofins,
          valorProdutos: rawDoc.valorProdutos,
          createdAt: rawDoc.createdAt ?? undefined,
        }
      : null;

    const duplicatas: CercValidationNfeDuplicataRow[] = duplicatasRows.map((r) => ({
      id: r.id,
      cercValidationId: r.cercValidationId,
      numero: r.numero,
      valor: r.valor,
      vencimento: r.vencimento,
      createdAt: r.createdAt ?? undefined,
    }));

    const produtos: CercValidationNfeProdutoRow[] = produtosRows.map((r) => ({
      id: r.id,
      cercValidationId: r.cercValidationId,
      num: r.num,
      codigo: r.codigo,
      descricao: r.descricao,
      ncm: r.ncm,
      cfop: r.cfop,
      unidade: r.unidade,
      quantidade: r.quantidade,
      valorUnitario: r.valorUnitario,
      valorTotal: r.valorTotal,
      createdAt: r.createdAt ?? undefined,
    }));

    const eventosFiscais: CercValidationNfeEventoFiscalRow[] = eventosFiscaisRows.map((r) => ({
      id: r.id,
      cercValidationId: r.cercValidationId,
      tipo: r.tipo,
      data: r.data,
      orgao: r.orgao,
      protocolo: r.protocolo,
      evento: r.evento,
      createdAt: r.createdAt ?? undefined,
    }));

    return { docFiscal, duplicatas, produtos, eventosFiscais };
  }

  async deleteByValidationId(cercValidationId: string): Promise<void> {
    await Promise.all([
      this.db.delete(cercValidationDocFiscal).where(eq(cercValidationDocFiscal.cercValidationId, cercValidationId)).execute(),
      this.db.delete(cercValidationNfeDuplicatas).where(eq(cercValidationNfeDuplicatas.cercValidationId, cercValidationId)).execute(),
      this.db.delete(cercValidationNfeProdutos).where(eq(cercValidationNfeProdutos.cercValidationId, cercValidationId)).execute(),
      this.db.delete(cercValidationNfeEventosFiscais).where(eq(cercValidationNfeEventosFiscais.cercValidationId, cercValidationId)).execute(),
    ]);
  }
}
