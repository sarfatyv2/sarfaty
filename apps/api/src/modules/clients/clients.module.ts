import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsController } from './controllers/clients.controller';
import { DocumentsController } from './controllers/documents.controller';
import { CnpjController } from './controllers/cnpj.controller';
import { SegmentsController } from './controllers/segments.controller';
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
import { DrizzleClientRepository } from './infra/drizzle-client.repository';
import { DrizzleClientDocumentRepository } from './infra/drizzle-client-document.repository';
import { ClientStorageService } from './infra/client-storage.service';
import { CnpjApiAdapter } from './infra/cnpj-api.adapter';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { CLIENT_DOCUMENT_REPOSITORY } from './domain/client-document.repository';

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
  ],
  providers: [
    // Use cases
    CreateClientUseCase,
    GetClientUseCase,
    ListClientsUseCase,
    UpdateClientUseCase,
    SubmitForAnalysisUseCase,
    GetDocumentChecklistUseCase,
    CanSubmitUseCase,
    UploadDocumentUseCase,
    DeleteDocumentUseCase,
    ValidateCnpjUseCase,
    // Repositories
    { provide: CLIENT_REPOSITORY, useClass: DrizzleClientRepository },
    { provide: CLIENT_DOCUMENT_REPOSITORY, useClass: DrizzleClientDocumentRepository },
    // Services
    ClientStorageService,
    CnpjApiAdapter,
  ],
})
export class ClientsModule {}
