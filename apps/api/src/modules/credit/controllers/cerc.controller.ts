import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RequestCercValidationUseCase } from '../use-cases/request-cerc-validation.use-case';
import { SyncCercValidationUseCase } from '../use-cases/sync-cerc-validation.use-case';
import { GetCercValidationUseCase } from '../use-cases/get-cerc-validation.use-case';
import { ListCercValidationsUseCase } from '../use-cases/list-cerc-validations.use-case';
import { CercValidationMapper } from '../infra/mappers/cerc-validation.mapper';
import { NfeGeminiService } from '../infra/gemini/nfe-gemini.service';

interface CercValidarDuplicataBody {
  veiculoId?: string;
  numeroDuplicata: string;
  chaveNfe: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  cnpjOriginador: string;
  tipoDocumentoFiscal?: string;
  referenciaExterna?: string;
  planodeCobranca?: number;
}

const CERC_ROLES = [
  'credit_analyst', 'approver', 'risk_manager', 'admin',
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
] as const;

@ApiTags('CERC')
@ApiBearerAuth()
@Controller('credit/cerc')
@UseGuards(RolesGuard)
export class CercController {
  constructor(
    private readonly requestCercValidationUseCase: RequestCercValidationUseCase,
    private readonly syncCercValidationUseCase: SyncCercValidationUseCase,
    private readonly getCercValidationUseCase: GetCercValidationUseCase,
    private readonly listCercValidationsUseCase: ListCercValidationsUseCase,
    private readonly nfeGeminiService: NfeGeminiService,
  ) {}

  @Post('extract-nfe')
  @Roles(...CERC_ROLES)
  @ApiConsumes('multipart/form-data')
  async extractNfe(
    @Req() req: { body: Record<string, { toBuffer?: () => Promise<Buffer>; filename?: string; mimetype?: string }> },
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
    const mimetype = filePart.mimetype ?? 'application/octet-stream';
    const data = await this.nfeGeminiService.extract(buffer, mimetype);
    return { data };
  }

  @Post('validar')
  @Roles(...CERC_ROLES)
  async validarDuplicata(@Body() body: CercValidarDuplicataBody) {
    const entity = await this.requestCercValidationUseCase.execute(body);
    return { data: CercValidationMapper.toResponse(entity) };
  }

  @Post('validar/:id/sync')
  @Roles(...CERC_ROLES)
  async syncValidacao(@Param('id') id: string) {
    const entity = await this.syncCercValidationUseCase.execute(id);
    return { data: CercValidationMapper.toResponse(entity) };
  }

  @Get('validar/:id')
  @Roles(...CERC_ROLES)
  async getValidacao(@Param('id') id: string) {
    const entity = await this.getCercValidationUseCase.execute(id);
    return { data: CercValidationMapper.toResponse(entity) };
  }

  @Get('validacoes')
  @Roles(...CERC_ROLES)
  async listValidacoes() {
    const entities = await this.listCercValidationsUseCase.execute();
    return { data: entities.map(CercValidationMapper.toResponse) };
  }
}
