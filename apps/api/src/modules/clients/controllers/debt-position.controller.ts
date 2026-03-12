import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createDebtPositionSchema, updateDebtPositionSchema } from '@nexus/validators';
import { ListDebtPositionsUseCase } from '../use-cases/list-debt-positions.use-case';
import { CreateDebtPositionUseCase } from '../use-cases/create-debt-position.use-case';
import { UpdateDebtPositionUseCase } from '../use-cases/update-debt-position.use-case';
import { DeleteDebtPositionUseCase } from '../use-cases/delete-debt-position.use-case';
import { ProcessDebtPositionDocumentUseCase } from '../use-cases/process-debt-position-document.use-case';
import { DebtPositionItemMapper } from '../infra/mappers/debt-position-item.mapper';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';

const READ_ROLES = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
  'risk_manager', 'legal', 'admin',
] as const;

const WRITE_ROLES = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'backoffice', 'admin',
] as const;

@ApiTags('Debt Positions')
@ApiBearerAuth()
@Controller('clients/:clientId/debt-positions')
@UseGuards(RolesGuard)
export class DebtPositionController {
  constructor(
    private readonly listDebtPositions: ListDebtPositionsUseCase,
    private readonly createDebtPosition: CreateDebtPositionUseCase,
    private readonly updateDebtPosition: UpdateDebtPositionUseCase,
    private readonly deleteDebtPosition: DeleteDebtPositionUseCase,
    private readonly processDebtPositionDocument: ProcessDebtPositionDocumentUseCase,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
  ) {}

  @Get()
  @Roles(...READ_ROLES)
  async list(@Param('clientId') clientId: string) {
    const items = await this.listDebtPositions.execute(clientId);
    return { data: items.map(DebtPositionItemMapper.toResponse) };
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('clientId') clientId: string,
    @Body(new ZodValidationPipe(createDebtPositionSchema)) body: unknown,
  ) {
    const dto = createDebtPositionSchema.parse(body);
    const item = await this.createDebtPosition.execute({ clientId, dto });
    return { data: DebtPositionItemMapper.toResponse(item) };
  }

  @Patch(':itemId')
  @Roles(...WRITE_ROLES)
  async update(
    @Param('clientId') clientId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(updateDebtPositionSchema)) body: unknown,
  ) {
    const dto = updateDebtPositionSchema.parse(body);
    const item = await this.updateDebtPosition.execute({ clientId, itemId, dto });
    return { data: DebtPositionItemMapper.toResponse(item) };
  }

  @Delete(':itemId')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('clientId') clientId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.deleteDebtPosition.execute({ clientId, itemId });
  }

  @Post('reprocess/:documentId')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('credit_analyst', 'compliance_officer', 'backoffice', 'admin')
  async reprocess(
    @Param('clientId') clientId: string,
    @Param('documentId') documentId: string,
  ) {
    const document = await this.documentRepository.findById(documentId);
    if (document?.clientId !== clientId) {
      throw new NotFoundException(`Document ${documentId} not found for client ${clientId}`);
    }

    void this.processDebtPositionDocument
      .execute({
        documentId,
        clientId,
        storagePath: document.storagePath,
        mimeType: document.mimeType ?? 'application/pdf',
      })
      .catch(() => {
        // Errors are logged inside the use case
      });

    return { data: { status: 'reprocessing_scheduled', documentId } };
  }
}
