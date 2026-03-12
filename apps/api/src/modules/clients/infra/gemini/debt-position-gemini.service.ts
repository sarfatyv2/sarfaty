import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { debtPositionRawExtractionSchema, type DebtPositionRawExtraction, type DebtPositionRawItem } from '@nexus/validators';
import { DEBT_POSITION_EXTRACTION_PROMPT } from './debt-position-gemini-schema';

const DEFAULT_MODEL_ID = 'gemini-2.5-pro';

const RETRYABLE_STATUS_CODES = [429, 503];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000;

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
      logger.warn(`${label} — attempt ${attempt}/${MAX_RETRIES} failed (retryable). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

const EMPTY_ITEM_FALLBACK: DebtPositionRawItem = {
  institution: null,
  modality: null,
  guarantee: null,
  guaranteePercentage: null,
  value: null,
  confidence: 'low',
};

@Injectable()
export class DebtPositionGeminiService {
  private readonly logger = new Logger(DebtPositionGeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelId: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelId = process.env.DEBT_POSITION_GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  async extract(fileBuffer: Buffer, mimeType: string): Promise<DebtPositionRawExtraction> {
    this.logger.log(`Extracting debt position data. MIME type: ${mimeType}`);

    const fileBase64 = fileBuffer.toString('base64');

    const response = await withGeminiRetry(
      () =>
        this.ai.models.generateContent({
          model: this.modelId,
          contents: [
            {
              role: 'user',
              parts: [
                { text: DEBT_POSITION_EXTRACTION_PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: fileBase64,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0,
          },
        }),
      this.logger,
      `DebtPosition extraction (mimeType: ${mimeType})`,
    );

    const rawText = response.text ?? '';

    if (!rawText) {
      throw new Error('Gemini returned an empty response for debt position extraction');
    }

    this.logger.log(`Raw Gemini response (first 500 chars): ${rawText.slice(0, 500)}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      this.logger.error('Failed to parse Gemini JSON response', { rawText, err });
      throw new Error(`Gemini response is not valid JSON: ${String(err)}`);
    }

    if (!Array.isArray(parsed)) {
      this.logger.warn('Gemini returned a non-array response — wrapping in array');
      parsed = [parsed];
    }

    const candidates = parsed as unknown[];

    if (candidates.length === 0) {
      this.logger.log('Gemini returned an empty array — no debts found in document');
      return [];
    }

    return candidates.map((item, index) => {
      const result = debtPositionRawExtractionSchema.element.safeParse(item);
      if (!result.success) {
        this.logger.warn(`Item ${index} failed Zod validation — using partial fallback`, {
          issues: result.error.issues,
        });
        return debtPositionRawExtractionSchema.element.catch(EMPTY_ITEM_FALLBACK).parse(item);
      }
      return result.data;
    });
  }
}
