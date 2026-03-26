import { Module } from '@nestjs/common';
import { AllcheckAdapter } from './bureaus/allcheck/allcheck.adapter';
import { VaduAdapter } from './bureaus/vadu/vadu.adapter';
import { CreditboxAdapter } from './bureaus/creditbox/creditbox.adapter';
import { SerasaAdapter } from './bureaus/serasa/serasa.adapter';
import { CguAdapter } from './bureaus/cgu/cgu.adapter';
import { PepAdapter } from './bureaus/pep/pep.adapter';
import { PgfnAdapter } from './bureaus/pgfn/pgfn.adapter';
import { CndtAdapter } from './bureaus/cndt/cndt.adapter';
import { ViacepAdapter } from './bureaus/viacep/viacep.adapter';
import { SanctionsAdapter } from './bureaus/sanctions/sanctions.adapter';
import { SlaveLaborAdapter } from './bureaus/slave-labor/slave-labor.adapter';
import { NegativeMediaAdapter } from './bureaus/negative-media/negative-media.adapter';
import { DigitalPresenceAdapter } from './bureaus/digital-presence/digital-presence.adapter';
import { UpminerAdapter } from './bureaus/upminer/upminer.adapter';
import { UpminerDossierPersistenceService } from './infra/upminer-dossier-persistence.service';
import { UpminerParallelPersistenceService } from './infra/upminer-parallel-persistence.service';
import { CercAdapter } from './bureaus/cerc/cerc.adapter';
import { NfeGeminiService } from './infra/gemini/nfe-gemini.service';
import { DrizzleVaduRepository } from './infra/drizzle/drizzle-vadu.repository';
import { DrizzleCreditboxRepository } from './infra/drizzle/drizzle-creditbox.repository';
import { DrizzleSerasaReportRepository } from './infra/drizzle/drizzle-serasa-report.repository';
import { DrizzleCguCheckRepository } from './infra/drizzle/drizzle-cgu-check.repository';
import { DrizzlePepCheckRepository } from './infra/drizzle/drizzle-pep-check.repository';
import { DrizzlePgfnCheckRepository } from './infra/drizzle/drizzle-pgfn-check.repository';
import { DrizzleCndtCheckRepository } from './infra/drizzle/drizzle-cndt-check.repository';
import { DrizzleAddressValidationRepository } from './infra/drizzle/drizzle-address-validation.repository';
import { DrizzleSanctionsCheckRepository } from './infra/drizzle/drizzle-sanctions-check.repository';
import { DrizzleSlaveLaborCheckRepository } from './infra/drizzle/drizzle-slave-labor-check.repository';
import { DrizzleNegativeMediaRepository } from './infra/drizzle/drizzle-negative-media.repository';
import { DrizzleDigitalPresenceRepository } from './infra/drizzle/drizzle-digital-presence.repository';
import { SyncVaduClientUseCase } from './use-cases/sync-vadu-client.use-case';
import { GetVaduResultsUseCase } from './use-cases/get-vadu-results.use-case';
import { RequestCreditboxReportUseCase } from './use-cases/request-creditbox-report.use-case';
import { SyncCreditboxReportUseCase } from './use-cases/sync-creditbox-report.use-case';
import { GetCreditboxReportUseCase } from './use-cases/get-creditbox-report.use-case';
import { RequestSerasaReportUseCase } from './use-cases/request-serasa-report.use-case';
import { GetSerasaReportUseCase } from './use-cases/get-serasa-report.use-case';
import { SyncSerasaClientUseCase } from './use-cases/sync-serasa-client.use-case';
import { SyncComplianceChecksUseCase } from './use-cases/sync-compliance-checks.use-case';
import { GetComplianceResultsUseCase } from './use-cases/get-compliance-results.use-case';
import { TriggerNegativeMediaSearchUseCase } from './use-cases/trigger-negative-media-search.use-case';
import { VADU_REPOSITORY } from './domain/vadu.repository';
import { CREDITBOX_REPOSITORY } from './domain/creditbox.repository';
import { SERASA_REPORT_REPOSITORY } from './domain/serasa-report.repository';
import { CGU_CHECK_REPOSITORY } from './domain/cgu-check.repository';
import { PEP_CHECK_REPOSITORY } from './domain/pep-check.repository';
import { PGFN_CHECK_REPOSITORY } from './domain/pgfn-check.repository';
import { CNDT_CHECK_REPOSITORY } from './domain/cndt-check.repository';
import { ADDRESS_VALIDATION_REPOSITORY } from './domain/address-validation.repository';
import { SANCTIONS_CHECK_REPOSITORY } from './domain/sanctions-check.repository';
import { SLAVE_LABOR_CHECK_REPOSITORY } from './domain/slave-labor-check.repository';
import { NEGATIVE_MEDIA_REPOSITORY } from './domain/negative-media.repository';
import { DIGITAL_PRESENCE_REPOSITORY } from './domain/digital-presence.repository';
import { DatabaseModule } from '../../database/database.module';
import { VaduClientListener } from './infra/events/vadu-client.listener';
import { ComplianceCheckListener } from './infra/events/compliance-check.listener';
import { DraweeBureauListener } from './infra/events/drawee-bureau.listener';
import { PartnerCompanyListener } from './infra/events/partner-company.listener';
import { AllcheckUpminerClientListener } from './infra/events/allcheck-upminer-client.listener';
import { CreditController } from './controllers/credit.controller';
import { DraweeCreditController } from './controllers/drawee-credit.controller';
import { CercController } from './controllers/cerc.controller';
import { ClientsModule } from '../clients/clients.module';
import { DraweesModule } from '../drawees/drawees.module';
import { CnabModule } from '../cnab/cnab.module';
import { ListDraweeClientsUseCase } from './use-cases/list-drawee-clients.use-case';
import { DrizzleVaduDraweeRepository } from './infra/drizzle/drizzle-vadu-drawee.repository';
import { DrizzleSerasaDraweeReportRepository } from './infra/drizzle/drizzle-serasa-drawee-report.repository';
import { DrizzleCguDraweeCheckRepository } from './infra/drizzle/drizzle-cgu-drawee-check.repository';
import { DrizzlePepDraweeCheckRepository } from './infra/drizzle/drizzle-pep-drawee-check.repository';
import { DrizzlePgfnDraweeCheckRepository } from './infra/drizzle/drizzle-pgfn-drawee-check.repository';
import { DrizzleCndtDraweeCheckRepository } from './infra/drizzle/drizzle-cndt-drawee-check.repository';
import { DrizzleAddressValidationDraweeResultRepository } from './infra/drizzle/drizzle-address-validation-drawee-result.repository';
import { DrizzleSanctionsDraweeCheckRepository } from './infra/drizzle/drizzle-sanctions-drawee-check.repository';
import { DrizzleSlaveLaborDraweeCheckRepository } from './infra/drizzle/drizzle-slave-labor-drawee-check.repository';
import { DrizzleNegativeMediaDraweeResultRepository } from './infra/drizzle/drizzle-negative-media-drawee-result.repository';
import { DrizzleDigitalPresenceDraweeResultRepository } from './infra/drizzle/drizzle-digital-presence-drawee-result.repository';
import { SyncVaduDraweeUseCase } from './use-cases/sync-vadu-drawee.use-case';
import { RequestSerasaReportDraweeUseCase } from './use-cases/request-serasa-report-drawee.use-case';
import { SyncSerasaDraweeUseCase } from './use-cases/sync-serasa-drawee.use-case';
import { SyncComplianceChecksDraweeUseCase } from './use-cases/sync-compliance-checks-drawee.use-case';
import { GetVaduResultsDraweeUseCase } from './use-cases/get-vadu-results-drawee.use-case';
import { GetSerasaReportDraweeUseCase } from './use-cases/get-serasa-report-drawee.use-case';
import { GetComplianceResultsDraweeUseCase } from './use-cases/get-compliance-results-drawee.use-case';
import { TriggerNegativeMediaSearchDraweeUseCase } from './use-cases/trigger-negative-media-search-drawee.use-case';
import { SyncAllcheckClientUseCase } from './use-cases/sync-allcheck-client.use-case';
import { SyncAllcheckDraweeUseCase } from './use-cases/sync-allcheck-drawee.use-case';
import { GetAllcheckResultUseCase } from './use-cases/get-allcheck-result.use-case';
import { GetAllcheckDraweeResultUseCase } from './use-cases/get-allcheck-drawee-result.use-case';
import { RequestUpminerBatchUseCase } from './use-cases/request-upminer-batch.use-case';
import { SyncUpminerBatchUseCase } from './use-cases/sync-upminer-batch.use-case';
import { GetUpminerResultUseCase } from './use-cases/get-upminer-result.use-case';
import { GetUpminerDossierUseCase } from './use-cases/get-upminer-dossier.use-case';
import { GetUpminerDossiersDataUseCase } from './use-cases/get-upminer-dossiers-data.use-case';
import { GetUpminerParallelDataUseCase } from './use-cases/get-upminer-parallel-data.use-case';
import { TriggerUpminerParallelUseCase } from './use-cases/trigger-upminer-parallel.use-case';
import { RequestUpminerPdfUseCase } from './use-cases/request-upminer-pdf.use-case';
import { RequestCercValidationUseCase } from './use-cases/request-cerc-validation.use-case';
import { SyncCercValidationUseCase } from './use-cases/sync-cerc-validation.use-case';
import { GetCercValidationUseCase } from './use-cases/get-cerc-validation.use-case';
import { ListCercValidationsUseCase } from './use-cases/list-cerc-validations.use-case';
import { GetCercValidationResultadosUseCase } from './use-cases/get-cerc-validation-resultados.use-case';
import { GetCercValidationDetailUseCase } from './use-cases/get-cerc-validation-detail.use-case';
import { ALLCHECK_RESULT_REPOSITORY } from './domain/allcheck-result.repository';
import { ALLCHECK_DRAWEE_RESULT_REPOSITORY } from './domain/allcheck-drawee-result.repository';
import { DrizzleAllcheckResultRepository } from './infra/drizzle/drizzle-allcheck-result.repository';
import { DrizzleAllcheckDraweeResultRepository } from './infra/drizzle/drizzle-allcheck-drawee-result.repository';
import { UPMINER_RESULT_REPOSITORY } from './domain/upminer-result.repository';
import { DrizzleUpminerResultRepository } from './infra/drizzle/drizzle-upminer-result.repository';
import { CERC_VALIDATION_REPOSITORY } from './domain/cerc-validation.repository';
import { DrizzleCercValidationRepository } from './infra/drizzle/drizzle-cerc-validation.repository';
import { CERC_VALIDATION_RESULTADO_REPOSITORY } from './domain/cerc-validation-resultado.repository';
import { DrizzleCercValidationResultadoRepository } from './infra/drizzle/drizzle-cerc-validation-resultado.repository';
import { CERC_VALIDATION_EVENTOS_REPOSITORY } from './domain/cerc-validation-eventos.repository';
import { DrizzleCercValidationEventosRepository } from './infra/drizzle/drizzle-cerc-validation-eventos.repository';
import { CERC_VALIDATION_PARTES_REPOSITORY } from './domain/cerc-validation-partes.repository';
import { DrizzleCercValidationPartesRepository } from './infra/drizzle/drizzle-cerc-validation-partes.repository';
import { CERC_VALIDATION_DOC_FISCAL_REPOSITORY } from './domain/cerc-validation-doc-fiscal.repository';
import { DrizzleCercValidationDocFiscalRepository } from './infra/drizzle/drizzle-cerc-validation-doc-fiscal.repository';
import { VADU_DRAWEE_REPOSITORY } from './domain/vadu-drawee.repository';
import { SERASA_DRAWEE_REPORT_REPOSITORY } from './domain/serasa-drawee-report.repository';
import { CGU_DRAWEE_CHECK_REPOSITORY } from './domain/cgu-drawee-check.repository';
import { PEP_DRAWEE_CHECK_REPOSITORY } from './domain/pep-drawee-check.repository';
import { PGFN_DRAWEE_CHECK_REPOSITORY } from './domain/pgfn-drawee-check.repository';
import { CNDT_DRAWEE_CHECK_REPOSITORY } from './domain/cndt-drawee-check.repository';
import { ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY } from './domain/address-validation-drawee-result.repository';
import { SANCTIONS_DRAWEE_CHECK_REPOSITORY } from './domain/sanctions-drawee-check.repository';
import { SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY } from './domain/slave-labor-drawee-check.repository';
import { NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY } from './domain/negative-media-drawee-result.repository';
import { DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY } from './domain/digital-presence-drawee-result.repository';

@Module({
  imports: [DatabaseModule, ClientsModule, DraweesModule, CnabModule],
  controllers: [CreditController, DraweeCreditController, CercController],
  providers: [
    // Adapters
    AllcheckAdapter,
    VaduAdapter,
    CreditboxAdapter,
    SerasaAdapter,
    CguAdapter,
    PepAdapter,
    PgfnAdapter,
    CndtAdapter,
    ViacepAdapter,
    SanctionsAdapter,
    SlaveLaborAdapter,
    NegativeMediaAdapter,
    DigitalPresenceAdapter,
    UpminerAdapter,
    UpminerDossierPersistenceService,
    UpminerParallelPersistenceService,
    CercAdapter,
    NfeGeminiService,

    // Repositories
    { provide: VADU_REPOSITORY, useClass: DrizzleVaduRepository },
    { provide: CREDITBOX_REPOSITORY, useClass: DrizzleCreditboxRepository },
    { provide: SERASA_REPORT_REPOSITORY, useClass: DrizzleSerasaReportRepository },
    { provide: CGU_CHECK_REPOSITORY, useClass: DrizzleCguCheckRepository },
    { provide: PEP_CHECK_REPOSITORY, useClass: DrizzlePepCheckRepository },
    { provide: PGFN_CHECK_REPOSITORY, useClass: DrizzlePgfnCheckRepository },
    { provide: CNDT_CHECK_REPOSITORY, useClass: DrizzleCndtCheckRepository },
    { provide: ADDRESS_VALIDATION_REPOSITORY, useClass: DrizzleAddressValidationRepository },
    { provide: SANCTIONS_CHECK_REPOSITORY, useClass: DrizzleSanctionsCheckRepository },
    { provide: SLAVE_LABOR_CHECK_REPOSITORY, useClass: DrizzleSlaveLaborCheckRepository },
    { provide: NEGATIVE_MEDIA_REPOSITORY, useClass: DrizzleNegativeMediaRepository },
    { provide: DIGITAL_PRESENCE_REPOSITORY, useClass: DrizzleDigitalPresenceRepository },
    // Drawee repositories
    { provide: VADU_DRAWEE_REPOSITORY, useClass: DrizzleVaduDraweeRepository },
    { provide: SERASA_DRAWEE_REPORT_REPOSITORY, useClass: DrizzleSerasaDraweeReportRepository },
    { provide: CGU_DRAWEE_CHECK_REPOSITORY, useClass: DrizzleCguDraweeCheckRepository },
    { provide: PEP_DRAWEE_CHECK_REPOSITORY, useClass: DrizzlePepDraweeCheckRepository },
    { provide: PGFN_DRAWEE_CHECK_REPOSITORY, useClass: DrizzlePgfnDraweeCheckRepository },
    { provide: CNDT_DRAWEE_CHECK_REPOSITORY, useClass: DrizzleCndtDraweeCheckRepository },
    { provide: ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY, useClass: DrizzleAddressValidationDraweeResultRepository },
    { provide: SANCTIONS_DRAWEE_CHECK_REPOSITORY, useClass: DrizzleSanctionsDraweeCheckRepository },
    { provide: SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY, useClass: DrizzleSlaveLaborDraweeCheckRepository },
    { provide: NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY, useClass: DrizzleNegativeMediaDraweeResultRepository },
    { provide: DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY, useClass: DrizzleDigitalPresenceDraweeResultRepository },
    // Allcheck repositories
    { provide: ALLCHECK_RESULT_REPOSITORY, useClass: DrizzleAllcheckResultRepository },
    { provide: ALLCHECK_DRAWEE_RESULT_REPOSITORY, useClass: DrizzleAllcheckDraweeResultRepository },
    // upMiner repositories
    { provide: UPMINER_RESULT_REPOSITORY, useClass: DrizzleUpminerResultRepository },
    // CERC repositories
    { provide: CERC_VALIDATION_REPOSITORY, useClass: DrizzleCercValidationRepository },
    { provide: CERC_VALIDATION_RESULTADO_REPOSITORY, useClass: DrizzleCercValidationResultadoRepository },
    { provide: CERC_VALIDATION_EVENTOS_REPOSITORY, useClass: DrizzleCercValidationEventosRepository },
    { provide: CERC_VALIDATION_PARTES_REPOSITORY, useClass: DrizzleCercValidationPartesRepository },
    { provide: CERC_VALIDATION_DOC_FISCAL_REPOSITORY, useClass: DrizzleCercValidationDocFiscalRepository },

    // Use Cases
    SyncVaduClientUseCase,
    GetVaduResultsUseCase,
    RequestCreditboxReportUseCase,
    SyncCreditboxReportUseCase,
    GetCreditboxReportUseCase,
    RequestSerasaReportUseCase,
    GetSerasaReportUseCase,
    SyncSerasaClientUseCase,
    SyncComplianceChecksUseCase,
    GetComplianceResultsUseCase,
    TriggerNegativeMediaSearchUseCase,
    // Drawee use cases
    ListDraweeClientsUseCase,
    SyncVaduDraweeUseCase,
    RequestSerasaReportDraweeUseCase,
    SyncSerasaDraweeUseCase,
    SyncComplianceChecksDraweeUseCase,
    GetVaduResultsDraweeUseCase,
    GetSerasaReportDraweeUseCase,
    GetComplianceResultsDraweeUseCase,
    TriggerNegativeMediaSearchDraweeUseCase,
    SyncAllcheckClientUseCase,
    SyncAllcheckDraweeUseCase,
    GetAllcheckResultUseCase,
    GetAllcheckDraweeResultUseCase,

    // upMiner use cases
    RequestUpminerBatchUseCase,
    SyncUpminerBatchUseCase,
    GetUpminerResultUseCase,
    GetUpminerDossierUseCase,
    GetUpminerDossiersDataUseCase,
    GetUpminerParallelDataUseCase,
    TriggerUpminerParallelUseCase,
    RequestUpminerPdfUseCase,

    // CERC use cases
    RequestCercValidationUseCase,
    SyncCercValidationUseCase,
    GetCercValidationUseCase,
    ListCercValidationsUseCase,
    GetCercValidationResultadosUseCase,
    GetCercValidationDetailUseCase,

    // Event Listeners
    VaduClientListener,
    ComplianceCheckListener,
    DraweeBureauListener,
    PartnerCompanyListener,
    AllcheckUpminerClientListener,
  ],
  exports: [
    VaduAdapter,
    CreditboxAdapter,
    VADU_REPOSITORY,
    CREDITBOX_REPOSITORY,
    SyncVaduClientUseCase,
    GetVaduResultsUseCase,
    GetSerasaReportUseCase,
    GetCreditboxReportUseCase,
    GetComplianceResultsUseCase,
  ],
})
export class CreditModule {}
