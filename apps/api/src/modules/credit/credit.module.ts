import { Module } from '@nestjs/common';
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
import { CreditController } from './controllers/credit.controller';
import { DraweeCreditController } from './controllers/drawee-credit.controller';
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
  imports: [DatabaseModule, ClientsModule, DraweesModule],
  controllers: [CreditController],
  providers: [
    // Adapters
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

    // Event Listeners
    VaduClientListener,
    ComplianceCheckListener,
    DraweeBureauListener,
  ],
  exports: [
    VaduAdapter,
    CreditboxAdapter,
    VADU_REPOSITORY,
    CREDITBOX_REPOSITORY,
    SyncVaduClientUseCase,
    GetVaduResultsUseCase,
  ],
})
export class CreditModule {}
