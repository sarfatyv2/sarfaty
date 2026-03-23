import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';
import type { Collaborator } from '../../domain/collaborator.entity';
import type {
  FlashCreateEmployeeRequest,
  FlashEmployee,
  FlashListEmployeesParams,
  FlashListEmployeesResponse,
  FlashUpdateEmployeeRequest,
} from './flash.types';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;

/** Strips non-digits for CPF/CNPJ comparison with Flash documentNumber. */
export function normalizeBrazilianDocumentDigits(value: string): string {
  return value.replaceAll(/\D/g, '');
}

@Injectable()
export class FlashAdapter {
  private readonly logger = new Logger(FlashAdapter.name);

  private get baseUrl(): string {
    return (env.FLASH_BASE_URL ?? 'https://api.flashapp.services').replace(/\/$/, '');
  }

  isConfigured(): boolean {
    return Boolean(env.FLASH_API_KEY?.trim());
  }

  async listEmployees(params: FlashListEmployeesParams): Promise<FlashListEmployeesResponse> {
    if (!this.isConfigured()) {
      this.logger.warn('Flash listEmployees skipped: FLASH_API_KEY not set');
      return { records: [], metadata: { total: 0, page: params.page, limit: params.limit ?? 0 } };
    }

    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page));
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.order) searchParams.set('order', params.order);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.query) searchParams.set('query', params.query);
    if (params.companyId) searchParams.set('companyId', params.companyId);
    if (params.status) searchParams.set('status', params.status);
    if (params.roleId) searchParams.set('roleId', params.roleId);
    if (params.documentNumbers) searchParams.set('documentNumbers', params.documentNumbers);
    if (params.externalIds) searchParams.set('externalIds', params.externalIds);

    const query = searchParams.toString();
    const path = query.length > 0 ? `/core/v1/employees?${query}` : '/core/v1/employees';

    return this.get<FlashListEmployeesResponse>(path, 'flash.listEmployees');
  }

  async getEmployee(employeeId: string): Promise<FlashEmployee> {
    if (!this.isConfigured()) {
      throw new Error('FLASH_API_KEY is not configured');
    }
    return this.get<FlashEmployee>(`/core/v1/employees/${encodeURIComponent(employeeId)}`, 'flash.getEmployee');
  }

  async createEmployee(body: FlashCreateEmployeeRequest): Promise<FlashEmployee> {
    if (!this.isConfigured()) {
      throw new Error('FLASH_API_KEY is not configured');
    }
    return this.post<FlashEmployee>('/core/v1/employees', body, 'flash.createEmployee');
  }

  async updateEmployee(employeeId: string, body: FlashUpdateEmployeeRequest): Promise<FlashEmployee> {
    if (!this.isConfigured()) {
      throw new Error('FLASH_API_KEY is not configured');
    }
    return this.patch<FlashEmployee>(
      `/core/v1/employees/${encodeURIComponent(employeeId)}`,
      body,
      'flash.updateEmployee',
    );
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Flash deleteEmployee skipped: FLASH_API_KEY not set');
      return;
    }
    await this.deleteVoid(`/core/v1/employees/${encodeURIComponent(employeeId)}`, 'flash.deleteEmployee');
  }

  async deactivateEmployee(employeeId: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Flash deactivateEmployee skipped: FLASH_API_KEY not set');
      return;
    }
    await this.postVoid(
      `/core/v1/employees/${encodeURIComponent(employeeId)}/deactivate`,
      'flash.deactivateEmployee',
    );
  }

  async reactivateEmployee(employeeId: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Flash reactivateEmployee skipped: FLASH_API_KEY not set');
      return;
    }
    await this.postVoid(
      `/core/v1/employees/${encodeURIComponent(employeeId)}/reactivate`,
      'flash.reactivateEmployee',
    );
  }

  /**
   * Maps a Sarfaty collaborator to Flash PATCH payload and sends it.
   */
  async patchCollaboratorFromDomain(
    collaborator: Collaborator,
    managerFlashEmployeeId: string | null,
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Flash patchCollaboratorFromDomain skipped: FLASH_API_KEY not set');
      return;
    }

    const flashId = collaborator.flashEmployeeId;
    if (!flashId) {
      return;
    }

    const body: FlashUpdateEmployeeRequest = {
      name: collaborator.fullName,
      email: collaborator.corporateEmail ?? collaborator.personalEmail ?? undefined,
      externalId: collaborator.id,
      phoneNumber: collaborator.phone ?? undefined,
      corporateEmail: collaborator.corporateEmail ?? undefined,
      managerId: managerFlashEmployeeId ?? undefined,
    };

    if (env.FLASH_COMPANY_ID?.trim()) {
      body.companyId = env.FLASH_COMPANY_ID.trim();
    }

    if (collaborator.registrationDate) {
      body.invitationDate = `${collaborator.registrationDate}T12:00:00.000Z`;
    }

    await this.updateEmployee(flashId, body);
  }

  private getAuthHeaders(): Record<string, string> {
    const key = env.FLASH_API_KEY?.trim();
    if (!key) {
      throw new Error('FLASH_API_KEY is not configured');
    }
    return {
      'Content-Type': 'application/json',
      'x-flash-auth': key,
    };
  }

  private async get<T>(path: string, operation: string): Promise<T> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      operation,
    );
    return this.handleResponse<T>(response, operation);
  }

  private async post<T>(path: string, body: unknown, operation: string): Promise<T> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      },
      operation,
    );
    return this.handleResponse<T>(response, operation);
  }

  private async patch<T>(path: string, body: unknown, operation: string): Promise<T> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      },
      operation,
    );
    return this.handleResponse<T>(response, operation);
  }

  private async deleteVoid(path: string, operation: string): Promise<void> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      },
      operation,
    );
    await this.handleResponse<void>(response, operation);
  }

  private async postVoid(path: string, operation: string): Promise<void> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}${path}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      operation,
    );
    await this.handleResponse<void>(response, operation);
  }

  private async handleResponse<T>(response: Response, operation: string): Promise<T> {
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(`${operation} failed: ${response.status} — ${body}`);
      throw new Error(`Flash ${operation} error ${response.status}: ${body}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  private async fetchWithRetry(url: string, init: RequestInit, operation: string): Promise<Response> {
    let lastError: unknown;

    for (let attemptNumber = 1; attemptNumber <= MAX_ATTEMPTS; attemptNumber += 1) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, { ...init, signal: abortController.signal });
        clearTimeout(timeoutId);

        const shouldRetry = response.status >= 500 || response.status === 429;
        if (shouldRetry && attemptNumber < MAX_ATTEMPTS) {
          const retryAfterMs = response.status === 429 ? 60_000 : attemptNumber * 500;
          this.logger.warn(`${operation} attempt ${attemptNumber} got ${response.status}, retrying in ${retryAfterMs}ms`);
          await this.delay(retryAfterMs);
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (attemptNumber < MAX_ATTEMPTS) {
          this.logger.warn(`${operation} attempt ${attemptNumber} failed (${String(error)}), retrying`);
          await this.delay(attemptNumber * 500);
          continue;
        }
      }
    }

    const lastErrorMessage =
      lastError instanceof Error ? lastError.message : JSON.stringify(lastError);
    throw new Error(`${operation} failed after ${MAX_ATTEMPTS} attempts: ${lastErrorMessage}`);
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
