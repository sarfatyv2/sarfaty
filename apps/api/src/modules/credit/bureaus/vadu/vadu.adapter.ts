import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';

export interface VaduAuthResult {
  token: string;
}

export interface VaduCompanyResult {
  razao_social?: string;
  situacao_cadastral?: string;
  [key: string]: any;
}

export interface VaduPersonResult {
  nome?: string;
  situacao_cadastral?: string;
  [key: string]: any;
}

@Injectable()
export class VaduAdapter {
  private readonly logger = new Logger(VaduAdapter.name);
  private readonly baseUrl = 'https://www.vadu.com.br/vadu.dll';
  private readonly requestTimeoutMs = 10_000;
  private readonly maxAttempts = 3;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {}

  /**
   * Retrieves a temporary session token.
   * Vadu's temporary tokens expire in 18 hours. We cache it for 17 hours to be safe.
   */
  async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const apiKey = env.VADU_API_KEY;
    if (!apiKey || apiKey === 'dummy') throw new Error('VADU_API_KEY is not configured');
    
    // Strip surrounding quotes if present
    const cleanApiKey = apiKey.replaceAll(/(^"|"$)/g, '');

    this.logger.debug('Fetching new Vadu token');
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/Autenticacao/JSONPegarToken`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanApiKey}`,
        },
      },
      'vadu.getAuthToken',
    );

    if (!response.ok) {
      this.logger.error(`Failed to fetch Vadu token: ${response.status} ${response.statusText}`);
      throw new Error('Vadu authentication failed');
    }

    // Usually Vadu responds with the token in the body as plain text or JSON
    const text = await response.text();
    let token = text.trim();
    
    try {
      if (token.startsWith('{')) {
        const json = JSON.parse(token);
        if (json.token) {
          token = json.token;
        }
      } else if (token.startsWith('"') && token.endsWith('"')) {
        // Remove quotes if the API returned a quoted string JSON
        token = token.slice(1, -1);
      }
    } catch {
      // Ignore parse errors, fallback to raw text
    }

    this.cachedToken = token;
    // Set expiration to 17 hours from now (17 * 60 * 60 * 1000 ms)
    this.tokenExpiresAt = Date.now() + 17 * 60 * 60 * 1000;
    
    return token;
  }

  /**
   * Queries a company by CNPJ
   * @param cnpj The CNPJ of the company (numbers only)
   */
  async queryCnpj(cnpj: string): Promise<VaduCompanyResult> {
    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const token = await this.getAuthToken();

    this.logger.debug(`Querying CNPJ: ${cleanCnpj}`);
    
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/ServicoAnaliseOperacao/Consulta/${cleanCnpj}?AtualizaCadastro=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Length': '0',
        },
      },
      'vadu.queryCnpj',
    );

    if (!response.ok) {
      this.logger.error(`Failed to query CNPJ: ${response.status} ${response.statusText}`);
      throw new Error('Vadu CNPJ query failed');
    }

    return response.json() as Promise<VaduCompanyResult>;
  }

  /**
   * Queries a person by CPF
   * @param cpf The CPF of the person (numbers only)
   */
  async queryCpf(cpf: string): Promise<VaduPersonResult> {
    const cleanCpf = cpf.replaceAll(/\D/g, '');
    const token = await this.getAuthToken();

    this.logger.debug(`Querying CPF: ${cleanCpf}`);

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/ServicoAnaliseOperacao/ConsultaPF/${cleanCpf}?UltimoSerasa=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Length': '0',
        },
      },
      'vadu.queryCpf',
    );

    if (!response.ok) {
      this.logger.error(`Failed to query CPF: ${response.status} ${response.statusText}`);
      throw new Error('Vadu CPF query failed');
    }

    return response.json() as Promise<VaduPersonResult>;
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
