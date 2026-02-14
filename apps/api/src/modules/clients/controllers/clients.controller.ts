import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createClientSchema, type CreateClientDto } from '../dto/create-client.dto';
import { updateClientSchema, type UpdateClientDto } from '../dto/update-client.dto';
import { listClientsQuerySchema, type ListClientsQueryDto } from '../dto/list-clients-query.dto';
import { CreateClientUseCase } from '../use-cases/create-client.use-case';
import { GetClientUseCase } from '../use-cases/get-client.use-case';
import { ListClientsUseCase } from '../use-cases/list-clients.use-case';
import { UpdateClientUseCase } from '../use-cases/update-client.use-case';
import { SubmitForAnalysisUseCase } from '../use-cases/submit-for-analysis.use-case';
import type { Role } from '@nexus/types';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(RolesGuard)
export class ClientsController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getClientUseCase: GetClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly submitForAnalysisUseCase: SubmitForAnalysisUseCase,
  ) {}

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @Auditable({ action: 'client.create', entity: 'client' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createClientSchema)) dto: CreateClientDto,
    @CurrentUser() user: { id: string; user_metadata: { role: Role; team_id?: string; region_id?: string } },
  ) {
    const client = await this.createClientUseCase.execute({
      dto,
      assignedTo: user.id,
      teamId: user.user_metadata.team_id || null,
      regionId: user.user_metadata.region_id || null,
    });
    return { data: client.toPlainObject() };
  }

  @Get()
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async list(
    @Query(new ZodValidationPipe(listClientsQuerySchema)) query: ListClientsQueryDto,
  ) {
    const result = await this.listClientsUseCase.execute(query);
    return {
      data: result.clients.map((c) => c.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async findOne(@Param('id') id: string) {
    const client = await this.getClientUseCase.execute(id);
    return { data: client.toPlainObject() };
  }

  @Patch(':id')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @Auditable({ action: 'client.update', entity: 'client' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClientSchema)) dto: UpdateClientDto,
  ) {
    const client = await this.updateClientUseCase.execute(id, dto);
    return { data: client.toPlainObject() };
  }

  @Post(':id/submit')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @Auditable({ action: 'client.submit', entity: 'client' })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const client = await this.submitForAnalysisUseCase.execute(id, user.id);
    return { data: client.toPlainObject() };
  }
}
