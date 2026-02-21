import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createDraweeAddressSchema,
  updateDraweeAddressSchema,
  type CreateDraweeAddressDto,
  type UpdateDraweeAddressDto,
} from '@nexus/validators';
import { DRAWEE_ADDRESS_REPOSITORY, type DraweeAddressRepository } from '../infra/drizzle-drawee-address.repository';

@ApiTags('Drawee Addresses')
@ApiBearerAuth()
@Controller('drawees/:id/addresses')
@UseGuards(RolesGuard)
export class DraweeAddressesController {
  constructor(
    @Inject(DRAWEE_ADDRESS_REPOSITORY)
    private readonly addressRepository: DraweeAddressRepository,
  ) {}

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Param('id') draweeId: string) {
    const data = await this.addressRepository.findAllByDraweeId(draweeId);
    return { data };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') draweeId: string,
    @Body(new ZodValidationPipe(createDraweeAddressSchema)) dto: CreateDraweeAddressDto,
  ) {
    const data = await this.addressRepository.save({ ...dto, draweeId } as any);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateDraweeAddressSchema)) dto: UpdateDraweeAddressDto,
  ) {
    const data = await this.addressRepository.update(id, dto as Record<string, unknown>);
    if (!data) throw new NotFoundException(`Address ${id} not found`);
    return { data };
  }

  @Delete(':subId')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('subId') id: string) {
    const existing = await this.addressRepository.findById(id);
    if (!existing) throw new NotFoundException(`Address ${id} not found`);
    await this.addressRepository.delete(id);
  }
}
