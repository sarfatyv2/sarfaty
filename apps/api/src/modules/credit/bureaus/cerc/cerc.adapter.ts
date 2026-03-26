import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';
import type {
  CercAuthResponse,
  CercCriarLoteValidacoesRequest,
  CercCriarLoteValidacoesResponse,
  CercBuscaValidacoesDuplicataRequest,
  CercBuscaValidacoesResponse,
  CercGetDocumentoFiscalResponse,
  CercGetConstatacoeResponse,
  CercGetEventosResponse,
  CercGetPartesResponse,
  CercGetResultadosResponse,
} from './cerc.types';

const TOKEN_SAFETY_BUFFER_SECONDS = 60;

@Injectable()
export class CercAdapter {
  private readonly logger = new Logger(CercAdapter.name);
  private readonly requestTimeoutMs = 20_000;
  private readonly maxAttempts = 3;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private get baseUrl(): string {
    return (env.CERC_BASE_URL ?? 'https://de-homolog.cerc.inf.br').replace(/\/$/, '');
  }

  async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const sustainabilityToken = env.CERC_SUSTAINABILITY_TOKEN;
    const json = sustainabilityToken
      ? await this.fetchTokenViaSustentacao(sustainabilityToken)
      : await this.fetchTokenViaBasicAuth();

    this.cachedToken = json.access_token;
    this.tokenExpiresAt = Date.now() + (json.expires_in - TOKEN_SAFETY_BUFFER_SECONDS) * 1000;

    this.logger.debug(`CERC token obtained (${sustainabilityToken ? 'sustentação' : 'basic'}), expires in ${json.expires_in}s`);
    return this.cachedToken;
  }

  /**
   * Fluxo JWT via Token_sustentacao — necessário para a API de operações (Apigee).
   * POST /oauth/token com Authorization: Bearer {sustainabilityToken}, body vazio.
   */
  private async fetchTokenViaSustentacao(sustainabilityToken: string): Promise<CercAuthResponse> {
    const url = `${this.baseUrl}/oauth/token`;
    this.logger.log(`CERC OAuth (sustentação) → ${url}`);

    const response = await this.fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sustainabilityToken}`,
        },
      },
      'cerc.getAuthToken.sustentacao',
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`CERC OAuth (sustentação) failed: ${response.status} — ${body}`);
    }

    return response.json() as Promise<CercAuthResponse>;
  }

  /**
   * Fluxo Basic auth — Basic base64(client_id:client_secret) + urlencoded body.
   * Retorna UUID token aceito pela API de operações em api.int.cerc.com.
   */
  private async fetchTokenViaBasicAuth(): Promise<CercAuthResponse> {
    const clientId = env.CERC_CLIENT_ID;
    const clientSecret = env.CERC_CLIENT_SECRET;

    if (!clientId) throw new Error('CERC_CLIENT_ID is not configured');
    if (!clientSecret) throw new Error('CERC_CLIENT_SECRET is not configured');

    const url = `${this.baseUrl}/oauth/token`;
    const basicCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    this.logger.log(`CERC OAuth (basic) → ${url}`);

    const response = await this.fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicCredentials}`,
        },
        body: 'grant_type=client_credentials',
      },
      'cerc.getAuthToken.basic',
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`CERC OAuth (basic) failed: ${response.status} — ${body}`);
    }

    return response.json() as Promise<CercAuthResponse>;
  }

  invalidateToken(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = null;
  }

  // ---------------------------------------------------------------------------
  // Lotes de Validações
  // ---------------------------------------------------------------------------

  async criarLoteValidacoes(input: CercCriarLoteValidacoesRequest): Promise<CercCriarLoteValidacoesResponse> {
    const token = await this.getAuthToken();
    const operation = 'cerc.criarLoteValidacoes';

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/transaction-io/tio-mapper/v1/operations/lotes-de-validacoes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      },
      operation,
    );

    if (response.status === 401) this.invalidateToken();

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(`${operation} failed: ${response.status} — ${body}`);
      throw new Error(`CERC ${operation} error ${response.status}: ${body}`);
    }

    const loteId = response.headers.get('location');
    if (!loteId) throw new Error('CERC criarLoteValidacoes: header Location ausente na resposta');

    return { lote_id: loteId, status: 'criado' };
  }

  // ---------------------------------------------------------------------------
  // Busca de Validações
  // ---------------------------------------------------------------------------

  async buscarValidacoesDuplicataMercantil(input: CercBuscaValidacoesDuplicataRequest): Promise<CercBuscaValidacoesResponse> {
    return this.post<CercBuscaValidacoesResponse>(
      '/transaction-io/tio-mapper/v1/operations/validacoes/busca-de-validacoes-duplicata-mercantil',
      input,
      'cerc.buscarValidacoesDuplicataMercantil',
    );
  }

  // ---------------------------------------------------------------------------
  // Detalhes de Validação
  // ---------------------------------------------------------------------------

  async getDocumentoFiscal(validacaoId: string): Promise<CercGetDocumentoFiscalResponse> {
    return this.get<CercGetDocumentoFiscalResponse>(
      `/transaction-io/tio-mapper/v1/operations/validacoes/${validacaoId}/documento-fiscal`,
      'cerc.getDocumentoFiscal',
    );
  }

  async getConstatacoes(validacaoId: string): Promise<CercGetConstatacoeResponse> {
    const result = await this.get<CercGetConstatacoeResponse | { constatacoes: CercGetConstatacoeResponse }>(
      `/transaction-io/tio-mapper/v1/operations/validacoes/${validacaoId}/constatacoes`,
      'cerc.getConstatacoes',
    );
    // CERC may return a direct array or a wrapped { constatacoes: [] } — normalise to array.
    if (Array.isArray(result)) return result;
    if (result && Array.isArray((result as { constatacoes: CercGetConstatacoeResponse }).constatacoes)) {
      return (result as { constatacoes: CercGetConstatacoeResponse }).constatacoes;
    }
    return [];
  }

  async getEventos(validacaoId: string): Promise<CercGetEventosResponse> {
    return this.get<CercGetEventosResponse>(
      `/transaction-io/tio-mapper/v1/operations/validacoes/${validacaoId}/eventos`,
      'cerc.getEventos',
    );
  }

  async getPartes(validacaoId: string): Promise<CercGetPartesResponse> {
    return this.get<CercGetPartesResponse>(
      `/transaction-io/tio-mapper/v1/operations/validacoes/${validacaoId}/partes`,
      'cerc.getPartes',
    );
  }

  async getResultados(validacaoId: string): Promise<CercGetResultadosResponse> {
    return this.get<CercGetResultadosResponse>(
      `/transaction-io/tio-mapper/v1/operations/validacoes/${validacaoId}/resultados`,
      'cerc.getResultados',
    );
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async get<T>(path: string, operation: string): Promise<T> {
    const token = await this.getAuthToken();
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
      operation,
    );

    return this.handleResponse<T>(response, operation);
  }

  private async post<T>(path: string, body: unknown, operation: string): Promise<T> {
    const token = await this.getAuthToken();
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
      operation,
    );

    return this.handleResponse<T>(response, operation);
  }

  private async handleResponse<T>(response: Response, operation: string): Promise<T> {
    if (response.status === 401) {
      this.invalidateToken();
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(`${operation} failed: ${response.status} — ${body}`);
      throw new Error(`CERC ${operation} error ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
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
        if (shouldRetry && attemptNumber < this.maxAttempts) {
          const retryAfterMs = response.status === 429 ? 60_000 : attemptNumber * 500;
          this.logger.warn(`${operation} attempt ${attemptNumber} got ${response.status}, retrying in ${retryAfterMs}ms`);
          await this.delay(retryAfterMs);
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (attemptNumber < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed (${String(error)}), retrying`);
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
