import { Body, Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
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
import { SyncAllcheckClientUseCase } from '../use-cases/sync-allcheck-client.use-case';
import { GetAllcheckResultUseCase } from '../use-cases/get-allcheck-result.use-case';
import { RequestUpminerBatchUseCase } from '../use-cases/request-upminer-batch.use-case';
import { SyncUpminerBatchUseCase } from '../use-cases/sync-upminer-batch.use-case';
import { GetUpminerResultUseCase } from '../use-cases/get-upminer-result.use-case';
import { GetUpminerDossierUseCase } from '../use-cases/get-upminer-dossier.use-case';
import { RequestUpminerPdfUseCase } from '../use-cases/request-upminer-pdf.use-case';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import { CreditboxReportMapper } from '../infra/mappers/creditbox-report.mapper';
import { SerasaReportMapper } from '../infra/mappers/serasa-report.mapper';
import { AllcheckResultMapper } from '../infra/mappers/allcheck-result.mapper';
import { UpminerResultMapper } from '../infra/mappers/upminer-result.mapper';

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
    private readonly syncAllcheckClientUseCase: SyncAllcheckClientUseCase,
    private readonly getAllcheckResultUseCase: GetAllcheckResultUseCase,
    private readonly requestUpminerBatchUseCase: RequestUpminerBatchUseCase,
    private readonly syncUpminerBatchUseCase: SyncUpminerBatchUseCase,
    private readonly getUpminerResultUseCase: GetUpminerResultUseCase,
    private readonly getUpminerDossierUseCase: GetUpminerDossierUseCase,
    private readonly requestUpminerPdfUseCase: RequestUpminerPdfUseCase,
    private readonly upminerAdapter: UpminerAdapter,
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

  @Get('allcheck')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getAllcheckResult(@Param('clientId') clientId: string) {
    const result = await this.getAllcheckResultUseCase.execute(clientId);
    return { data: result ? AllcheckResultMapper.toPersistence(result) : null };
  }

  @Post('allcheck/sync')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async syncAllcheck(@Param('clientId') clientId: string) {
    await this.syncAllcheckClientUseCase.execute({ clientId });
    return { message: 'Allcheck sync completed' };
  }

  // ---------------------------------------------------------------------------
  // upMiner
  // ---------------------------------------------------------------------------

  @Post('upminer')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async requestUpminerBatch(
    @Param('clientId') clientId: string,
    @Body() body: { searchProfileId?: number; notificationUrl?: string; checkDuplicates?: boolean } = {},
  ) {
    const result = await this.requestUpminerBatchUseCase.execute(clientId, body);
    return { data: UpminerResultMapper.toPersistence(result) };
  }

  @Post('upminer/sync')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async syncUpminerBatch(@Param('clientId') clientId: string) {
    const result = await this.syncUpminerBatchUseCase.execute(clientId);
    return { data: result ? UpminerResultMapper.toPersistence(result) : null };
  }

  @Get('upminer')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getUpminerResult(@Param('clientId') clientId: string) {
    const result = await this.getUpminerResultUseCase.execute(clientId);
    return { data: result ? UpminerResultMapper.toPersistence(result) : null };
  }

  @Get('upminer/history')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getUpminerHistory(@Param('clientId') clientId: string) {
    const results = await this.getUpminerResultUseCase.executeAll(clientId);
    return { data: results.map(UpminerResultMapper.toPersistence) };
  }

  @Get('upminer/profiles')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async listUpminerProfiles() {
    const profiles = await this.upminerAdapter.listProfiles();
    return { data: profiles };
  }

  @Post('upminer/check-duplicates')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async checkUpminerDuplicates(
    @Body() body: { criterions: string[] },
  ) {
    const result = await this.upminerAdapter.checkDuplicates(body);
    return { data: result };
  }

  @Get('upminer/dossier/:dossierId')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getUpminerDossier(
    @Param('dossierId') dossierId: string,
    @Query('sourceMethod') sourceMethod?: string,
  ) {
    const result = await this.getUpminerDossierUseCase.execute({ dossierId, sourceMethod });
    return { data: result };
  }

  @Get('upminer/dossier/:dossierId/sources/:sourceMethod')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getUpminerDossierSource(
    @Param('dossierId') dossierId: string,
    @Param('sourceMethod') sourceMethod: string,
  ) {
    const source = await this.upminerAdapter.getDossierSource(dossierId, sourceMethod);
    return { data: source };
  }

  @Post('upminer/dossier/:dossierId/pdf')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async requestUpminerPdf(
    @Param('dossierId') dossierId: string,
    @Body() body: { notificationUrl?: string } = {},
  ) {
    const result = await this.requestUpminerPdfUseCase.request(dossierId, body.notificationUrl);
    return { data: result };
  }

  @Get('upminer/dossier/:dossierId/pdf/:processId')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin',
  )
  async getUpminerPdfStatus(
    @Param('dossierId') dossierId: string,
    @Param('processId') processId: string,
  ) {
    const result = await this.requestUpminerPdfUseCase.getStatus(dossierId, processId);
    return { data: result };
  }
}

