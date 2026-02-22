import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createDraweeBankAccountSchema,
  updateDraweeBankAccountSchema,
  type CreateDraweeBankAccountDto,
  type UpdateDraweeBankAccountDto,
} from '@nexus/validators';
import { DRAWEE_BANK_ACCOUNT_REPOSITORY, type DraweeBankAccountRepository } from '../infra/drizzle-drawee-bank-account.repository';

@ApiTags('Drawee Bank Accounts')
@ApiBearerAuth()
@Controller('drawees/:id/bank-accounts')
@UseGuards(RolesGuard)
export class DraweeBankAccountsController {
  constructor(
    @Inject(DRAWEE_BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: DraweeBankAccountRepository,
  ) {}

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  async list(@Param('id') draweeId: string) {
    const data = await this.bankAccountRepository.findAllByDraweeId(draweeId);
    return { data };
  }

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') draweeId: string,
    @Body(new ZodValidationPipe(createDraweeBankAccountSchema)) dto: CreateDraweeBankAccountDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.bankAccountRepository.save({ ...dto, draweeId } as any);
    return { data };
  }

  @Patch(':subId')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async update(
    @Param('subId') id: string,
    @Body(new ZodValidationPipe(updateDraweeBankAccountSchema)) dto: UpdateDraweeBankAccountDto,
  ) {
    const data = await this.bankAccountRepository.update(id, dto as Record<string, unknown>);
    if (!data) throw new NotFoundException(`Bank account ${id} not found`);
    return { data };
  }

  @Delete(':subId')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('subId') id: string) {
    const existing = await this.bankAccountRepository.findById(id);
    if (!existing) throw new NotFoundException(`Bank account ${id} not found`);
    await this.bankAccountRepository.delete(id);
  }
}
