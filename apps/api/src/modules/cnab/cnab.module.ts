import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { DraweesModule } from '../drawees/drawees.module';

import { CnabController } from './controllers/cnab.controller';

import { UploadCnabFileUseCase } from './use-cases/upload-cnab-file.use-case';
import { ParseCnabFileUseCase } from './use-cases/parse-cnab-file.use-case';
import { GetCnabFileUseCase } from './use-cases/get-cnab-file.use-case';
import { ListCnabFilesUseCase } from './use-cases/list-cnab-files.use-case';
import { ListTradeReceivablesUseCase } from './use-cases/list-trade-receivables.use-case';

import { CnabParserRegistry } from './parser/cnab-parser.registry';
import { BradescoParser } from './parser/bradesco.parser';
import { BmpParser } from './parser/bmp.parser';

import { CNAB_FILE_REPOSITORY } from './domain/cnab-file.repository';
import { TRADE_RECEIVABLE_REPOSITORY } from './domain/trade-receivable.repository';
import { CLIENT_DRAWEE_REPOSITORY } from './domain/client-drawee.repository';

import { DrizzleCnabFileRepository } from './infra/drizzle-cnab-file.repository';
import { DrizzleTradeReceivableRepository } from './infra/drizzle-trade-receivable.repository';
import { DrizzleClientDraweeRepository } from './infra/drizzle-client-drawee.repository';

@Module({
  imports: [
    ClientsModule,
    DraweesModule,
  ],
  controllers: [CnabController],
  providers: [
    // Use cases
    UploadCnabFileUseCase,
    ParseCnabFileUseCase,
    GetCnabFileUseCase,
    ListCnabFilesUseCase,
    ListTradeReceivablesUseCase,
    // Parser
    BradescoParser,
    BmpParser,
    CnabParserRegistry,
    // Repositories
    { provide: CNAB_FILE_REPOSITORY, useClass: DrizzleCnabFileRepository },
    { provide: TRADE_RECEIVABLE_REPOSITORY, useClass: DrizzleTradeReceivableRepository },
    { provide: CLIENT_DRAWEE_REPOSITORY, useClass: DrizzleClientDraweeRepository },
  ],
  exports: [CNAB_FILE_REPOSITORY, TRADE_RECEIVABLE_REPOSITORY, CLIENT_DRAWEE_REPOSITORY],
})
export class CnabModule {}
