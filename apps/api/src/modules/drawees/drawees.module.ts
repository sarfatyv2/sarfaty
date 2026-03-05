import { Module } from '@nestjs/common';
import { DraweesController } from './controllers/drawees.controller';
import { DraweeContactsController } from './controllers/drawee-contacts.controller';
import { DraweeAddressesController } from './controllers/drawee-addresses.controller';
import { DraweeBankAccountsController } from './controllers/drawee-bank-accounts.controller';
import { CreateDraweeUseCase } from './use-cases/create-drawee.use-case';
import { GetDraweeUseCase } from './use-cases/get-drawee.use-case';
import { ListDraweesUseCase } from './use-cases/list-drawees.use-case';
import { UpdateDraweeUseCase } from './use-cases/update-drawee.use-case';
import { EnrichDraweeFromBureauUseCase } from './use-cases/enrich-drawee-from-bureau.use-case';
import { DrizzleDraweeRepository } from './infra/drizzle-drawee.repository';
import { DrizzleDraweeContactRepository, DRAWEE_CONTACT_REPOSITORY } from './infra/drizzle-drawee-contact.repository';
import { DrizzleDraweeAddressRepository, DRAWEE_ADDRESS_REPOSITORY } from './infra/drizzle-drawee-address.repository';
import { DrizzleDraweeBankAccountRepository, DRAWEE_BANK_ACCOUNT_REPOSITORY } from './infra/drizzle-drawee-bank-account.repository';
import { DRAWEE_REPOSITORY } from './domain/drawee.repository';

@Module({
  controllers: [
    DraweesController,
    DraweeContactsController,
    DraweeAddressesController,
    DraweeBankAccountsController,
  ],
  providers: [
    // Use cases
    CreateDraweeUseCase,
    GetDraweeUseCase,
    ListDraweesUseCase,
    UpdateDraweeUseCase,
    EnrichDraweeFromBureauUseCase,
    // Repositories
    { provide: DRAWEE_REPOSITORY, useClass: DrizzleDraweeRepository },
    { provide: DRAWEE_CONTACT_REPOSITORY, useClass: DrizzleDraweeContactRepository },
    { provide: DRAWEE_ADDRESS_REPOSITORY, useClass: DrizzleDraweeAddressRepository },
    { provide: DRAWEE_BANK_ACCOUNT_REPOSITORY, useClass: DrizzleDraweeBankAccountRepository },
  ],
  exports: [DRAWEE_REPOSITORY, EnrichDraweeFromBureauUseCase],
})
export class DraweesModule {}
