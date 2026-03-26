import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';
import type {
  UpminerAuthResponse,
  UpminerCreateBatchRequest,
  UpminerCreateBatchResponse,
  UpminerBatchStatusResponse,
  UpminerBatchWorkflowStatusResponse,
  UpminerBatchResponse,
  UpminerAddQueueResponse,
  UpminerBatchErrorsResponse,
  UpminerFixParamsRequest,
  UpminerFixParamsResponse,
  UpminerCheckDuplicatesRequest,
  UpminerCheckDuplicatesResponse,
  UpminerProfileListResponse,
  UpminerBatchDossiersResponse,
  UpminerDossierDetailResponse,
  UpminerAddCommentRequest,
  UpminerCommentResponse,
  UpminerPdfRequestRequest,
  UpminerPdfRequestResponse,
  UpminerPdfDownloadResponse,
  UpminerParallelRequest,
  UpminerParallelCreateResponse,
  UpminerParallelStatusResponse,
  UpminerSourceQueryRequest,
  UpminerSource15Response,
} from './upminer.types';

const TOKEN_SAFETY_BUFFER_SECONDS = 60;

@Injectable()
export class UpminerAdapter {
  private readonly logger = new Logger(UpminerAdapter.name);
  private readonly requestTimeoutMs = 20_000;
  private readonly maxAttempts = 3;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private get baseUrl(): string {
    return (env.UPMINER_BASE_URL ?? 'https://upapi-orchestrator.uplexis.com').replace(/\/$/, '');
  }

  async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const clientId = env.UPMINER_CLIENT_ID;
    const clientSecret = env.UPMINER_CLIENT_SECRET;

    if (!clientId) throw new Error('UPMINER_CLIENT_ID is not configured');
    if (!clientSecret) throw new Error('UPMINER_CLIENT_SECRET is not configured');

    const url = `${this.baseUrl}/oauth/token`;

    this.logger.log(`upMiner OAuth login → ${url}`);

    const response = await this.fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: '*',
        }),
      },
      'upminer.getAuthToken',
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`upMiner OAuth failed: ${response.status} — ${body}`);
    }

    const json = await response.json() as UpminerAuthResponse;

    this.cachedToken = json.access_token;
    this.tokenExpiresAt = Date.now() + (json.expires_in - TOKEN_SAFETY_BUFFER_SECONDS) * 1000;

    this.logger.debug(`upMiner token obtained, expires in ${json.expires_in}s`);
    return this.cachedToken;
  }

  invalidateToken(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = null;
  }

  // ---------------------------------------------------------------------------
  // Batch
  // ---------------------------------------------------------------------------

  async createBatch(input: UpminerCreateBatchRequest): Promise<UpminerCreateBatchResponse> {
    return this.post<UpminerCreateBatchResponse>('/apps/upminer/batches', input, 'upminer.createBatch');
  }

  async addBatchToQueue(batchId: number): Promise<UpminerAddQueueResponse> {
    return this.get<UpminerAddQueueResponse>(
      `/apps/upminer/batches/${batchId}/add-queue`,
      'upminer.addBatchToQueue',
    );
  }

  async getBatchStatus(batchId: number): Promise<UpminerBatchStatusResponse> {
    return this.get<UpminerBatchStatusResponse>(
      `/apps/upminer/batches/${batchId}/status`,
      'upminer.getBatchStatus',
    );
  }

  async getBatch(batchId: number): Promise<UpminerBatchResponse> {
    return this.get<UpminerBatchResponse>(
      `/apps/upminer/batches/${batchId}`,
      'upminer.getBatch',
    );
  }

  async getBatchWorkflowStatus(batchId: number): Promise<UpminerBatchWorkflowStatusResponse> {
    return this.get<UpminerBatchWorkflowStatusResponse>(
      `/apps/upminer/batches/${batchId}/workflow/status`,
      'upminer.getBatchWorkflowStatus',
    );
  }

  async verifyBatchErrors(batchId: number): Promise<UpminerBatchErrorsResponse> {
    return this.get<UpminerBatchErrorsResponse>(
      `/apps/upminer/batches/${batchId}/verify-errors`,
      'upminer.verifyBatchErrors',
    );
  }

  async fixBatchParams(batchId: number, input: UpminerFixParamsRequest): Promise<UpminerFixParamsResponse> {
    return this.post<UpminerFixParamsResponse>(
      `/apps/upminer/batches/${batchId}/fix-params`,
      input,
      'upminer.fixBatchParams',
    );
  }

  async checkDuplicates(input: UpminerCheckDuplicatesRequest): Promise<UpminerCheckDuplicatesResponse> {
    return this.post<UpminerCheckDuplicatesResponse>(
      '/apps/upminer/batches/is-duplicate',
      input,
      'upminer.checkDuplicates',
    );
  }

  async listProfiles(): Promise<UpminerProfileListResponse> {
    return this.get<UpminerProfileListResponse>(
      '/apps/upminer/batches/profile/list',
      'upminer.listProfiles',
    );
  }

  // ---------------------------------------------------------------------------
  // Dossiers
  // ---------------------------------------------------------------------------

  async getBatchDossiers(batchId: number): Promise<UpminerBatchDossiersResponse> {
    return this.get<UpminerBatchDossiersResponse>(
      `/apps/upminer/batches/${batchId}/dossiers`,
      'upminer.getBatchDossiers',
    );
  }

  async getDossier(dossierId: number | string): Promise<UpminerDossierDetailResponse> {
    return this.get<UpminerDossierDetailResponse>(
      `/apps/upminer/dossiers/${dossierId}`,
      'upminer.getDossier',
    );
  }

  async getDossierSource(dossierId: number | string, sourceMethod: string): Promise<unknown> {
    return this.get<unknown>(
      `/apps/upminer/dossiers/${dossierId}/sources/${sourceMethod}`,
      'upminer.getDossierSource',
    );
  }

  async addDossierComment(dossierId: number | string, input: UpminerAddCommentRequest): Promise<UpminerCommentResponse> {
    return this.post<UpminerCommentResponse>(
      `/apps/upminer/dossiers/${dossierId}/comments`,
      input,
      'upminer.addDossierComment',
    );
  }

  // ---------------------------------------------------------------------------
  // PDF (2-step async)
  // ---------------------------------------------------------------------------

  async requestDossierPdf(dossierId: number | string, input: UpminerPdfRequestRequest = {}): Promise<UpminerPdfRequestResponse> {
    return this.post<UpminerPdfRequestResponse>(
      `/apps/upminer/dossiers/${dossierId}/pdf`,
      input,
      'upminer.requestDossierPdf',
    );
  }

  async getDossierPdf(dossierId: number | string, processId: string): Promise<UpminerPdfDownloadResponse> {
    return this.get<UpminerPdfDownloadResponse>(
      `/apps/upminer/dossiers/${dossierId}/pdf/${processId}`,
      'upminer.getDossierPdf',
    );
  }

  // ---------------------------------------------------------------------------
  // Parallel Sources
  // ---------------------------------------------------------------------------

  async processSourcesParallel(input: UpminerParallelRequest): Promise<UpminerParallelCreateResponse> {
    return this.post<UpminerParallelCreateResponse>('/sources/parallel', input, 'upminer.processSourcesParallel');
  }

  async getParallelProcessStatus(processId: string): Promise<UpminerParallelStatusResponse> {
    return this.get<UpminerParallelStatusResponse>(`/sources/parallel/${processId}`, 'upminer.getParallelProcessStatus');
  }

  async getParallelItemResult(processId: string, itemId: string): Promise<unknown> {
    return this.get<unknown>(`/sources/parallel/${processId}/items/${itemId}`, 'upminer.getParallelItemResult');
  }

  // ---------------------------------------------------------------------------
  // Direct Source Query
  // ---------------------------------------------------------------------------

  async querySource15(params: Record<string, string>): Promise<UpminerSource15Response> {
    const body: UpminerSourceQueryRequest = { params };
    return this.post<UpminerSource15Response>('/sources/15', body, 'upminer.querySource15');
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
      throw new Error(`upMiner ${operation} error ${response.status}: ${body}`);
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
