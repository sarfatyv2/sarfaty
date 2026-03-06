import { Injectable } from '@nestjs/common';
import { BuildClientChatContextUseCase } from './build-client-chat-context.use-case';
import { GeminiChatService, type ChatMessage } from '../infra/gemini-chat.service';
import { ClientNotFoundException } from '../../clients/domain/exceptions/client-not-found.exception';
import { GetClientUseCase } from '../../clients/use-cases/get-client.use-case';

const SYSTEM_PROMPT = `Você é um assistente comercial que ajuda a equipe com dúvidas sobre clientes.
Use APENAS os dados fornecidos abaixo. Não invente informações.
Responda em português (pt-BR) de forma objetiva e clara.
Se não tiver a informação nos dados, diga explicitamente que não possui essa informação e sugira verificar nas abas específicas (Documentos, Bureau, Contatos, etc.).
Mantenha as respostas concisas.`;

@Injectable()
export class SendClientChatMessageUseCase {
  constructor(
    private readonly getClient: GetClientUseCase,
    private readonly buildContext: BuildClientChatContextUseCase,
    private readonly geminiChat: GeminiChatService,
  ) {}

  async execute(
    clientId: string,
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<{ content: string }> {
    const client = await this.getClient.execute(clientId).catch(() => null);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    const context = await this.buildContext.execute(clientId);
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n--- DADOS DO CLIENTE ---\n\n${context}`;

    const messages: ChatMessage[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const content = await this.geminiChat.chat(fullSystemPrompt, messages);
    return { content };
  }
}
