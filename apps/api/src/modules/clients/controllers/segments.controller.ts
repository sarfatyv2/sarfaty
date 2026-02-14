import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { segments, creditProducts, guaranteeTypes } from '../../../database/schema';

@ApiTags('Segments')
@ApiBearerAuth()
@Controller('segments')
@UseGuards(RolesGuard)
export class SegmentsController {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  @Get()
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice', 'admin',
  )
  async listSegments() {
    const rows = await this.db
      .select()
      .from(segments)
      .where(eq(segments.isActive, true));
    return { data: rows };
  }

  @Get('credit-products')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice', 'admin',
  )
  async listCreditProducts() {
    const rows = await this.db
      .select()
      .from(creditProducts)
      .where(eq(creditProducts.isActive, true));
    return { data: rows };
  }

  @Get('guarantee-types')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice', 'admin',
  )
  async listGuaranteeTypes() {
    const rows = await this.db
      .select()
      .from(guaranteeTypes)
      .where(eq(guaranteeTypes.isActive, true));
    return { data: rows };
  }
}
