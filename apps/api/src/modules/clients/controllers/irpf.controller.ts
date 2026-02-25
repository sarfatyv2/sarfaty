import {
  Controller,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GetIrpfExtractionUseCase } from '../use-cases/get-irpf-extraction.use-case';
import { ProcessIrpfDocumentUseCase } from '../use-cases/process-irpf-document.use-case';
import { IrpfExtractionMapper } from '../infra/mappers/irpf-extraction.mapper';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';
import { IRPF_EXTRACTION_REPOSITORY, type IrpfExtractionRepository } from '../domain/irpf-extraction.repository';

@ApiTags('IRPF Extractions')
@ApiBearerAuth()
@Controller('clients/:clientId/irpf-extractions')
@UseGuards(RolesGuard)
export class IrpfController {
  private readonly logger = new Logger(IrpfController.name);

  constructor(
    private readonly getIrpfExtraction: GetIrpfExtractionUseCase,
    private readonly processIrpfDocument: ProcessIrpfDocumentUseCase,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
    @Inject(IRPF_EXTRACTION_REPOSITORY)
    private readonly extractionRepository: IrpfExtractionRepository,
  ) {}

  @Get()
  async listExtractions(@Param('clientId') clientId: string) {
    const extractions = await this.getIrpfExtraction.getByClient(clientId);
    return { data: extractions.map(IrpfExtractionMapper.toResponse) };
  }

  @Get(':extractionId')
  async getExtraction(
    @Param('clientId') clientId: string,
    @Param('extractionId') extractionId: string,
  ) {
    const extraction = await this.getIrpfExtraction.getById(clientId, extractionId);
    return { data: IrpfExtractionMapper.toResponse(extraction) };
  }

  @Post(':extractionId/reprocess')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('credit_analyst', 'compliance_officer', 'admin')
  async reprocessDocument(
    @Param('clientId') clientId: string,
    @Param('extractionId') extractionId: string,
  ) {
    const extraction = await this.extractionRepository.findById(extractionId);
    if (!extraction || extraction.clientId !== clientId) {
      throw new NotFoundException(`IRPF extraction ${extractionId} not found for client ${clientId}`);
    }

    const sources = await this.extractionRepository.findSourcesByExtractionId(extractionId);
    if (sources.length === 0) {
      throw new NotFoundException(`No source documents found for extraction ${extractionId}`);
    }

    // Use the most recent source document (last in the list)
    const lastSource = sources[sources.length - 1];
    const { documentId } = lastSource!;
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Source document ${documentId} not found`);
    }

    this.logger.log(`Scheduling reprocess of extraction ${extractionId} using document ${documentId}`);

    void this.processIrpfDocument
      .execute({
        documentId,
        clientId,
        storagePath: document.storagePath,
        authorizedPersonId: null,
        partnerName: document.partnerName,
        referenceYear: document.referenceYear,
      })
      .catch(() => {
        // Errors are logged inside the use case
      });

    return { data: { status: 'reprocessing_scheduled', extractionId, documentId } };
  }
}
