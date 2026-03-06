import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { CreditModule } from '../credit/credit.module';
import { ClientChatController } from './controllers/client-chat.controller';
import { BuildClientChatContextUseCase } from './use-cases/build-client-chat-context.use-case';
import { SendClientChatMessageUseCase } from './use-cases/send-client-chat-message.use-case';
import { GeminiChatService } from './infra/gemini-chat.service';

@Module({
  imports: [ClientsModule, CreditModule],
  controllers: [ClientChatController],
  providers: [
    GeminiChatService,
    BuildClientChatContextUseCase,
    SendClientChatMessageUseCase,
  ],
})
export class ChatModule {}
