import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createDraweeContactSchema,
  updateDraweeContactSchema,
  type CreateDraweeContactDto,
  type UpdateDraweeContactDto,
} from '@nexus/validators';
import { DRAWEE_CONTACT_REPOSITORY, type DraweeContactRepository } from '../infra/drizzle-drawee-contact.repository';

@ApiTags('Drawee Contacts')
@ApiBearerAuth()
@Controller('drawees/:id/contacts')
@UseGuards(RolesGuard)
export class DraweeContactsController {
  constructor(
    @Inject(DRAWEE_CONTACT_REPOSITORY)
    private readonly contactRepository: DraweeContactRepository,
  ) {}

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Param('id') draweeId: string) {
    const data = await this.contactRepository.findAllByDraweeId(draweeId);
    return { data };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') draweeId: string,
    @Body(new ZodValidationPipe(createDraweeContactSchema)) dto: CreateDraweeContactDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.contactRepository.save({ ...dto, draweeId } as any);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateDraweeContactSchema)) dto: UpdateDraweeContactDto,
  ) {
    const data = await this.contactRepository.update(id, dto as Record<string, unknown>);
    if (!data) throw new NotFoundException(`Contact ${id} not found`);
    return { data };
  }

  @Delete(':subId')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('subId') id: string) {
    const existing = await this.contactRepository.findById(id);
    if (!existing) throw new NotFoundException(`Contact ${id} not found`);
    await this.contactRepository.delete(id);
  }
}
