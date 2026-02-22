import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';

export interface CreditboxReportRequestInput {
  documento: string;
  formatosSaida?: string[];
  secaoCedente?: { blocos: string[] };
  secaoSacado?: { blocos: string[] };
  secaoGerais?: { blocos: string[] };
  secaoExclusivos?: { blocos: string[] };
}

export interface CreditboxReportRequestOutput {
  iniciado: boolean;
  mensagem: string | null;
  id: string | null;
}

export interface CreditboxReportConsultOutput {
  concluido: boolean;
  erro: boolean;
  id: string;
  pdfBase64?: string;
  json?: any;
  mensagem?: string;
}

@Injectable()
export class CreditboxAdapter {
  private readonly baseUrl = 'https://www.creditbox.com.br/CreditBox.dll';
  private readonly logger = new Logger(CreditboxAdapter.name);
  private readonly requestTimeoutMs = 10_000;
  private readonly maxAttempts = 3;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const apiKey = env.VADU_API_KEY;
    if (!apiKey || apiKey === 'dummy') {
      throw new Error('VADU_API_KEY is not configured');
    }

    // Strip surrounding quotes if present
    const cleanApiKey = apiKey.replaceAll(/(^"|"$)/g, '');

    this.logger.debug('Fetching new CreditBox temporary token');

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/Autenticacao/JSONPegarToken`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanApiKey}`,
          'Content-Type': 'application/json',
        },
      },
      'creditbox.getAuthToken',
    );

    if (!response.ok) {
      this.logger.error(`Failed to get CreditBox token: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to authenticate with CreditBox: ${response.statusText}`);
    }

    const text = await response.text();
    let token = text.trim();

    try {
      if (token.startsWith('{')) {
        const json = JSON.parse(token);
        if (json.token) {
          token = json.token;
        }
      } else if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
    } catch {
      // Ignore parse errors, fallback to raw text
    }

    this.cachedToken = token;
    // Token is valid for 18 hours, let's cache for 17 hours to be safe
    this.tokenExpiresAt = Date.now() + 17 * 60 * 60 * 1000;

    return token;
  }

  async requestReport(input: CreditboxReportRequestInput): Promise<CreditboxReportRequestOutput> {
    const token = await this.getAuthToken();
    const cleanDoc = input.documento.replaceAll(/\D/g, '');

    const payload = {
      documento: cleanDoc,
      formatosSaida: input.formatosSaida || ['json', 'pdf'],
      secaoCedente: input.secaoCedente || { blocos: [] },
      secaoGerais: input.secaoGerais || { blocos: [] },
      secaoExclusivos: input.secaoExclusivos || { blocos: [] },
    };

    this.logger.debug(`Requesting CreditBox report for document ${cleanDoc}`);

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/CreditBoxReport/JSONGerarReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      'creditbox.requestReport',
    );

    if (!response.ok) {
      this.logger.error(`CreditBox requestReport failed: ${response.status} ${response.statusText}`);
      throw new Error(`CreditBox API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as CreditboxReportRequestOutput;
  }

  async consultReport(processId: string): Promise<CreditboxReportConsultOutput> {
    const token = await this.getAuthToken();

    this.logger.debug(`Consulting CreditBox report status for processId ${processId}`);

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/CreditBoxReport/JConsultarReport/${processId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      'creditbox.consultReport',
    );

    if (!response.ok) {
      this.logger.error(`CreditBox consultReport failed: ${response.status} ${response.statusText}`);
      throw new Error(`CreditBox API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as CreditboxReportConsultOutput;
  }

  private async fetchWithRetry(url: string, init: RequestInit, operation: string): Promise<Response> {
    let lastError: unknown;

    for (let attemptNumber = 1; attemptNumber <= this.maxAttempts; attemptNumber += 1) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.requestTimeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: abortController.signal });
        clearTimeout(timeoutId);

        const shouldRetry = response.status >= 500 || response.status === 429;
        if (!response.ok && shouldRetry && attemptNumber < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed with ${response.status}, retrying`);
          await this.delay(attemptNumber * 300);
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (attemptNumber < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed, retrying`);
          await this.delay(attemptNumber * 300);
          continue;
        }
      }
    }

    throw new Error(`${operation} failed after ${this.maxAttempts} attempts: ${String(lastError)}`);
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
