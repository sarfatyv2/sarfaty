import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { irpfRawExtractionSchema, type IrpfRawExtraction } from '@nexus/validators';
import type { IrpfClassification } from '../irpf-classifier.service';
import { IRPF_EXTRACTION_PROMPT } from './irpf-gemini-schema';

export interface IrpfExtractionContext {
  expectedPartnerName: string | null;
  expectedExerciseYears: number[];
}

function buildContextBlock(context: IrpfExtractionContext): string {
  const lines: string[] = [];

  const hasName = context.expectedPartnerName !== null;
  const hasYears = context.expectedExerciseYears.length > 0;

  if (!hasName && !hasYears) return '';

  lines.push('\n\nCONTEXTO DO DOCUMENTO:');

  if (hasName) {
    lines.push(`- Nome esperado do contribuinte: "${context.expectedPartnerName}"`);
  }
  if (hasYears) {
    lines.push(`- Ano(s) de exercício esperado(s): ${context.expectedExerciseYears.join(', ')}`);
  }

  lines.push('\nVALIDAÇÃO OBRIGATÓRIA:');

  if (hasName) {
    lines.push(
      `- Se o nome completo do contribuinte no documento NÃO corresponder a "${context.expectedPartnerName}" ` +
      `(desconsidere acentos e maiúsculas/minúsculas), defina "confidence" como "low" e ` +
      `adicione em "evidence" a string: ` +
      `"NOME_MISMATCH: esperado '${context.expectedPartnerName}', encontrado '<nome encontrado>'"`,
    );
  }

  if (hasYears) {
    const yearsLabel = context.expectedExerciseYears.join(', ');
    lines.push(
      `- Se o "exerciseYear" extraído NÃO estiver na lista [${yearsLabel}], ` +
      `defina "confidence" como "low" e adicione em "evidence" a string: ` +
      `"ANO_MISMATCH: esperado [${yearsLabel}], encontrado '<ano encontrado>'"`,
    );
  }

  return lines.join('\n');
}

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

@Injectable()
export class IrpfGeminiService {
  private readonly logger = new Logger(IrpfGeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelId: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelId = process.env.IRPF_GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  async extract(
    pdfBuffer: Buffer,
    classification: IrpfClassification,
    context: IrpfExtractionContext,
  ): Promise<IrpfRawExtraction> {
    this.logger.log(`Extracting IRPF data. Classification: ${classification.type}`);

    const pdfBase64 = pdfBuffer.toString('base64');
    const contextBlock = buildContextBlock(context);
    const prompt = `${IRPF_EXTRACTION_PROMPT}${contextBlock}\n\nO documento fornecido é: ${classification.label}`;

    const response = await withGeminiRetry(
      () =>
        this.ai.models.generateContent({
          model: this.modelId,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64,
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
      `IRPF extraction (document classification: ${classification.type})`,
    );

    const rawText = response.text ?? '';

    if (!rawText) {
      throw new Error('Gemini returned an empty response for IRPF extraction');
    }

    this.logger.log(`Raw Gemini response (first 500 chars): ${rawText.slice(0, 500)}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      this.logger.error('Failed to parse Gemini JSON response', { rawText, err });
      throw new Error(`Gemini response is not valid JSON: ${String(err)}`);
    }

    const result = irpfRawExtractionSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.warn('Gemini response failed Zod validation — using partial data', {
        issues: result.error.issues,
      });

      // Recover identity fields from raw parsed data so name/year mismatch checks still work
      const rawObj = parsed as Record<string, unknown>;
      const recoveredFullName = typeof rawObj['fullName'] === 'string' ? rawObj['fullName'] : null;
      const recoveredExerciseYear =
        typeof rawObj['exerciseYear'] === 'number' ? rawObj['exerciseYear'] : null;

      // Return the raw parse with defaults filled in by Zod .catch
      return irpfRawExtractionSchema.catch({
        cpf: null,
        fullName: recoveredFullName,
        exerciseYear: recoveredExerciseYear,
        calendarYear: null,
        declarationType: null,
        taxationOption: null,
        receiptNumber: null,
        deliveryTimestamp: null,
        birthDate: null,
        occupation: null,
        occupationCode: null,
        nationality: null,
        naturality: null,
        phone: null,
        email: null,
        addressStreet: null,
        addressNumber: null,
        addressComplement: null,
        addressNeighborhood: null,
        addressCity: null,
        addressState: null,
        addressZip: null,
        spouseName: null,
        spouseCpf: null,
        totalTaxableIncome: null,
        totalExemptIncome: null,
        totalExclusiveIncome: null,
        totalDeductions: null,
        taxableBase: null,
        taxDue: null,
        taxPaid: null,
        taxRefund: null,
        taxBalance: null,
        totalAssetsCurrentYear: null,
        totalAssetsPreviousYear: null,
        totalDebtsCurrentYear: null,
        totalDebtsPreviousYear: null,
        dependents: [],
        taxableIncomeItems: [],
        exemptIncomeItems: [],
        exclusiveIncomeItems: [],
        payments: [],
        assets: [],
        debts: [],
        confidence: 'low',
        evidence: [],
      }).parse(parsed);
    }

    return result.data;
  }
}
