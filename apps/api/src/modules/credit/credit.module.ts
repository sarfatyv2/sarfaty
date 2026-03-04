import { Module } from '@nestjs/common';
import { VaduAdapter } from './bureaus/vadu/vadu.adapter';
import { CreditboxAdapter } from './bureaus/creditbox/creditbox.adapter';
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
import { SyncComplianceChecksUseCase } from './use-cases/sync-compliance-checks.use-case';
import { GetComplianceResultsUseCase } from './use-cases/get-compliance-results.use-case';
import { VADU_REPOSITORY } from './domain/vadu.repository';
import { CREDITBOX_REPOSITORY } from './domain/creditbox.repository';
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
import { CreditController } from './controllers/credit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CreditController],
  providers: [
    // Adapters
    VaduAdapter,
    CreditboxAdapter,
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
    { provide: CGU_CHECK_REPOSITORY, useClass: DrizzleCguCheckRepository },
    { provide: PEP_CHECK_REPOSITORY, useClass: DrizzlePepCheckRepository },
    { provide: PGFN_CHECK_REPOSITORY, useClass: DrizzlePgfnCheckRepository },
    { provide: CNDT_CHECK_REPOSITORY, useClass: DrizzleCndtCheckRepository },
    { provide: ADDRESS_VALIDATION_REPOSITORY, useClass: DrizzleAddressValidationRepository },
    { provide: SANCTIONS_CHECK_REPOSITORY, useClass: DrizzleSanctionsCheckRepository },
    { provide: SLAVE_LABOR_CHECK_REPOSITORY, useClass: DrizzleSlaveLaborCheckRepository },
    { provide: NEGATIVE_MEDIA_REPOSITORY, useClass: DrizzleNegativeMediaRepository },
    { provide: DIGITAL_PRESENCE_REPOSITORY, useClass: DrizzleDigitalPresenceRepository },

    // Use Cases
    SyncVaduClientUseCase,
    GetVaduResultsUseCase,
    RequestCreditboxReportUseCase,
    SyncCreditboxReportUseCase,
    GetCreditboxReportUseCase,
    SyncComplianceChecksUseCase,
    GetComplianceResultsUseCase,

    // Event Listeners
    VaduClientListener,
    ComplianceCheckListener,
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
