import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ListDraweeClientsUseCase } from '../use-cases/list-drawee-clients.use-case';
import { GetVaduResultsDraweeUseCase } from '../use-cases/get-vadu-results-drawee.use-case';
import { GetSerasaReportDraweeUseCase } from '../use-cases/get-serasa-report-drawee.use-case';
import { RequestSerasaReportDraweeUseCase } from '../use-cases/request-serasa-report-drawee.use-case';
import { GetComplianceResultsDraweeUseCase } from '../use-cases/get-compliance-results-drawee.use-case';
import { TriggerNegativeMediaSearchDraweeUseCase } from '../use-cases/trigger-negative-media-search-drawee.use-case';
import { SerasaDraweeReportApiMapper } from '../infra/mappers/serasa-drawee-report.api-mapper';

const CREDIT_ROLES = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
  'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
] as const;

@ApiTags('Drawees')
@ApiBearerAuth()
@Controller('drawees/:draweeId')
@UseGuards(RolesGuard)
export class DraweeCreditController {
  constructor(
    private readonly listDraweeClientsUseCase: ListDraweeClientsUseCase,
    private readonly getVaduResultsDraweeUseCase: GetVaduResultsDraweeUseCase,
    private readonly getSerasaReportDraweeUseCase: GetSerasaReportDraweeUseCase,
    private readonly requestSerasaReportDraweeUseCase: RequestSerasaReportDraweeUseCase,
    private readonly getComplianceResultsDraweeUseCase: GetComplianceResultsDraweeUseCase,
    private readonly triggerNegativeMediaSearchDraweeUseCase: TriggerNegativeMediaSearchDraweeUseCase,
  ) {}

  @Get('clients')
  @Roles(...CREDIT_ROLES)
  async getClients(@Param('draweeId') draweeId: string) {
    const data = await this.listDraweeClientsUseCase.execute(draweeId);
    return { data };
  }

  @Get('credit-analysis/vadu-results')
  @Roles(...CREDIT_ROLES)
  async getVaduResults(@Param('draweeId') draweeId: string) {
    const data = await this.getVaduResultsDraweeUseCase.execute(draweeId);
    return { data };
  }

  @Get('credit-analysis/serasa')
  @Roles(...CREDIT_ROLES)
  async getSerasaReport(@Param('draweeId') draweeId: string) {
    const report = await this.getSerasaReportDraweeUseCase.execute(draweeId);
    return { data: report ? SerasaDraweeReportApiMapper.toResponse(report) : null };
  }

  @Post('credit-analysis/serasa')
  @Roles(...CREDIT_ROLES)
  async requestSerasaReport(
    @Param('draweeId') draweeId: string,
    @Query('reportName') reportName?: string,
    @Query('features') features?: string,
  ) {
    const featureList = features?.split(',').filter(Boolean);
    const report = await this.requestSerasaReportDraweeUseCase.execute(draweeId, reportName, featureList);
    return { data: SerasaDraweeReportApiMapper.toResponse(report) };
  }

  @Get('credit-analysis/compliance-results')
  @Roles(...CREDIT_ROLES)
  async getComplianceResults(@Param('draweeId') draweeId: string) {
    const data = await this.getComplianceResultsDraweeUseCase.execute(draweeId);
    return { data };
  }

  @Post('credit-analysis/negative-media/search')
  @Roles(...CREDIT_ROLES)
  async triggerNegativeMediaSearch(@Param('draweeId') draweeId: string) {
    const data = await this.triggerNegativeMediaSearchDraweeUseCase.execute(draweeId);
    return { data };
  }
}
