import { Module } from '@nestjs/common';
import { VaduAdapter } from './bureaus/vadu/vadu.adapter';
import { CreditboxAdapter } from './bureaus/creditbox/creditbox.adapter';
import { DrizzleVaduRepository } from './infra/drizzle/drizzle-vadu.repository';
import { DrizzleCreditboxRepository } from './infra/drizzle/drizzle-creditbox.repository';
import { SyncVaduClientUseCase } from './use-cases/sync-vadu-client.use-case';
import { GetVaduResultsUseCase } from './use-cases/get-vadu-results.use-case';
import { RequestCreditboxReportUseCase } from './use-cases/request-creditbox-report.use-case';
import { SyncCreditboxReportUseCase } from './use-cases/sync-creditbox-report.use-case';
import { GetCreditboxReportUseCase } from './use-cases/get-creditbox-report.use-case';
import { VADU_REPOSITORY } from './domain/vadu.repository';
import { CREDITBOX_REPOSITORY } from './domain/creditbox.repository';
import { DatabaseModule } from '../../database/database.module';
import { VaduClientListener } from './infra/events/vadu-client.listener';
import { CreditController } from './controllers/credit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CreditController],
  providers: [
    VaduAdapter,
    CreditboxAdapter,
    {
      provide: VADU_REPOSITORY,
      useClass: DrizzleVaduRepository,
    },
    {
      provide: CREDITBOX_REPOSITORY,
      useClass: DrizzleCreditboxRepository,
    },
    SyncVaduClientUseCase,
    GetVaduResultsUseCase,
    RequestCreditboxReportUseCase,
    SyncCreditboxReportUseCase,
    GetCreditboxReportUseCase,
    VaduClientListener,
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
