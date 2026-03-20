import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  async extractNfe(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const data = await this.nfeGeminiService.extract(file.buffer, file.mimetype);
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
