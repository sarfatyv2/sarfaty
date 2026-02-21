import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createClientContactSchema,
  updateClientContactSchema,
  type CreateClientContactDto,
  type UpdateClientContactDto,
} from '@nexus/validators';
import { ListClientContactsUseCase } from '../use-cases/list-client-contacts.use-case';
import { CreateClientContactUseCase } from '../use-cases/create-client-contact.use-case';
import { UpdateClientContactUseCase } from '../use-cases/update-client-contact.use-case';
import { DeleteClientContactUseCase } from '../use-cases/delete-client-contact.use-case';

@ApiTags('Client Contacts')
@ApiBearerAuth()
@Controller('clients/:id/contacts')
@UseGuards(RolesGuard)
export class ClientContactsController {
  constructor(
    private readonly listUseCase: ListClientContactsUseCase,
    private readonly createUseCase: CreateClientContactUseCase,
    private readonly updateUseCase: UpdateClientContactUseCase,
    private readonly deleteUseCase: DeleteClientContactUseCase,
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
    @Body(new ZodValidationPipe(createClientContactSchema)) dto: CreateClientContactDto,
  ) {
    const data = await this.createUseCase.execute(clientId, dto);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateClientContactSchema)) dto: UpdateClientContactDto,
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
