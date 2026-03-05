import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { uploadCnabFileSchema, type UploadCnabFileDto } from '../dto/upload-cnab-file.dto';
import { listCnabFilesQuerySchema, type ListCnabFilesQueryDto } from '../dto/list-cnab-files-query.dto';
import { listTradeReceivablesQuerySchema, type ListTradeReceivablesQueryDto } from '../dto/list-trade-receivables-query.dto';
import { UploadCnabFileUseCase } from '../use-cases/upload-cnab-file.use-case';
import { ParseCnabFileUseCase } from '../use-cases/parse-cnab-file.use-case';
import { GetCnabFileUseCase } from '../use-cases/get-cnab-file.use-case';
import { ListCnabFilesUseCase } from '../use-cases/list-cnab-files.use-case';
import { ListTradeReceivablesUseCase } from '../use-cases/list-trade-receivables.use-case';
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
    private readonly parserRegistry: CnabParserRegistry,
  ) {}

  @Post('upload')
  @Roles(...CNAB_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(uploadCnabFileSchema)) dto: UploadCnabFileDto,
  ) {
    const fileContent = file.buffer.toString('latin1');
    const bankCode = this.parserRegistry.detectBankCode(fileContent) ?? dto.bankCode;

    const cnabFile = await this.uploadUseCase.execute({
      clientId: dto.clientId,
      storagePath: `cnab/${dto.clientId}/${Date.now()}_${file.originalname}`,
      originalFilename: file.originalname,
      bankCode,
    });

    const result = await this.parseUseCase.execute(cnabFile.id, fileContent);

    const updated = await this.getFileUseCase.execute(cnabFile.id);
    return {
      data: updated.toPlainObject(),
      parsed: result,
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
      status: query.status,
      dueDateFrom: query.dueDateFrom,
      dueDateTo: query.dueDateTo,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return {
      data: result.receivables.map((r) => r.toPlainObject()),
      pagination: result.pagination,
    };
  }
}
