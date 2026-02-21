import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createDraweeSchema, type CreateDraweeDto } from '../dto/create-drawee.dto';
import { updateDraweeSchema, type UpdateDraweeDto } from '../dto/update-drawee.dto';
import { listDraweesQuerySchema, type ListDraweesQueryDto } from '../dto/list-drawees-query.dto';
import { CreateDraweeUseCase } from '../use-cases/create-drawee.use-case';
import { GetDraweeUseCase } from '../use-cases/get-drawee.use-case';
import { ListDraweesUseCase } from '../use-cases/list-drawees.use-case';
import { UpdateDraweeUseCase } from '../use-cases/update-drawee.use-case';

@ApiTags('Drawees')
@ApiBearerAuth()
@Controller('drawees')
@UseGuards(RolesGuard)
export class DraweesController {
  constructor(
    private readonly createUseCase: CreateDraweeUseCase,
    private readonly getUseCase: GetDraweeUseCase,
    private readonly listUseCase: ListDraweesUseCase,
    private readonly updateUseCase: UpdateDraweeUseCase,
  ) {}

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createDraweeSchema)) dto: CreateDraweeDto) {
    const drawee = await this.createUseCase.execute(dto);
    return { data: drawee.toPlainObject() };
  }

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Query(new ZodValidationPipe(listDraweesQuerySchema)) query: ListDraweesQueryDto) {
    return this.listUseCase.execute(query);
  }

  @Get(':id')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async findOne(@Param('id') id: string) {
    const drawee = await this.getUseCase.execute(id);
    return { data: drawee.toPlainObject() };
  }

  @Patch(':id')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDraweeSchema)) dto: UpdateDraweeDto,
  ) {
    const drawee = await this.updateUseCase.execute(id, dto);
    return { data: drawee.toPlainObject() };
  }
}
