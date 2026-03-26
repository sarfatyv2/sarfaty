import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
import { UpminerEmpresaPjMapper } from './mappers/upminer-empresa-pj.mapper';
import { UpminerProcessosMapper } from './mappers/upminer-processos.mapper';

type DbLike = Pick<DrizzleDB, 'insert' | 'delete'>;

@Injectable()
export class UpminerParallelPersistenceService {
  private readonly logger = new Logger(UpminerParallelPersistenceService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async persist(
    upminerResultId: string,
    rawEmpresaPj: unknown,
    rawProcessos: unknown,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(upminerEmpresaPj).where(eq(upminerEmpresaPj.upminerResultId, upminerResultId));
      await tx.delete(upminerProcessos).where(eq(upminerProcessos.upminerResultId, upminerResultId));

      if (rawEmpresaPj !== null && rawEmpresaPj !== undefined) {
        await this.insertEmpresaPjBlock(tx, upminerResultId, rawEmpresaPj);
      }

      if (rawProcessos !== null && rawProcessos !== undefined) {
        await this.insertProcessosBlock(tx, upminerResultId, rawProcessos);
      }
    });
  }

  private async insertEmpresaPjBlock(
    tx: DbLike,
    upminerResultId: string,
    raw: unknown,
  ): Promise<void> {
    const parsed = UpminerEmpresaPjMapper.parse(raw);
    if (!parsed) {
      this.logger.warn(`UpminerEmpresaPjMapper.parse returned null for result ${upminerResultId}`);
      return;
    }

    const [empresaRow] = await tx
      .insert(upminerEmpresaPj)
      .values({ upminerResultId, ...parsed.empresa })
      .returning({ id: upminerEmpresaPj.id });

    const empresaId = empresaRow?.id;
    if (!empresaId) throw new Error('upminer_empresa_pj insert returned no id');

    if (parsed.enderecos.length > 0) {
      await tx.insert(upminerEmpresaPjEnderecos).values(
        parsed.enderecos.map((e) => ({ empresaPjId: empresaId, ...e })),
      );
    }

    if (parsed.telefones.length > 0) {
      await tx.insert(upminerEmpresaPjTelefones).values(
        parsed.telefones.map((t) => ({ empresaPjId: empresaId, ...t })),
      );
    }

    if (parsed.emails.length > 0) {
      await tx.insert(upminerEmpresaPjEmails).values(
        parsed.emails.map((e) => ({ empresaPjId: empresaId, ...e })),
      );
    }

    if (parsed.socios.length > 0) {
      await tx.insert(upminerEmpresaPjSocios).values(
        parsed.socios.map((s) => ({ empresaPjId: empresaId, ...s })),
      );
    }

    if (parsed.atividadesSecundarias.length > 0) {
      await tx.insert(upminerEmpresaPjAtividadesSecundarias).values(
        parsed.atividadesSecundarias.map((a) => ({ empresaPjId: empresaId, ...a })),
      );
    }

    if (parsed.simplesNacional.length > 0) {
      await tx.insert(upminerEmpresaPjSimplesNacional).values(
        parsed.simplesNacional.map((s) => ({ empresaPjId: empresaId, ...s })),
      );
    }
  }

  private async insertProcessosBlock(
    tx: DbLike,
    upminerResultId: string,
    raw: unknown,
  ): Promise<void> {
    const parsedList = UpminerProcessosMapper.parse(raw);

    for (const parsed of parsedList) {
      const [processoRow] = await tx
        .insert(upminerProcessos)
        .values({ upminerResultId, ...parsed.processo })
        .returning({ id: upminerProcessos.id });

      const processoId = processoRow?.id;
      if (!processoId) throw new Error('upminer_processos insert returned no id');

      await this.insertProcessoChildren(tx, processoId, parsed);
    }
  }

  private async insertProcessoChildren(
    tx: DbLike,
    processoId: string,
    parsed: ReturnType<typeof UpminerProcessosMapper.parse>[number],
  ): Promise<void> {
    if (parsed.assuntos.length > 0) {
      await tx.insert(upminerProcessoAssuntosCnj).values(
        parsed.assuntos.map((a) => ({ processoId, ...a })),
      );
    }

    for (const { parte, advogados } of parsed.partes) {
      const [parteRow] = await tx
        .insert(upminerProcessoPartes)
        .values({ processoId, ...parte })
        .returning({ id: upminerProcessoPartes.id });

      const parteId = parteRow?.id;
      if (!parteId) continue;

      if (advogados.length > 0) {
        await tx.insert(upminerProcessoAdvogados).values(
          advogados.map((a) => ({ parteId, ...a })),
        );
      }
    }

    if (parsed.movimentos.length > 0) {
      await tx.insert(upminerProcessoMovimentos).values(
        parsed.movimentos.map((m) => ({ processoId, ...m })),
      );
    }

    if (parsed.relacionados.length > 0) {
      await tx.insert(upminerProcessoRelacionados).values(
        parsed.relacionados.map((r) => ({ processoId, ...r })),
      );
    }

    if (parsed.julgamentos.length > 0) {
      await tx.insert(upminerProcessoJulgamentos).values(
        parsed.julgamentos.map((j) => ({ processoId, ...j })),
      );
    }

    if (parsed.penhoras.length > 0) {
      await tx.insert(upminerProcessoPenhoras).values(
        parsed.penhoras.map((p) => ({ processoId, ...p })),
      );
    }
  }
}
