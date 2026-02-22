import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsController } from './controllers/clients.controller';
import { DocumentsController } from './controllers/documents.controller';
import { CnpjController } from './controllers/cnpj.controller';
import { SegmentsController } from './controllers/segments.controller';
import { ClientContactsController } from './controllers/client-contacts.controller';
import { ClientAddressesController } from './controllers/client-addresses.controller';
import { ClientBankAccountsController } from './controllers/client-bank-accounts.controller';
import { ClientAuthorizedPersonsController } from './controllers/client-authorized-persons.controller';
import { ClientCommercialReportsController } from './controllers/client-commercial-reports.controller';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { GetClientUseCase } from './use-cases/get-client.use-case';
import { ListClientsUseCase } from './use-cases/list-clients.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { SubmitForAnalysisUseCase } from './use-cases/submit-for-analysis.use-case';
import { GetDocumentChecklistUseCase } from './use-cases/get-document-checklist.use-case';
import { CanSubmitUseCase } from './use-cases/can-submit.use-case';
import { UploadDocumentUseCase } from './use-cases/upload-document.use-case';
import { DeleteDocumentUseCase } from './use-cases/delete-document.use-case';
import { ValidateCnpjUseCase } from './use-cases/validate-cnpj.use-case';
import { ListClientContactsUseCase } from './use-cases/list-client-contacts.use-case';
import { CreateClientContactUseCase } from './use-cases/create-client-contact.use-case';
import { UpdateClientContactUseCase } from './use-cases/update-client-contact.use-case';
import { DeleteClientContactUseCase } from './use-cases/delete-client-contact.use-case';
import { ListClientAddressesUseCase } from './use-cases/list-client-addresses.use-case';
import { CreateClientAddressUseCase } from './use-cases/create-client-address.use-case';
import { UpdateClientAddressUseCase } from './use-cases/update-client-address.use-case';
import { DeleteClientAddressUseCase } from './use-cases/delete-client-address.use-case';
import { ListClientBankAccountsUseCase } from './use-cases/list-client-bank-accounts.use-case';
import { CreateClientBankAccountUseCase } from './use-cases/create-client-bank-account.use-case';
import { UpdateClientBankAccountUseCase } from './use-cases/update-client-bank-account.use-case';
import { DeleteClientBankAccountUseCase } from './use-cases/delete-client-bank-account.use-case';
import { ListClientAuthorizedPersonsUseCase } from './use-cases/list-client-authorized-persons.use-case';
import { CreateClientAuthorizedPersonUseCase } from './use-cases/create-client-authorized-person.use-case';
import { UpdateClientAuthorizedPersonUseCase } from './use-cases/update-client-authorized-person.use-case';
import { DeleteClientAuthorizedPersonUseCase } from './use-cases/delete-client-authorized-person.use-case';
import { DrizzleClientRepository } from './infra/drizzle-client.repository';
import { DrizzleClientDocumentRepository } from './infra/drizzle-client-document.repository';
import { DrizzleClientContactRepository } from './infra/drizzle-client-contact.repository';
import { DrizzleClientAddressRepository } from './infra/drizzle-client-address.repository';
import { DrizzleClientBankAccountRepository } from './infra/drizzle-client-bank-account.repository';
import { DrizzleClientAuthorizedPersonRepository } from './infra/drizzle-client-authorized-person.repository';
import { ClientStorageService } from './infra/client-storage.service';
import { DrizzleCommercialReportRepository } from './infra/repositories/drizzle-commercial-report.repository';
import { COMMERCIAL_REPORT_REPOSITORY } from './domain/commercial-report.repository';
import { CreateCommercialReportUseCase } from './use-cases/create-commercial-report.use-case';
import { GetCommercialReportsUseCase } from './use-cases/get-commercial-reports.use-case';
import { ParseCommercialReportUseCase } from './use-cases/parse-commercial-report.use-case';
import { CnpjApiAdapter } from './infra/cnpj-api.adapter';
import { ExcelExtractionService } from './infra/excel-extraction.service';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { CLIENT_DOCUMENT_REPOSITORY } from './domain/client-document.repository';
import { CLIENT_CONTACT_REPOSITORY } from './domain/client-contact.repository';
import { CLIENT_ADDRESS_REPOSITORY } from './domain/client-address.repository';
import { CLIENT_BANK_ACCOUNT_REPOSITORY } from './domain/client-bank-account.repository';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY } from './domain/client-authorized-person.repository';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    }),
  ],
  controllers: [
    ClientsController,
    DocumentsController,
    CnpjController,
    SegmentsController,
    ClientContactsController,
    ClientAddressesController,
    ClientBankAccountsController,
    ClientAuthorizedPersonsController,
    ClientCommercialReportsController,
  ],
  providers: [
    // Use cases — core
    CreateClientUseCase,
    CreateCommercialReportUseCase,
    GetCommercialReportsUseCase,
    GetClientUseCase,
    ListClientsUseCase,
    UpdateClientUseCase,
    ParseCommercialReportUseCase,
    SubmitForAnalysisUseCase,
    GetDocumentChecklistUseCase,
    CanSubmitUseCase,
    UploadDocumentUseCase,
    DeleteDocumentUseCase,
    ValidateCnpjUseCase,
    // Use cases — contacts
    ListClientContactsUseCase,
    CreateClientContactUseCase,
    UpdateClientContactUseCase,
    DeleteClientContactUseCase,
    // Use cases — addresses
    ListClientAddressesUseCase,
    CreateClientAddressUseCase,
    UpdateClientAddressUseCase,
    DeleteClientAddressUseCase,
    // Use cases — bank accounts
    ListClientBankAccountsUseCase,
    CreateClientBankAccountUseCase,
    UpdateClientBankAccountUseCase,
    DeleteClientBankAccountUseCase,
    // Use cases — authorized persons
    ListClientAuthorizedPersonsUseCase,
    CreateClientAuthorizedPersonUseCase,
    UpdateClientAuthorizedPersonUseCase,
    DeleteClientAuthorizedPersonUseCase,
    // Repositories
    { provide: CLIENT_REPOSITORY, useClass: DrizzleClientRepository },
    { provide: CLIENT_DOCUMENT_REPOSITORY, useClass: DrizzleClientDocumentRepository },
    { provide: CLIENT_CONTACT_REPOSITORY, useClass: DrizzleClientContactRepository },
    { provide: CLIENT_ADDRESS_REPOSITORY, useClass: DrizzleClientAddressRepository },
    { provide: CLIENT_BANK_ACCOUNT_REPOSITORY, useClass: DrizzleClientBankAccountRepository },
    { provide: CLIENT_AUTHORIZED_PERSON_REPOSITORY, useClass: DrizzleClientAuthorizedPersonRepository },
    { provide: COMMERCIAL_REPORT_REPOSITORY, useClass: DrizzleCommercialReportRepository },
    // Services
    ClientStorageService,
    ExcelExtractionService,
    CnpjApiAdapter,
  ],
})
export class ClientsModule {}
