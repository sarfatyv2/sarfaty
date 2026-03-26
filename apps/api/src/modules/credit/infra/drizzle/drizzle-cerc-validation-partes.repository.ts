import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type {
  CercValidationPartesRepository,
  CercValidationParteRow,
} from '../../domain/cerc-validation-partes.repository';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { cercValidationPartes } from '../../../../database/schema/cerc-validations';

@Injectable()
export class DrizzleCercValidationPartesRepository implements CercValidationPartesRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async saveMany(rows: CercValidationParteRow[]): Promise<void> {
    if (rows.length === 0) return;
    await this.db
      .insert(cercValidationPartes)
      .values(rows.map((r) => ({
        cercValidationId: r.cercValidationId,
        role: r.role,
        documentoTipo: r.documentoTipo,
        documentoNumero: r.documentoNumero,
        razaoSocial: r.razaoSocial,
        nomeFantasia: r.nomeFantasia,
        uf: r.uf,
        cep: r.cep,
        municipio: r.municipio,
        dataDeAbertura: r.dataDeAbertura,
        capitalSocial: r.capitalSocial,
        situacaoCadastralStatus: r.situacaoCadastralStatus,
        atividadePrincipalCodigo: r.atividadePrincipalCodigo,
        atividadePrincipalDescricao: r.atividadePrincipalDescricao,
      })))
      .execute();
  }

  async findByValidationId(cercValidationId: string): Promise<CercValidationParteRow[]> {
    const rows = await this.db
      .select()
      .from(cercValidationPartes)
      .where(eq(cercValidationPartes.cercValidationId, cercValidationId))
      .execute();

    return rows.map((r) => ({
      id: r.id,
      cercValidationId: r.cercValidationId,
      role: r.role,
      documentoTipo: r.documentoTipo,
      documentoNumero: r.documentoNumero,
      razaoSocial: r.razaoSocial,
      nomeFantasia: r.nomeFantasia,
      uf: r.uf,
      cep: r.cep,
      municipio: r.municipio,
      dataDeAbertura: r.dataDeAbertura,
      capitalSocial: r.capitalSocial,
      situacaoCadastralStatus: r.situacaoCadastralStatus,
      atividadePrincipalCodigo: r.atividadePrincipalCodigo,
      atividadePrincipalDescricao: r.atividadePrincipalDescricao,
      createdAt: r.createdAt ?? undefined,
    }));
  }

  async deleteByValidationId(cercValidationId: string): Promise<void> {
    await this.db
      .delete(cercValidationPartes)
      .where(eq(cercValidationPartes.cercValidationId, cercValidationId))
      .execute();
  }
}
