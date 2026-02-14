import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { uploadDocumentSchema, type UploadDocumentDto } from '../dto/upload-document.dto';
import { GetDocumentChecklistUseCase } from '../use-cases/get-document-checklist.use-case';
import { CanSubmitUseCase } from '../use-cases/can-submit.use-case';
import { UploadDocumentUseCase } from '../use-cases/upload-document.use-case';
import { DeleteDocumentUseCase } from '../use-cases/delete-document.use-case';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';
import { Inject } from '@nestjs/common';
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
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @Param('clientId') clientId: string,
    @Body(new ZodValidationPipe(uploadDocumentSchema)) dto: UploadDocumentDto,
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @CurrentUser() user: { id: string },
  ) {
    const document = await this.uploadDocumentUseCase.execute({
      clientId,
      dto,
      file: {
        buffer: file.buffer,
        originalName: file.originalname,
        mimetype: file.mimetype,
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
