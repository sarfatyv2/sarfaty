import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL_ID = 'gemini-2.5-flash';
const RETRYABLE_STATUS_CODES = [429, 503];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isRetryableGeminiError(error: unknown): boolean {
  if (error instanceof Error) {
    return RETRYABLE_STATUS_CODES.some((code) => error.message.includes(String(code)));
  }
  return false;
}

async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  logger: Logger,
  label: string,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableGeminiError(error) || attempt === MAX_RETRIES) {
        throw error;
      }
      const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
      logger.warn(`${label} — attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

@Injectable()
export class GeminiChatService {
  private readonly logger = new Logger(GeminiChatService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelId: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelId = process.env.CHAT_GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  async chat(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const conversationBlock =
      messages.length === 0
        ? ''
        : '\n\n---\n\nConversa:\n\n' +
          messages
            .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
            .join('\n\n');

    const fullPrompt = systemPrompt + conversationBlock;

    const response = await withGeminiRetry(
      () =>
        this.ai.models.generateContent({
          model: this.modelId,
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          config: {
            temperature: 0.2,
          },
        }),
      this.logger,
      'Chat message',
    );

    const text = response.text ?? '';
    if (!text) {
      throw new Error('Gemini returned an empty response for chat');
    }
    return text;
  }
}
