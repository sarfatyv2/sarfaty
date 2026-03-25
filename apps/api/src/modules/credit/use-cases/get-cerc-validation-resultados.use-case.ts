import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import { CERC_VALIDATION_RESULTADO_REPOSITORY, type CercValidationResultadoRepository } from '../domain/cerc-validation-resultado.repository';
import { CercValidationResultadoMapper } from '../infra/mappers/cerc-validation-resultado.mapper';

@Injectable()
export class GetCercValidationResultadosUseCase {
  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly validationRepository: CercValidationRepository,
    @Inject(CERC_VALIDATION_RESULTADO_REPOSITORY)
    private readonly resultadoRepository: CercValidationResultadoRepository,
  ) {}

  async execute(cercValidationId: string): Promise<Record<string, unknown>[]> {
    const validation = await this.validationRepository.getById(cercValidationId);
    if (!validation) throw new NotFoundException(`CercValidation not found: ${cercValidationId}`);

    const resultados = await this.resultadoRepository.getByValidationId(cercValidationId);
    return resultados.map(CercValidationResultadoMapper.toResponse);
  }
}
