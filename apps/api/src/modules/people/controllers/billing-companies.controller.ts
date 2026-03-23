import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import {
  createBillingCompanySchema,
  updateBillingCompanySchema,
  type CreateBillingCompanyDto,
  type UpdateBillingCompanyDto,
} from '@nexus/validators';
import { ListBillingCompaniesUseCase } from '../use-cases/list-billing-companies.use-case';
import { CreateBillingCompanyUseCase } from '../use-cases/create-billing-company.use-case';
import { UpdateBillingCompanyUseCase } from '../use-cases/update-billing-company.use-case';

@ApiTags('People - Billing companies')
@ApiBearerAuth()
@Controller('people/billing-companies')
@UseGuards(RolesGuard)
export class BillingCompaniesController {
  constructor(
    private readonly listBillingCompaniesUseCase: ListBillingCompaniesUseCase,
    private readonly createBillingCompanyUseCase: CreateBillingCompanyUseCase,
    private readonly updateBillingCompanyUseCase: UpdateBillingCompanyUseCase,
  ) {}

  @Get()
  @Roles('dp', 'hr_admin', 'admin')
  async list(@Query('includeInactive') includeInactive?: string) {
    const companies = await this.listBillingCompaniesUseCase.execute(
      includeInactive === 'true',
    );
    return {
      data: companies.map((c) => c.toPlainObject()),
    };
  }

  @Post()
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'billing_company.create', entity: 'billing_company' })
  async create(
    @Body(new ZodValidationPipe(createBillingCompanySchema)) dto: CreateBillingCompanyDto,
  ) {
    const company = await this.createBillingCompanyUseCase.execute({
      name: dto.name,
      tradeName: dto.tradeName,
      cnpj: dto.cnpj,
      isActive: dto.isActive,
    });
    return { data: company.toPlainObject() };
  }

  @Patch(':id')
  @Roles('dp', 'hr_admin', 'admin')
  @Auditable({ action: 'billing_company.update', entity: 'billing_company' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBillingCompanySchema)) dto: UpdateBillingCompanyDto,
  ) {
    const company = await this.updateBillingCompanyUseCase.execute(id, dto);
    if (!company) {
      throw new NotFoundException('Billing company not found');
    }
    return { data: company.toPlainObject() };
  }
}
