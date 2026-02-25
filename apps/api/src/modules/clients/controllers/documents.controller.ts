import { BadRequestException, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { uploadDocumentSchema } from '../dto/upload-document.dto';
import { GetDocumentChecklistUseCase } from '../use-cases/get-document-checklist.use-case';
import { CanSubmitUseCase } from '../use-cases/can-submit.use-case';
import { UploadDocumentUseCase } from '../use-cases/upload-document.use-case';
import { DeleteDocumentUseCase } from '../use-cases/delete-document.use-case';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';
import { ClientDocumentMapper } from '../infra/mappers/client-document.mapper';

@ApiTags('Client Documents')
@ApiBearerAuth()
@Controller('clients/:clientId/documents')
@UseGuards(RolesGuard)
export class DocumentsController {
  constructor(
    private readonly getDocumentChecklistUseCase: GetDocumentChecklistUseCase,
    private readonly canSubmitUseCase: CanSubmitUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
  ) {}

  @Get('checklist')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getChecklist(@Param('clientId') clientId: string) {
    const checklist = await this.getDocumentChecklistUseCase.execute(clientId);
    return { data: checklist };
  }

  @Get('can-submit')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async canSubmit(@Param('clientId') clientId: string) {
    const result = await this.canSubmitUseCase.execute(clientId);
    return { data: result };
  }

  @Get()
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async listDocuments(@Param('clientId') clientId: string) {
    const documents = await this.documentRepository.findByClientId(clientId);
    return { data: documents.map(ClientDocumentMapper.toResponse) };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @Auditable({ action: 'client.document.upload', entity: 'client_document' })
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @Param('clientId') clientId: string,
    @Req() request: { body: Record<string, { type?: string; value?: string; filename?: string; mimetype?: string; toBuffer?: () => Promise<Buffer> }> },
    @CurrentUser() user: { id: string },
  ) {
    const body = request.body;

    const fileField = body['file'];
    if (fileField?.type !== 'file' || !fileField.toBuffer) {
      throw new BadRequestException('File is required');
    }

    const fileBuffer = await fileField.toBuffer();

    const rawDto = {
      documentType: body['documentType']?.value,
      documentCategory: body['documentCategory']?.value,
      documentLabel: body['documentLabel']?.value,
      referenceYear: body['referenceYear']?.value,
      referenceMonth: body['referenceMonth']?.value,
      partnerName: body['partnerName']?.value,
      segmentTemplateId: body['segmentTemplateId']?.value,
      productTemplateId: body['productTemplateId']?.value,
      guaranteeTemplateId: body['guaranteeTemplateId']?.value,
      clientGuaranteeId: body['clientGuaranteeId']?.value,
    };

    const parsed = uploadDocumentSchema.safeParse(rawDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }

    const document = await this.uploadDocumentUseCase.execute({
      clientId,
      dto: parsed.data,
      file: {
        buffer: fileBuffer,
        originalName: fileField.filename ?? 'upload',
        mimetype: fileField.mimetype ?? 'application/octet-stream',
      },
      uploadedBy: user.id,
    });
    return { data: ClientDocumentMapper.toResponse(document) };
  }

  @Delete(':documentId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @Auditable({ action: 'client.document.delete', entity: 'client_document' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @Param('clientId') clientId: string,
    @Param('documentId') documentId: string,
  ) {
    await this.deleteDocumentUseCase.execute(clientId, documentId);
  }
}
