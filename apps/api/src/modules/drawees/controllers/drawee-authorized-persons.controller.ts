import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createDraweeAuthorizedPersonSchema,
  updateDraweeAuthorizedPersonSchema,
  type CreateDraweeAuthorizedPersonDto,
  type UpdateDraweeAuthorizedPersonDto,
} from '@nexus/validators';
import { ListDraweeAuthorizedPersonsUseCase } from '../use-cases/list-drawee-authorized-persons.use-case';
import { CreateDraweeAuthorizedPersonUseCase } from '../use-cases/create-drawee-authorized-person.use-case';
import { UpdateDraweeAuthorizedPersonUseCase } from '../use-cases/update-drawee-authorized-person.use-case';
import { DeleteDraweeAuthorizedPersonUseCase } from '../use-cases/delete-drawee-authorized-person.use-case';

@ApiTags('Drawee Authorized Persons')
@ApiBearerAuth()
@Controller('drawees/:id/authorized-persons')
@UseGuards(RolesGuard)
export class DraweeAuthorizedPersonsController {
  constructor(
    private readonly listUseCase: ListDraweeAuthorizedPersonsUseCase,
    private readonly createUseCase: CreateDraweeAuthorizedPersonUseCase,
    private readonly updateUseCase: UpdateDraweeAuthorizedPersonUseCase,
    private readonly deleteUseCase: DeleteDraweeAuthorizedPersonUseCase,
  ) {}

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Param('id') draweeId: string) {
    const data = await this.listUseCase.execute(draweeId);
    return { data };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') draweeId: string,
    @Body(new ZodValidationPipe(createDraweeAuthorizedPersonSchema)) dto: CreateDraweeAuthorizedPersonDto,
  ) {
    const data = await this.createUseCase.execute(draweeId, dto);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') personId: string,
    @Body(new ZodValidationPipe(updateDraweeAuthorizedPersonSchema)) dto: UpdateDraweeAuthorizedPersonDto,
  ) {
    const data = await this.updateUseCase.execute(personId, dto);
    return { data };
  }

  @Delete(':subId')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('subId') personId: string) {
    await this.deleteUseCase.execute(personId);
  }
}
