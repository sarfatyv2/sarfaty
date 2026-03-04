import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GetVaduResultsUseCase } from '../use-cases/get-vadu-results.use-case';
import { RequestCreditboxReportUseCase } from '../use-cases/request-creditbox-report.use-case';
import { SyncCreditboxReportUseCase } from '../use-cases/sync-creditbox-report.use-case';
import { GetCreditboxReportUseCase } from '../use-cases/get-creditbox-report.use-case';
import { GetComplianceResultsUseCase } from '../use-cases/get-compliance-results.use-case';
import { TriggerNegativeMediaSearchUseCase } from '../use-cases/trigger-negative-media-search.use-case';
import { RequestSerasaReportUseCase } from '../use-cases/request-serasa-report.use-case';
import { GetSerasaReportUseCase } from '../use-cases/get-serasa-report.use-case';
import { CreditboxReportMapper } from '../infra/mappers/creditbox-report.mapper';
import { SerasaReportMapper } from '../infra/mappers/serasa-report.mapper';

@ApiTags('Credit')
@ApiBearerAuth()
@Controller('clients/:clientId/credit-analysis')
@UseGuards(RolesGuard)
export class CreditController {
  constructor(
    private readonly getVaduResultsUseCase: GetVaduResultsUseCase,
    private readonly requestCreditboxReportUseCase: RequestCreditboxReportUseCase,
    private readonly syncCreditboxReportUseCase: SyncCreditboxReportUseCase,
    private readonly getCreditboxReportUseCase: GetCreditboxReportUseCase,
    private readonly getComplianceResultsUseCase: GetComplianceResultsUseCase,
    private readonly triggerNegativeMediaSearchUseCase: TriggerNegativeMediaSearchUseCase,
    private readonly requestSerasaReportUseCase: RequestSerasaReportUseCase,
    private readonly getSerasaReportUseCase: GetSerasaReportUseCase,
  ) {}

  @Get('vadu-results')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getVaduResults(@Param('clientId') clientId: string) {
    const data = await this.getVaduResultsUseCase.execute(clientId);
    return { data };
  }

  @Post('creditbox')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async requestCreditboxReport(@Param('clientId') clientId: string) {
    const report = await this.requestCreditboxReportUseCase.execute(clientId);
    return { data: CreditboxReportMapper.toPersistence(report) };
  }

  @Post('creditbox/sync')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async syncCreditboxReport(@Param('clientId') clientId: string) {
    const report = await this.syncCreditboxReportUseCase.execute(clientId);
    return { data: report ? CreditboxReportMapper.toPersistence(report) : null };
  }

  @Get('creditbox')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getCreditboxReport(@Param('clientId') clientId: string) {
    const report = await this.getCreditboxReportUseCase.execute(clientId);
    return { data: report ? CreditboxReportMapper.toPersistence(report) : null };
  }

  @Get('compliance-results')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getComplianceResults(@Param('clientId') clientId: string) {
    const data = await this.getComplianceResultsUseCase.execute(clientId);
    return { data };
  }

  @Post('negative-media/search')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async triggerNegativeMediaSearch(@Param('clientId') clientId: string) {
    const data = await this.triggerNegativeMediaSearchUseCase.execute(clientId);
    return { data };
  }

  @Post('serasa')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async requestSerasaReport(
    @Param('clientId') clientId: string,
    @Query('reportName') reportName?: string,
    @Query('features') features?: string,
  ) {
    const featureList = features?.split(',').filter(Boolean);
    const report = await this.requestSerasaReportUseCase.execute(clientId, reportName, featureList);
    return { data: SerasaReportMapper.toPersistence(report) };
  }

  @Get('serasa')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getSerasaReport(@Param('clientId') clientId: string) {
    const report = await this.getSerasaReportUseCase.execute(clientId);
    return { data: report ? SerasaReportMapper.toPersistence(report) : null };
  }

  @Get('serasa/history')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getSerasaReportHistory(@Param('clientId') clientId: string) {
    const reports = await this.getSerasaReportUseCase.executeAll(clientId);
    return { data: reports.map(SerasaReportMapper.toPersistence) };
  }
}

