import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createClientBankAccountSchema,
  updateClientBankAccountSchema,
  type CreateClientBankAccountDto,
  type UpdateClientBankAccountDto,
} from '@nexus/validators';
import { ListClientBankAccountsUseCase } from '../use-cases/list-client-bank-accounts.use-case';
import { CreateClientBankAccountUseCase } from '../use-cases/create-client-bank-account.use-case';
import { UpdateClientBankAccountUseCase } from '../use-cases/update-client-bank-account.use-case';
import { DeleteClientBankAccountUseCase } from '../use-cases/delete-client-bank-account.use-case';

@ApiTags('Client Bank Accounts')
@ApiBearerAuth()
@Controller('clients/:id/bank-accounts')
@UseGuards(RolesGuard)
export class ClientBankAccountsController {
  constructor(
    private readonly listUseCase: ListClientBankAccountsUseCase,
    private readonly createUseCase: CreateClientBankAccountUseCase,
    private readonly updateUseCase: UpdateClientBankAccountUseCase,
    private readonly deleteUseCase: DeleteClientBankAccountUseCase,
  ) {}

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Param('id') clientId: string) {
    const data = await this.listUseCase.execute(clientId);
    return { data };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') clientId: string,
    @Body(new ZodValidationPipe(createClientBankAccountSchema)) dto: CreateClientBankAccountDto,
  ) {
    const data = await this.createUseCase.execute(clientId, dto);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateClientBankAccountSchema)) dto: UpdateClientBankAccountDto,
  ) {
    const data = await this.updateUseCase.execute(id, dto);
    return { data };
  }

  @Delete(':subId')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('subId') id: string) {
    await this.deleteUseCase.execute(id);
  }
}
