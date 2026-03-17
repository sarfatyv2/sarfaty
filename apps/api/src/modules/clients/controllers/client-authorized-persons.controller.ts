import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createClientAuthorizedPersonSchema,
  updateClientAuthorizedPersonSchema,
  type CreateClientAuthorizedPersonDto,
  type UpdateClientAuthorizedPersonDto,
} from '@nexus/validators';
import { ListClientAuthorizedPersonsUseCase } from '../use-cases/list-client-authorized-persons.use-case';
import { CreateClientAuthorizedPersonUseCase } from '../use-cases/create-client-authorized-person.use-case';
import { UpdateClientAuthorizedPersonUseCase } from '../use-cases/update-client-authorized-person.use-case';
import { DeleteClientAuthorizedPersonUseCase } from '../use-cases/delete-client-authorized-person.use-case';
import { GetPartnerBureauDataUseCase } from '../use-cases/get-partner-bureau-data.use-case';

@ApiTags('Client Authorized Persons')
@ApiBearerAuth()
@Controller('clients/:id/authorized-persons')
@UseGuards(RolesGuard)
export class ClientAuthorizedPersonsController {
  constructor(
    private readonly listUseCase: ListClientAuthorizedPersonsUseCase,
    private readonly createUseCase: CreateClientAuthorizedPersonUseCase,
    private readonly updateUseCase: UpdateClientAuthorizedPersonUseCase,
    private readonly deleteUseCase: DeleteClientAuthorizedPersonUseCase,
    private readonly getPartnerBureauDataUseCase: GetPartnerBureauDataUseCase,
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
    @Body(new ZodValidationPipe(createClientAuthorizedPersonSchema)) dto: CreateClientAuthorizedPersonDto,
  ) {
    const data = await this.createUseCase.execute(clientId, dto);
    return { data };
  }

  @Get(':subId/bureau-data')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async getPartnerBureauData(
    @Param('id') clientId: string,
    @Param('subId') authorizedPersonId: string,
  ) {
    const data = await this.getPartnerBureauDataUseCase.execute(clientId, authorizedPersonId);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateClientAuthorizedPersonSchema)) dto: UpdateClientAuthorizedPersonDto,
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
