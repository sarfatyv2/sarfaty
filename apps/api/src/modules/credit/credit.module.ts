import { Module } from '@nestjs/common';
import { VaduAdapter } from './bureaus/vadu/vadu.adapter';
import { DrizzleVaduRepository } from './infra/drizzle/drizzle-vadu.repository';
import { SyncVaduClientUseCase } from './use-cases/sync-vadu-client.use-case';
import { VADU_REPOSITORY } from './domain/vadu.repository';
import { DatabaseModule } from '../../database/database.module';
import { VaduClientListener } from './infra/events/vadu-client.listener';

@Module({
  imports: [DatabaseModule],
  providers: [
    VaduAdapter,
    {
      provide: VADU_REPOSITORY,
      useClass: DrizzleVaduRepository,
    },
    SyncVaduClientUseCase,
    VaduClientListener,
  ],
  exports: [
    VaduAdapter,
    VADU_REPOSITORY,
    SyncVaduClientUseCase,
  ],
})
export class CreditModule {}
