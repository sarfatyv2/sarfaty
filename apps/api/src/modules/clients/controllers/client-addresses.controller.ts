import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createClientAddressSchema,
  updateClientAddressSchema,
  type CreateClientAddressDto,
  type UpdateClientAddressDto,
} from '@nexus/validators';
import { ListClientAddressesUseCase } from '../use-cases/list-client-addresses.use-case';
import { CreateClientAddressUseCase } from '../use-cases/create-client-address.use-case';
import { UpdateClientAddressUseCase } from '../use-cases/update-client-address.use-case';
import { DeleteClientAddressUseCase } from '../use-cases/delete-client-address.use-case';

@ApiTags('Client Addresses')
@ApiBearerAuth()
@Controller('clients/:id/addresses')
@UseGuards(RolesGuard)
export class ClientAddressesController {
  constructor(
    private readonly listUseCase: ListClientAddressesUseCase,
    private readonly createUseCase: CreateClientAddressUseCase,
    private readonly updateUseCase: UpdateClientAddressUseCase,
    private readonly deleteUseCase: DeleteClientAddressUseCase,
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
    @Body(new ZodValidationPipe(createClientAddressSchema)) dto: CreateClientAddressDto,
  ) {
    const data = await this.createUseCase.execute(clientId, dto);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateClientAddressSchema)) dto: UpdateClientAddressDto,
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
