import { Module } from '@nestjs/common';
import { DraweesController } from './controllers/drawees.controller';
import { DraweeContactsController } from './controllers/drawee-contacts.controller';
import { DraweeAddressesController } from './controllers/drawee-addresses.controller';
import { DraweeBankAccountsController } from './controllers/drawee-bank-accounts.controller';
import { DraweeAuthorizedPersonsController } from './controllers/drawee-authorized-persons.controller';
import { CreateDraweeUseCase } from './use-cases/create-drawee.use-case';
import { GetDraweeUseCase } from './use-cases/get-drawee.use-case';
import { ListDraweesUseCase } from './use-cases/list-drawees.use-case';
import { UpdateDraweeUseCase } from './use-cases/update-drawee.use-case';
import { EnrichDraweeFromBureauUseCase } from './use-cases/enrich-drawee-from-bureau.use-case';
import { ListDraweeAuthorizedPersonsUseCase } from './use-cases/list-drawee-authorized-persons.use-case';
import { CreateDraweeAuthorizedPersonUseCase } from './use-cases/create-drawee-authorized-person.use-case';
import { UpdateDraweeAuthorizedPersonUseCase } from './use-cases/update-drawee-authorized-person.use-case';
import { DeleteDraweeAuthorizedPersonUseCase } from './use-cases/delete-drawee-authorized-person.use-case';
import { DrizzleDraweeRepository } from './infra/drizzle-drawee.repository';
import { DrizzleDraweeContactRepository, DRAWEE_CONTACT_REPOSITORY } from './infra/drizzle-drawee-contact.repository';
import { DrizzleDraweeAddressRepository, DRAWEE_ADDRESS_REPOSITORY } from './infra/drizzle-drawee-address.repository';
import { DrizzleDraweeAuthorizedPersonRepository } from './infra/drizzle-drawee-authorized-person.repository';
import { DrizzleDraweeBankAccountRepository, DRAWEE_BANK_ACCOUNT_REPOSITORY } from './infra/drizzle-drawee-bank-account.repository';
import { DRAWEE_REPOSITORY } from './domain/drawee.repository';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY } from './domain/drawee-authorized-person.repository';

@Module({
  controllers: [
    DraweesController,
    DraweeContactsController,
    DraweeAddressesController,
    DraweeBankAccountsController,
    DraweeAuthorizedPersonsController,
  ],
  providers: [
    // Use cases
    CreateDraweeUseCase,
    GetDraweeUseCase,
    ListDraweesUseCase,
    UpdateDraweeUseCase,
    EnrichDraweeFromBureauUseCase,
    ListDraweeAuthorizedPersonsUseCase,
    CreateDraweeAuthorizedPersonUseCase,
    UpdateDraweeAuthorizedPersonUseCase,
    DeleteDraweeAuthorizedPersonUseCase,
    // Repositories
    { provide: DRAWEE_REPOSITORY, useClass: DrizzleDraweeRepository },
    { provide: DRAWEE_CONTACT_REPOSITORY, useClass: DrizzleDraweeContactRepository },
    { provide: DRAWEE_ADDRESS_REPOSITORY, useClass: DrizzleDraweeAddressRepository },
    { provide: DRAWEE_AUTHORIZED_PERSON_REPOSITORY, useClass: DrizzleDraweeAuthorizedPersonRepository },
    { provide: DRAWEE_BANK_ACCOUNT_REPOSITORY, useClass: DrizzleDraweeBankAccountRepository },
  ],
  exports: [DRAWEE_REPOSITORY, EnrichDraweeFromBureauUseCase],
})
export class DraweesModule {}
