import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ValidateCnpjUseCase } from '../use-cases/validate-cnpj.use-case';

@ApiTags('CNPJ')
@ApiBearerAuth()
@Controller('cnpj')
@UseGuards(RolesGuard)
export class CnpjController {
  constructor(
    private readonly validateCnpjUseCase: ValidateCnpjUseCase,
  ) {}

  @Get(':cnpj/validate')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async validate(@Param('cnpj') cnpj: string) {
    const result = await this.validateCnpjUseCase.execute(cnpj);
    return { data: result };
  }
}
