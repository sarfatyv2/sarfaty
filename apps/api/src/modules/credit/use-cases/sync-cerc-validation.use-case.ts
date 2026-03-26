import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import { CERC_VALIDATION_RESULTADO_REPOSITORY, type CercValidationResultadoRepository } from '../domain/cerc-validation-resultado.repository';
import { CERC_VALIDATION_EVENTOS_REPOSITORY, type CercValidationEventosRepository } from '../domain/cerc-validation-eventos.repository';
import { CERC_VALIDATION_PARTES_REPOSITORY, type CercValidationPartesRepository } from '../domain/cerc-validation-partes.repository';
import { CERC_VALIDATION_DOC_FISCAL_REPOSITORY, type CercValidationDocFiscalRepository } from '../domain/cerc-validation-doc-fiscal.repository';
import type { CercValidation } from '../domain/cerc-validation.entity';
import { CercAdapter } from '../bureaus/cerc/cerc.adapter';
import { CercValidationResultadoMapper } from '../infra/mappers/cerc-validation-resultado.mapper';
import { CercValidationEventosMapper } from '../infra/mappers/cerc-validation-eventos.mapper';
import { CercValidationPartesMapper } from '../infra/mappers/cerc-validation-partes.mapper';
import { CercValidationDocFiscalMapper } from '../infra/mappers/cerc-validation-doc-fiscal.mapper';
import { env } from '../../../config/env';

@Injectable()
export class SyncCercValidationUseCase {
  private readonly logger = new Logger(SyncCercValidationUseCase.name);

  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
    @Inject(CERC_VALIDATION_RESULTADO_REPOSITORY)
    private readonly resultadoRepository: CercValidationResultadoRepository,
    @Inject(CERC_VALIDATION_EVENTOS_REPOSITORY)
    private readonly eventosRepository: CercValidationEventosRepository,
    @Inject(CERC_VALIDATION_PARTES_REPOSITORY)
    private readonly partesRepository: CercValidationPartesRepository,
    @Inject(CERC_VALIDATION_DOC_FISCAL_REPOSITORY)
    private readonly docFiscalRepository: CercValidationDocFiscalRepository,
    private readonly cercAdapter: CercAdapter,
  ) {}

  async execute(id: string): Promise<CercValidation> {
    const entity = await this.repository.getById(id);
    if (!entity) throw new NotFoundException(`CercValidation not found: ${id}`);

    if (entity.isTerminal()) return entity;

    const veiculoId = entity.veiculoId ?? env.CERC_VEICULO_ID;

    try {
      const buscarResult = await this.cercAdapter.buscarValidacoesDuplicataMercantil({
        veiculo: { id: veiculoId },
        lote_ids: entity.loteId ? [entity.loteId] : undefined,
        paginacao: { por_pagina: 10, pagina: 1 },
      });

      const validacao = buscarResult.validacoes?.[0];

      if (!validacao) {
        this.logger.debug(`SyncCerc ${id}: no validacao yet, still polling`);
        await this.repository.update(entity);
        return entity;
      }

      const statusProcessamento = validacao.status_de_processamento;
      const isPending = statusProcessamento === 'pendente';

      entity.updatePollingStatus(validacao.id, statusProcessamento);

      if (isPending) {
        await this.repository.update(entity);
        return entity;
      }

      const [constatacoes, eventos, partes, docFiscal, resultados] = await Promise.allSettled([
        this.cercAdapter.getConstatacoes(validacao.id),
        this.cercAdapter.getEventos(validacao.id),
        this.cercAdapter.getPartes(validacao.id),
        this.cercAdapter.getDocumentoFiscal(validacao.id),
        this.cercAdapter.getResultados(validacao.id),
      ]);

      entity.markAsProcessed({ validacaoId: validacao.id, statusProcessamento });
      await this.repository.update(entity);

      await Promise.all([
        this.persistResultados(id, constatacoes, resultados),
        this.persistEventos(id, eventos),
        this.persistPartes(id, partes, validacao),
        this.persistDocFiscal(id, docFiscal),
      ]);

      this.logger.log(`CercValidation processed: ${id}, validacao: ${validacao.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      entity.markAsError(message);
      await this.repository.update(entity);
      this.logger.error(`SyncCerc error for ${id}: ${message}`);
    }

    return entity;
  }

  private async persistResultados(
    validationId: string,
    constatacoes: PromiseSettledResult<unknown[]>,
    resultados: PromiseSettledResult<unknown[]>,
  ): Promise<void> {
    const constatacoesList = constatacoes.status === 'fulfilled' && Array.isArray(constatacoes.value)
      ? constatacoes.value
      : [];
    const fallbackList = resultados.status === 'fulfilled' && Array.isArray(resultados.value)
      ? resultados.value
      : [];
    const sourceList = constatacoesList.length > 0 ? constatacoesList : fallbackList;

    if (sourceList.length > 0) {
      await this.resultadoRepository.deleteByValidationId(validationId);
      const entities = sourceList.map((r) => CercValidationResultadoMapper.fromCercResponse(validationId, r));
      await this.resultadoRepository.saveMany(entities);
      const source = constatacoesList.length > 0 ? 'constatacoes' : 'resultados';
      this.logger.log(`CercValidation resultados saved (${source}): ${entities.length} items for ${validationId}`);
      return;
    }

    if (constatacoes.status === 'rejected') {
      this.logger.warn(`CercValidation constatacoes fetch failed for ${validationId}: ${String(constatacoes.reason)}`);
    }
    if (resultados.status === 'rejected') {
      this.logger.warn(`CercValidation resultados fetch failed for ${validationId}: ${String(resultados.reason)}`);
    }
  }

  private async persistEventos(
    validationId: string,
    eventos: PromiseSettledResult<unknown>,
  ): Promise<void> {
    if (eventos.status === 'rejected') {
      this.logger.warn(`CercValidation eventos fetch failed for ${validationId}: ${String(eventos.reason)}`);
      return;
    }

    const rows = CercValidationEventosMapper.fromCercResponse(validationId, eventos.value);
    if (rows.length === 0) return;

    await this.eventosRepository.deleteByValidationId(validationId);
    await this.eventosRepository.saveMany(rows);
    this.logger.log(`CercValidation eventos saved: ${rows.length} for ${validationId}`);
  }

  private async persistPartes(
    validationId: string,
    partes: PromiseSettledResult<unknown>,
    validacaoDados: unknown,
  ): Promise<void> {
    if (partes.status === 'rejected') {
      this.logger.warn(`CercValidation partes fetch failed for ${validationId}: ${String(partes.reason)}`);
      return;
    }

    const rows = CercValidationPartesMapper.fromCercResponse(validationId, partes.value, validacaoDados);
    if (rows.length === 0) return;

    await this.partesRepository.deleteByValidationId(validationId);
    await this.partesRepository.saveMany(rows);
    this.logger.log(`CercValidation partes saved: ${rows.length} for ${validationId}`);
  }

  private async persistDocFiscal(
    validationId: string,
    docFiscal: PromiseSettledResult<unknown>,
  ): Promise<void> {
    if (docFiscal.status === 'rejected') {
      this.logger.warn(`CercValidation docFiscal fetch failed for ${validationId}: ${String(docFiscal.reason)}`);
      return;
    }

    const aggregate = CercValidationDocFiscalMapper.fromCercResponse(validationId, docFiscal.value);
    if (!aggregate.docFiscal) return;

    await this.docFiscalRepository.deleteByValidationId(validationId);
    await this.docFiscalRepository.save(aggregate);
    this.logger.log(`CercValidation docFiscal saved: ${aggregate.produtos.length} produtos, ${aggregate.duplicatas.length} duplicatas for ${validationId}`);
  }
}
