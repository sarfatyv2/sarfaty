import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createReimbursementSchema,
  type CreateReimbursementDto,
  updateReimbursementSchema,
  type UpdateReimbursementDto,
  listReimbursementsQuerySchema,
  type ListReimbursementsQueryDto,
  rejectReimbursementSchema,
  type RejectReimbursementDto,
  payReimbursementSchema,
  type PayReimbursementDto,
} from '../dto/reimbursement.dto';
import { ListReimbursementsUseCase } from '../use-cases/list-reimbursements.use-case';
import { CreateReimbursementUseCase } from '../use-cases/create-reimbursement.use-case';
import { UpdateReimbursementUseCase } from '../use-cases/update-reimbursement.use-case';
import { ApproveReimbursementUseCase } from '../use-cases/approve-reimbursement.use-case';
import { RejectReimbursementUseCase } from '../use-cases/reject-reimbursement.use-case';
import { PayReimbursementUseCase } from '../use-cases/pay-reimbursement.use-case';
import { UploadReceiptUseCase } from '../use-cases/upload-receipt.use-case';
import { GetReceiptUrlUseCase } from '../use-cases/get-receipt-url.use-case';

@ApiTags('People - Reimbursements')
@ApiBearerAuth()
@Controller('people/reimbursements')
@UseGuards(RolesGuard)
export class ReimbursementsController {
  constructor(
    private readonly listReimbursementsUseCase: ListReimbursementsUseCase,
    private readonly createReimbursementUseCase: CreateReimbursementUseCase,
    private readonly updateReimbursementUseCase: UpdateReimbursementUseCase,
    private readonly approveReimbursementUseCase: ApproveReimbursementUseCase,
    private readonly rejectReimbursementUseCase: RejectReimbursementUseCase,
    private readonly payReimbursementUseCase: PayReimbursementUseCase,
    private readonly uploadReceiptUseCase: UploadReceiptUseCase,
    private readonly getReceiptUrlUseCase: GetReceiptUrlUseCase,
  ) {}

  @Get()
  @Roles('employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  async list(
    @Query(new ZodValidationPipe(listReimbursementsQuerySchema)) query: ListReimbursementsQueryDto,
    @CurrentUser() user: { id: string; user_metadata?: { role?: string; collaborator_id?: string } },
  ) {
    const role = user?.user_metadata?.role ?? 'employee';
    const collaboratorId = user?.user_metadata?.collaborator_id;

    const result = await this.listReimbursementsUseCase.execute({
      profileId: user.id,
      role,
      collaboratorId,
      managerCollaboratorId: role === 'people_manager' ? collaboratorId : undefined,
      filters: {
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      },
    });

    return {
      data: result.reimbursements.map((r) => r.toPlainObject()),
      total: result.total,
    };
  }

  @Post()
  @Roles('employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'reimbursement.create', entity: 'reimbursement' })
  async create(
    @Body(new ZodValidationPipe(createReimbursementSchema)) dto: CreateReimbursementDto,
    @CurrentUser() user: { id: string },
  ) {
    const reimbursement = await this.createReimbursementUseCase.execute({
      profileId: user.id,
      data: dto,
    });
    return { data: reimbursement.toPlainObject() };
  }

  @Get(':id/receipt-url')
  @Roles('employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  async getReceiptUrl(@Param('id') id: string) {
    const result = await this.getReceiptUrlUseCase.execute(id);
    return { data: result };
  }

  @Post(':id/upload')
  @Roles('employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async upload(
    @Param('id') id: string,
    @Req() req: { body: Record<string, unknown> },
    @CurrentUser() user: { id: string },
  ) {
    const body = req.body as Record<string, { toBuffer?: () => Promise<Buffer>; filename?: string; mimetype?: string }>;
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const filePart = body.file;
    if (!filePart?.toBuffer) {
      throw new BadRequestException('File is required');
    }

    const buffer = await filePart.toBuffer();
    const reimbursement = await this.uploadReceiptUseCase.execute({
      reimbursementId: id,
      profileId: user.id,
      file: {
        buffer,
        originalName: filePart.filename ?? 'receipt.pdf',
        mimetype: filePart.mimetype ?? 'application/pdf',
      },
    });

    return { data: reimbursement.toPlainObject() };
  }

  @Patch(':id')
  @Roles('employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateReimbursementSchema)) dto: UpdateReimbursementDto,
    @CurrentUser() user: { id: string },
  ) {
    const reimbursement = await this.updateReimbursementUseCase.execute({
      reimbursementId: id,
      profileId: user.id,
      data: dto,
    });
    return { data: reimbursement.toPlainObject() };
  }

  @Post(':id/approve')
  @Roles('people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'reimbursement.approve', entity: 'reimbursement' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const reimbursement = await this.approveReimbursementUseCase.execute(id, user.id);
    return { data: reimbursement.toPlainObject() };
  }

  @Post(':id/reject')
  @Roles('people_manager', 'hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'reimbursement.reject', entity: 'reimbursement' })
  async reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(rejectReimbursementSchema)) dto: RejectReimbursementDto,
    @CurrentUser() user: { id: string },
  ) {
    const reimbursement = await this.rejectReimbursementUseCase.execute(id, user.id, dto.reason);
    return { data: reimbursement.toPlainObject() };
  }

  @Post(':id/pay')
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'reimbursement.pay', entity: 'reimbursement' })
  async pay(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(payReimbursementSchema)) dto: PayReimbursementDto,
    @CurrentUser() user: { id: string },
  ) {
    const reimbursement = await this.payReimbursementUseCase.execute({
      reimbursementId: id,
      profileId: user.id,
      paymentReference: dto.paymentReference,
    });
    return { data: reimbursement.toPlainObject() };
  }
}
