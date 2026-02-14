import {
  Controller,
  Get,
  Post,
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
import { ROLES } from '@nexus/types';
import {
  listInvoicesQuerySchema,
  type ListInvoicesQueryDto,
  rejectInvoiceSchema,
  type RejectInvoiceDto,
  payInvoiceSchema,
  type PayInvoiceDto,
} from '../dto/invoice.dto';
import { ListInvoicesUseCase } from '../use-cases/list-invoices.use-case';
import { UploadInvoiceUseCase } from '../use-cases/upload-invoice.use-case';
import { ApproveInvoiceUseCase } from '../use-cases/approve-invoice.use-case';
import { RejectInvoiceUseCase } from '../use-cases/reject-invoice.use-case';
import { PayInvoiceUseCase } from '../use-cases/pay-invoice.use-case';
import { ListOverdueInvoicesUseCase } from '../use-cases/list-overdue-invoices.use-case';
import { SendInvoiceRemindersUseCase } from '../use-cases/send-invoice-reminders.use-case';
import { GenerateMonthlyPjInvoicesUseCase } from '../use-cases/generate-monthly-pj-invoices.use-case';

@ApiTags('People - Invoices')
@ApiBearerAuth()
@Controller('people/invoices')
@UseGuards(RolesGuard)
export class InvoicesController {
  constructor(
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
    private readonly uploadInvoiceUseCase: UploadInvoiceUseCase,
    private readonly approveInvoiceUseCase: ApproveInvoiceUseCase,
    private readonly rejectInvoiceUseCase: RejectInvoiceUseCase,
    private readonly payInvoiceUseCase: PayInvoiceUseCase,
    private readonly listOverdueInvoicesUseCase: ListOverdueInvoicesUseCase,
    private readonly sendInvoiceRemindersUseCase: SendInvoiceRemindersUseCase,
    private readonly generateMonthlyPjInvoicesUseCase: GenerateMonthlyPjInvoicesUseCase,
  ) {}

  @Get()
  @Roles(...ROLES)
  async list(
    @Query(new ZodValidationPipe(listInvoicesQuerySchema)) query: ListInvoicesQueryDto,
    @CurrentUser() user: { id: string; user_metadata?: { role?: string; collaborator_id?: string } },
  ) {
    const role = user?.user_metadata?.role ?? 'employee';
    const collaboratorId = user?.user_metadata?.collaborator_id;

    const result = await this.listInvoicesUseCase.execute({
      profileId: user.id,
      role,
      collaboratorId,
      filters: {
        status: query.status,
        referenceYear: query.referenceYear,
        referenceMonth: query.referenceMonth,
        page: query.page,
        pageSize: query.pageSize,
      },
    });

    return {
      data: result.invoices.map((inv) => inv.toPlainObject()),
      total: result.total,
    };
  }

  @Get('overdue')
  @Roles('dp', 'hr_admin', 'admin')
  async listOverdue() {
    const invoices = await this.listOverdueInvoicesUseCase.execute();
    return {
      data: invoices.map((inv) => inv.toPlainObject()),
    };
  }

  @Post(':id/upload')
  @Roles(...ROLES)
  @Auditable({ action: 'invoice.upload', entity: 'pj_invoice' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        invoiceNumber: { type: 'string' },
        invoiceAmount: { type: 'string' },
      },
    },
  })
  async upload(
    @Param('id') id: string,
    @Req() req: { body: Record<string, unknown> },
    @CurrentUser() user: { id: string },
  ) {
    const body = req.body as Record<string, { value?: string; toBuffer?: () => Promise<Buffer>; filename?: string; mimetype?: string }>;
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const filePart = body.file;
    if (!filePart?.toBuffer) {
      throw new BadRequestException('File is required');
    }

    const buffer = await filePart.toBuffer();
    const invoiceNumberPart = body.invoiceNumber;
    const invoiceAmountPart = body.invoiceAmount;
    const invoiceNumber = (typeof invoiceNumberPart?.value === 'string' ? invoiceNumberPart.value : '')?.trim() || 'N/A';
    const invoiceAmount = (typeof invoiceAmountPart?.value === 'string' ? invoiceAmountPart.value : '')?.trim();

    if (!invoiceAmount) {
      throw new BadRequestException('invoiceAmount is required');
    }

    const invoice = await this.uploadInvoiceUseCase.execute({
      invoiceId: id,
      profileId: user.id,
      file: {
        buffer,
        originalName: filePart.filename ?? 'invoice.pdf',
        mimetype: filePart.mimetype ?? 'application/pdf',
      },
      invoiceNumber,
      invoiceAmount,
    });

    return { data: invoice.toPlainObject() };
  }

  @Post(':id/approve')
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'invoice.approve', entity: 'pj_invoice' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const invoice = await this.approveInvoiceUseCase.execute(id, user.id);
    return { data: invoice.toPlainObject() };
  }

  @Post(':id/reject')
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'invoice.reject', entity: 'pj_invoice' })
  async reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(rejectInvoiceSchema)) dto: RejectInvoiceDto,
    @CurrentUser() user: { id: string },
  ) {
    const invoice = await this.rejectInvoiceUseCase.execute(id, user.id, dto.reason);
    return { data: invoice.toPlainObject() };
  }

  @Post(':id/pay')
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'invoice.pay', entity: 'pj_invoice' })
  async pay(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(payInvoiceSchema)) dto: PayInvoiceDto,
    @CurrentUser() user: { id: string },
  ) {
    const invoice = await this.payInvoiceUseCase.execute({
      invoiceId: id,
      profileId: user.id,
      paymentReference: dto.paymentReference,
    });
    return { data: invoice.toPlainObject() };
  }

  @Post('generate-monthly')
  @Roles('dp', 'hr_admin', 'admin')
  async generateMonthly() {
    const now = new Date();
    const result = await this.generateMonthlyPjInvoicesUseCase.execute(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    return { data: result };
  }

  @Post('send-reminders')
  @Roles('dp', 'hr_admin', 'admin')
  async sendReminders() {
    const result = await this.sendInvoiceRemindersUseCase.execute();
    return { data: { count: result.count } };
  }
}
