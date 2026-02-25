import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { faturamentoRawExtractionSchema, type FaturamentoRawExtraction } from '@nexus/validators';
import { FATURAMENTO_EXTRACTION_PROMPT } from './faturamento-gemini-schema';

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

const EMPTY_FALLBACK: FaturamentoRawExtraction = {
  cnpj: null,
  cpf: null,
  companyName: null,
  year: null,
  monthlyRevenues: null,
  totalAnnualRevenue: null,
  documentDescription: null,
  confidence: 'low',
};

@Injectable()
export class FaturamentoGeminiService {
  private readonly logger = new Logger(FaturamentoGeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelId: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelId = process.env.FATURAMENTO_GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  /**
   * Extracts billing data from a document file.
   * Returns an array — single-year documents produce one item,
   * multi-year documents produce one item per year.
   */
  async extract(fileBuffer: Buffer, mimeType: string): Promise<FaturamentoRawExtraction[]> {
    this.logger.log(`Extracting faturamento data. MIME type: ${mimeType}`);

    const fileBase64 = fileBuffer.toString('base64');

    const response = await withGeminiRetry(
      () =>
        this.ai.models.generateContent({
          model: this.modelId,
          contents: [
            {
              role: 'user',
              parts: [
                { text: FATURAMENTO_EXTRACTION_PROMPT },
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
      `Faturamento extraction (mimeType: ${mimeType})`,
    );

    const rawText = response.text ?? '';

    if (!rawText) {
      throw new Error('Gemini returned an empty response for faturamento extraction');
    }

    this.logger.log(`Raw Gemini response (first 500 chars): ${rawText.slice(0, 500)}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      this.logger.error('Failed to parse Gemini JSON response', { rawText, err });
      throw new Error(`Gemini response is not valid JSON: ${String(err)}`);
    }

    return this.normalizeToArray(parsed);
  }

  private normalizeToArray(parsed: unknown): FaturamentoRawExtraction[] {
    const candidates = Array.isArray(parsed) ? parsed : [parsed];

    if (candidates.length === 0) {
      this.logger.warn('Gemini returned an empty array — using fallback');
      return [EMPTY_FALLBACK];
    }

    return candidates.map((item, index) => {
      const result = faturamentoRawExtractionSchema.safeParse(item);
      if (!result.success) {
        this.logger.warn(`Item ${index} failed Zod validation — using partial fallback`, {
          issues: result.error.issues,
        });
        return faturamentoRawExtractionSchema.catch(EMPTY_FALLBACK).parse(item);
      }
      return result.data;
    });
  }
}
