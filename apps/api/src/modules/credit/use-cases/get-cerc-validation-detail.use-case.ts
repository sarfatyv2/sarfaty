import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import { CERC_VALIDATION_EVENTOS_REPOSITORY, type CercValidationEventosRepository } from '../domain/cerc-validation-eventos.repository';
import { CERC_VALIDATION_PARTES_REPOSITORY, type CercValidationPartesRepository } from '../domain/cerc-validation-partes.repository';
import { CERC_VALIDATION_DOC_FISCAL_REPOSITORY, type CercValidationDocFiscalRepository } from '../domain/cerc-validation-doc-fiscal.repository';
import { CercValidationMapper, type CercValidationDetails } from '../infra/mappers/cerc-validation.mapper';

@Injectable()
export class GetCercValidationDetailUseCase {
  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
    @Inject(CERC_VALIDATION_EVENTOS_REPOSITORY)
    private readonly eventosRepository: CercValidationEventosRepository,
    @Inject(CERC_VALIDATION_PARTES_REPOSITORY)
    private readonly partesRepository: CercValidationPartesRepository,
    @Inject(CERC_VALIDATION_DOC_FISCAL_REPOSITORY)
    private readonly docFiscalRepository: CercValidationDocFiscalRepository,
  ) {}

  async execute(id: string): Promise<Record<string, unknown>> {
    const entity = await this.repository.getById(id);
    if (!entity) throw new NotFoundException(`CercValidation not found: ${id}`);

    const [eventos, partes, docFiscalAggregate] = await Promise.all([
      this.eventosRepository.findByValidationId(id),
      this.partesRepository.findByValidationId(id),
      this.docFiscalRepository.findByValidationId(id),
    ]);

    const details: CercValidationDetails = {
      eventos,
      partes,
      docFiscal: docFiscalAggregate.docFiscal,
      nfeDuplicatas: docFiscalAggregate.duplicatas,
      nfeProdutos: docFiscalAggregate.produtos,
      nfeEventosFiscais: docFiscalAggregate.eventosFiscais,
    };

    return CercValidationMapper.toDetailResponse(entity, details);
  }
}
