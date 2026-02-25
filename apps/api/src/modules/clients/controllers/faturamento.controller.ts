import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GetFaturamentoExtractionUseCase } from '../use-cases/get-faturamento-extraction.use-case';
import { ProcessFaturamentoDocumentUseCase } from '../use-cases/process-faturamento-document.use-case';
import { FaturamentoExtractionMapper } from '../infra/mappers/faturamento-extraction.mapper';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';

@ApiTags('Faturamento Extractions')
@ApiBearerAuth()
@Controller('clients/:clientId/faturamento-extractions')
@UseGuards(RolesGuard)
export class FaturamentoController {
  constructor(
    private readonly getFaturamentoExtraction: GetFaturamentoExtractionUseCase,
    private readonly processFaturamentoDocument: ProcessFaturamentoDocumentUseCase,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
  ) {}

  @Get()
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'risk_manager', 'legal', 'admin',
  )
  async listExtractions(@Param('clientId') clientId: string) {
    const extractions = await this.getFaturamentoExtraction.getByClient(clientId);
    return { data: extractions.map(FaturamentoExtractionMapper.toResponse) };
  }

  @Get(':extractionId')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'risk_manager', 'legal', 'admin',
  )
  async getExtraction(
    @Param('clientId') clientId: string,
    @Param('extractionId') extractionId: string,
  ) {
    const extraction = await this.getFaturamentoExtraction.getById(clientId, extractionId);
    return { data: FaturamentoExtractionMapper.toResponse(extraction) };
  }

  @Post(':documentId/reprocess')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('credit_analyst', 'compliance_officer', 'admin')
  async reprocessDocument(
    @Param('clientId') clientId: string,
    @Param('documentId') documentId: string,
  ) {
    const document = await this.documentRepository.findById(documentId);
    if (document?.clientId !== clientId) {
      return { error: `Document ${documentId} not found for client ${clientId}` };
    }

    void this.processFaturamentoDocument
      .execute({
        documentId,
        clientId,
        storagePath: document.storagePath,
        mimeType: document.mimeType ?? 'application/pdf',
        referenceYear: document.referenceYear,
      })
      .catch(() => {
        // Errors are logged inside the use case
      });

    return { data: { status: 'reprocessing_scheduled', documentId } };
  }
}
