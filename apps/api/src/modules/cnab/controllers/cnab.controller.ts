import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { uploadCnabFileSchema, type UploadCnabFileDto } from '../dto/upload-cnab-file.dto';
import { listCnabFilesQuerySchema, type ListCnabFilesQueryDto } from '../dto/list-cnab-files-query.dto';
import { listTradeReceivablesQuerySchema, type ListTradeReceivablesQueryDto } from '../dto/list-trade-receivables-query.dto';
import { listCnabOperationsQuerySchema, type ListCnabOperationsQueryDto } from '../dto/list-cnab-operations-query.dto';
import {
  evaluateReceivableSchema,
  batchEvaluateReceivablesSchema,
  type EvaluateReceivableDto,
  type BatchEvaluateReceivablesDto,
} from '@nexus/validators';
import { UploadCnabFileUseCase } from '../use-cases/upload-cnab-file.use-case';
import { ParseCnabFileUseCase } from '../use-cases/parse-cnab-file.use-case';
import { GetCnabFileUseCase } from '../use-cases/get-cnab-file.use-case';
import { ListCnabFilesUseCase } from '../use-cases/list-cnab-files.use-case';
import { ListTradeReceivablesUseCase } from '../use-cases/list-trade-receivables.use-case';
import { GetCnabOperationUseCase } from '../use-cases/get-cnab-operation.use-case';
import { ListCnabOperationsUseCase } from '../use-cases/list-cnab-operations.use-case';
import { EvaluateReceivableUseCase } from '../use-cases/evaluate-receivable.use-case';
import { BatchEvaluateReceivablesUseCase } from '../use-cases/batch-evaluate-receivables.use-case';
import { CnabParserRegistry } from '../parser/cnab-parser.registry';

const CNAB_ROLES = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'backoffice', 'risk_manager', 'recovery', 'litigation',
  'approver', 'admin',
] as const;

@ApiTags('CNAB')
@ApiBearerAuth()
@Controller('cnab')
@UseGuards(RolesGuard)
export class CnabController {
  constructor(
    private readonly uploadUseCase: UploadCnabFileUseCase,
    private readonly parseUseCase: ParseCnabFileUseCase,
    private readonly getFileUseCase: GetCnabFileUseCase,
    private readonly listFilesUseCase: ListCnabFilesUseCase,
    private readonly listReceivablesUseCase: ListTradeReceivablesUseCase,
    private readonly getCnabOperationUseCase: GetCnabOperationUseCase,
    private readonly listCnabOperationsUseCase: ListCnabOperationsUseCase,
    private readonly evaluateReceivableUseCase: EvaluateReceivableUseCase,
    private readonly batchEvaluateReceivablesUseCase: BatchEvaluateReceivablesUseCase,
    private readonly parserRegistry: CnabParserRegistry,
  ) {}

  // Upload CNAB 400 file (uses Fastify multipart, not Multer)
  @Post('upload')
  @Roles(...CNAB_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  async upload(
    @Req() req: { body: Record<string, { value?: string; toBuffer?: () => Promise<Buffer>; filename?: string }> },
  ) {
    const body = req.body;
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const filePart = body.file;
    if (!filePart?.toBuffer) {
      throw new BadRequestException('File is required');
    }

    const buffer = await filePart.toBuffer();
    const clientId = String(
      (body.clientId as { value?: string } | undefined)?.value ?? (body.clientId as string | undefined) ?? '',
    ).trim();
    const bankCode = String(
      (body.bankCode as { value?: string } | undefined)?.value ?? (body.bankCode as string | undefined) ?? '',
    ).trim();

    const parsed = uploadCnabFileSchema.safeParse({
      clientId,
      bankCode: bankCode && bankCode !== 'auto' ? bankCode : '237',
    });
    if (!parsed.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    }

    const dto = parsed.data as UploadCnabFileDto;
    const originalFilename = filePart.filename ?? 'cnab.rem';
    const fileContent = buffer.toString('latin1');
    const detectedBankCode = this.parserRegistry.detectBankCode(fileContent) ?? dto.bankCode;

    const cnabFile = await this.uploadUseCase.execute({
      clientId: dto.clientId,
      storagePath: `cnab/${dto.clientId}/${Date.now()}_${originalFilename}`,
      originalFilename,
      bankCode: detectedBankCode,
    });

    const result = await this.parseUseCase.execute(cnabFile.id, fileContent);

    const updated = await this.getFileUseCase.execute(cnabFile.id);
    const operationResult = await this.getCnabOperationUseCase.executeByCnabFileId(cnabFile.id);
    return {
      data: updated.toPlainObject(),
      parsed: result,
      operationId: operationResult?.operation.id ?? null,
    };
  }

  @Get('files')
  @Roles(...CNAB_ROLES)
  async listFiles(@Query(new ZodValidationPipe(listCnabFilesQuerySchema)) query: ListCnabFilesQueryDto) {
    const result = await this.listFilesUseCase.execute({
      clientId: query.clientId,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return {
      data: result.files.map((f) => f.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('files/:id')
  @Roles(...CNAB_ROLES)
  async getFile(@Param('id') id: string) {
    const file = await this.getFileUseCase.execute(id);
    return { data: file.toPlainObject() };
  }

  @Get('receivables')
  @Roles(...CNAB_ROLES)
  async listReceivables(@Query(new ZodValidationPipe(listTradeReceivablesQuerySchema)) query: ListTradeReceivablesQueryDto) {
    const result = await this.listReceivablesUseCase.execute({
      clientId: query.clientId,
      draweeId: query.draweeId,
      cnabFileId: query.cnabFileId,
      operationId: query.operationId,
      status: query.status,
      evaluationStatus: query.evaluationStatus,
      dueDateFrom: query.dueDateFrom,
      dueDateTo: query.dueDateTo,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return {
      data: result.receivables.map(({ entity, clientName }) => ({
        ...entity.toPlainObject(),
        clientName,
      })),
      pagination: result.pagination,
    };
  }

  @Get('operations')
  @Roles(...CNAB_ROLES)
  async listOperations(@Query(new ZodValidationPipe(listCnabOperationsQuerySchema)) query: ListCnabOperationsQueryDto) {
    const result = await this.listCnabOperationsUseCase.execute({
      clientId: query.clientId,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return {
      data: result.operations.map((o) => ({
        ...o.toPlainObject(),
        clientName: (o as { clientName?: string }).clientName ?? null,
        originalFilename: (o as { originalFilename?: string }).originalFilename ?? null,
      })),
      pagination: result.pagination,
    };
  }

  @Get('operations/by-file/:cnabFileId')
  @Roles(...CNAB_ROLES)
  async getOperationByFile(@Param('cnabFileId') cnabFileId: string) {
    const result = await this.getCnabOperationUseCase.executeByCnabFileId(cnabFileId);
    if (!result) throw new NotFoundException(`Operação não encontrada para o arquivo ${cnabFileId}`);
    return {
      data: {
        operation: result.operation.toPlainObject(),
        receivables: result.receivables.map((r) => ({
          ...r.toPlainObject(),
          clientName: result.clientName,
        })),
      },
    };
  }

  @Get('operations/:id')
  @Roles(...CNAB_ROLES)
  async getOperation(@Param('id') id: string) {
    const result = await this.getCnabOperationUseCase.executeById(id);
    if (!result) throw new NotFoundException(`Operação não encontrada: ${id}`);
    return {
      data: {
        operation: result.operation.toPlainObject(),
        receivables: result.receivables.map((r) => ({
          ...r.toPlainObject(),
          clientName: result.clientName,
        })),
      },
    };
  }

  @Patch('receivables/:id/evaluate')
  @Roles(...CNAB_ROLES)
  async evaluateReceivable(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(evaluateReceivableSchema)) body: EvaluateReceivableDto,
  ) {
    const updated = await this.evaluateReceivableUseCase.execute({
      receivableId: id,
      evaluationStatus: body.evaluationStatus,
      rejectionReason: body.rejectionReason ?? null,
    });
    if (!updated) throw new NotFoundException(`Duplicata não encontrada ou sem operação vinculada: ${id}`);
    return { data: updated.toPlainObject() };
  }

  @Patch('operations/:id/evaluate-batch')
  @Roles(...CNAB_ROLES)
  async batchEvaluateReceivables(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(batchEvaluateReceivablesSchema)) body: BatchEvaluateReceivablesDto,
  ) {
    const result = await this.batchEvaluateReceivablesUseCase.execute({
      operationId: id,
      items: body.items,
    });
    return {
      data: {
        updated: result.updated.map((r) => r.toPlainObject()),
        failed: result.failed,
      },
    };
  }
}
