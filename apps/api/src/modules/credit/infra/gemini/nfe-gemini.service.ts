import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL_ID = 'gemini-2.5-pro';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000;

function isRetryableGeminiError(error: unknown): boolean {
  if (error instanceof Error) {
    return [429, 503].some((code) => error.message.includes(String(code)));
  }
  return false;
}

async function withGeminiRetry<T>(fn: () => Promise<T>, logger: Logger, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableGeminiError(error) || attempt === MAX_RETRIES) throw error;
      const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
      logger.warn(`${label} — attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

const NFE_EXTRACTION_PROMPT = `Você é um sistema de extração de dados de documentos fiscais brasileiros (DANFE / NF-e).

Analise a imagem ou PDF fornecido e extraia os seguintes campos em formato JSON:

- numeroDuplicata: número da duplicata ou número da NF-e (string, ex: "12811-2" ou "128")
- chaveNfe: chave de acesso da NF-e com 44 dígitos numéricos (sem espaços ou pontos)
- valor: valor total da NF-e em número decimal (ex: 358.40)
- vencimento: data de vencimento no formato YYYY-MM-DD (se não houver, use a data de emissão + 30 dias)
- cnpjCedente: CNPJ do destinatário/cedente (quem vai receber o pagamento), somente dígitos (14 caracteres)
- cnpjOriginador: CNPJ do emitente da NF-e (quem emitiu a nota), somente dígitos (14 caracteres)
- cnpjCpfPagador: CPF ou CNPJ do pagador/sacado (comprador), somente dígitos
- tipoPagador: "cpf" se o pagador for pessoa física, "cnpj" se for pessoa jurídica

Retorne SOMENTE o JSON, sem markdown, sem explicações. Se um campo não for encontrado, retorne null para ele.

Exemplo de retorno:
{
  "numeroDuplicata": "12811-2",
  "chaveNfe": "31250300349443000788550270000128111547124236",
  "valor": 358.40,
  "vencimento": "2025-10-18",
  "cnpjCedente": "13292092000172",
  "cnpjOriginador": "00349443000788",
  "cnpjCpfPagador": "44873461855",
  "tipoPagador": "cpf"
}`;

export interface NfeExtractedData {
  numeroDuplicata: string | null;
  chaveNfe: string | null;
  valor: number | null;
  vencimento: string | null;
  cnpjCedente: string | null;
  cnpjOriginador: string | null;
  cnpjCpfPagador: string | null;
  tipoPagador: 'cpf' | 'cnpj' | null;
}

@Injectable()
export class NfeGeminiService {
  private readonly logger = new Logger(NfeGeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelId: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
    this.ai = new GoogleGenAI({ apiKey });
    this.modelId = process.env.GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID;
  }

  async extract(fileBuffer: Buffer, mimeType: string): Promise<NfeExtractedData> {
    this.logger.log(`Extracting NF-e data. MIME: ${mimeType}`);

    const fileBase64 = fileBuffer.toString('base64');

    const response = await withGeminiRetry(
      () =>
        this.ai.models.generateContent({
          model: this.modelId,
          contents: [
            {
              role: 'user',
              parts: [
                { text: NFE_EXTRACTION_PROMPT },
                { inlineData: { mimeType, data: fileBase64 } },
              ],
            },
          ],
          config: { responseMimeType: 'application/json', temperature: 0 },
        }),
      this.logger,
      'NF-e extraction',
    );

    const rawText = response.text ?? '';
    if (!rawText) throw new Error('Gemini returned an empty response for NF-e extraction');

    this.logger.log(`Gemini NF-e response: ${rawText.slice(0, 300)}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      this.logger.error('Failed to parse Gemini JSON response', { rawText, err });
      throw new Error(`Gemini response is not valid JSON: ${String(err)}`);
    }

    return parsed as NfeExtractedData;
  }
}
