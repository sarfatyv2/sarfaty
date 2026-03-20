import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import type { CercValidation } from '../domain/cerc-validation.entity';
import { CercAdapter } from '../bureaus/cerc/cerc.adapter';
import { env } from '../../../config/env';

@Injectable()
export class SyncCercValidationUseCase {
  private readonly logger = new Logger(SyncCercValidationUseCase.name);

  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
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

      // Fetch all details in parallel
      const [constatacoes, eventos, partes, docFiscal] = await Promise.allSettled([
        this.cercAdapter.getConstatacoes(validacao.id),
        this.cercAdapter.getEventos(validacao.id),
        this.cercAdapter.getPartes(validacao.id),
        this.cercAdapter.getDocumentoFiscal(validacao.id),
      ]);

      entity.markAsProcessed({
        validacaoId: validacao.id,
        statusProcessamento,
        validacaoData: validacao,
        constatacoesDados: constatacoes.status === 'fulfilled' ? constatacoes.value : null,
        eventosDados: eventos.status === 'fulfilled' ? eventos.value : null,
        partesDados: partes.status === 'fulfilled' ? partes.value : null,
        docFiscalDados: docFiscal.status === 'fulfilled' ? docFiscal.value : null,
      });

      await this.repository.update(entity);
      this.logger.log(`CercValidation processed: ${id}, validacao: ${validacao.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      entity.markAsError(message);
      await this.repository.update(entity);
      this.logger.error(`SyncCerc error for ${id}: ${message}`);
    }

    return entity;
  }
}
