import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';

export interface SerasaReportInput {
  cnpj: string;
  reportName?: string;
  optionalFeatures?: string[];
  reportParameters?: Record<string, string>[];
}

export interface SerasaReportOutput {
  statusCode: number;
  data: any | null;
  error: string | null;
  requestId: string | null;
}

const BASE_URLS = {
  uat: 'https://uat-api.serasaexperian.com.br',
  prod: 'https://api.serasaexperian.com.br',
} as const;

const TOKEN_CACHE_MS = 55 * 60 * 1000; // 55 min (token expires in ~1h)
const DEFAULT_REPORT = 'RELATORIO_AVANCADO_PJ';

@Injectable()
export class SerasaAdapter {
  private readonly logger = new Logger(SerasaAdapter.name);
  private readonly requestTimeoutMs = 15_000;
  private readonly maxAttempts = 3;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private get baseUrl(): string {
    return BASE_URLS[env.SERASA_ENV || 'uat'];
  }

  async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const clientId = env.SERASA_CLIENT_ID;
    const clientSecret = env.SERASA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('SERASA_CLIENT_ID / SERASA_CLIENT_SECRET not configured');
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const loginUrl = `${this.baseUrl}/security/iam/v1/client-identities/login`;

    this.logger.log(`Serasa IAM login → ${loginUrl} (env=${env.SERASA_ENV}, clientId=${clientId.slice(0, 6)}…)`);

    const response = await this.fetchWithRetry(
      loginUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basic}`,
        },
        body: '{}',
      },
      'serasa.getAuthToken',
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Serasa IAM login failed: ${response.status} — url=${loginUrl} env=${env.SERASA_ENV} body=${body}`);
      throw new Error(`Serasa IAM login failed: ${response.status} (env=${env.SERASA_ENV}, url=${this.baseUrl})`);
    }

    const json = await response.json() as {
      accessToken: string;
      tokenType: string;
      expiresIn: string | number;
      scope: string[];
    };

    this.cachedToken = json.accessToken;
    this.tokenExpiresAt = Date.now() + TOKEN_CACHE_MS;

    this.logger.debug(`Serasa IAM token obtained (scope: ${json.scope?.join(',')})`);
    return this.cachedToken;
  }

  async getReport(input: SerasaReportInput): Promise<SerasaReportOutput> {
    const token = await this.getAuthToken();
    const cleanCnpj = input.cnpj.replaceAll(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      throw new Error(`Invalid CNPJ length: ${cleanCnpj.length} (expected 14)`);
    }

    const reportName = input.reportName || DEFAULT_REPORT;
    const features = input.optionalFeatures?.join(',') ?? '';

    const params = new URLSearchParams({ reportName });
    if (features) {
      params.set('optionalFeatures', features);
    }
    if (input.reportParameters?.length) {
      const encoded = Buffer.from(
        JSON.stringify({ reportParameters: input.reportParameters }),
      ).toString('base64');
      params.set('reportParameters', encoded);
    }

    const url = `${this.baseUrl}/credit-services/business-information-report/v1/reports?${params.toString()}`;

    this.logger.debug(`Serasa report request: ${reportName} | CNPJ ${cleanCnpj} | features: ${features || '(none)'}`);

    const response = await this.fetchWithRetry(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Document-Id': cleanCnpj,
        },
      },
      'serasa.getReport',
    );

    const requestId = response.headers.get('x-request-id') || response.headers.get('correlation-id') || null;
    const statusCode = response.status;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.warn(`Serasa report error ${statusCode} for ${cleanCnpj}: ${errorBody}`);

      let errorParsed: any = null;
      try { errorParsed = JSON.parse(errorBody); } catch { /* raw text */ }

      const parsedErrorMessage = Array.isArray(errorParsed)
        ? (errorParsed[0]?.message ?? errorBody)
        : (errorParsed?.message || errorParsed?.errors?.[0]?.message || errorBody || `HTTP ${statusCode}`);

      return {
        statusCode,
        data: null,
        error: parsedErrorMessage || `HTTP ${statusCode}`,
        requestId,
      };
    }

    const data = await response.json();
    this.logger.log(`Serasa report OK for ${cleanCnpj} (${reportName})`);

    return { statusCode, data, error: null, requestId };
  }

  /**
   * Invalidates cached token so the next call to getAuthToken() fetches a new one.
   */
  invalidateToken(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = null;
  }

  private async fetchWithRetry(url: string, init: RequestInit, operation: string): Promise<Response> {
    let lastError: unknown;

    for (let attemptNumber = 1; attemptNumber <= this.maxAttempts; attemptNumber += 1) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.requestTimeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: abortController.signal });
        clearTimeout(timeoutId);

        if (response.status === 401 && operation !== 'serasa.getAuthToken' && attemptNumber === 1) {
          this.logger.warn('Serasa returned 401, refreshing token and retrying');
          this.invalidateToken();
          const newInit = { ...init };
          const newToken = await this.getAuthToken();
          (newInit.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...newInit, signal: AbortSignal.timeout(this.requestTimeoutMs) });
          return retryResponse;
        }

        const shouldRetry = response.status >= 500 || response.status === 429;
        if (!response.ok && shouldRetry && attemptNumber < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed with ${response.status}, retrying`);
          await this.delay(attemptNumber * 500);
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (attemptNumber < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed, retrying`);
          await this.delay(attemptNumber * 500);
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
