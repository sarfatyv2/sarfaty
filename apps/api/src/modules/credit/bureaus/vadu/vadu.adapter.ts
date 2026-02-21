import { Injectable, Logger } from '@nestjs/common';

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

    const apiKey = process.env['VADU_API_KEY'];
    if (!apiKey) throw new Error('VADU_API_KEY is not configured');
    
    this.logger.debug('Fetching new Vadu token');
    const response = await fetch(`${this.baseUrl}/Autenticacao/JSONPegarToken`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      this.logger.error(`Failed to fetch Vadu token: ${response.statusText}`);
      throw new Error('Vadu authentication failed');
    }

    // Usually Vadu responds with the token in the body as plain text or JSON
    const text = await response.text();
    let token = text.trim();
    // Remove quotes if the API returned a quoted string JSON
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
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
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const token = await this.getAuthToken();

    this.logger.debug(`Querying CNPJ: ${cleanCnpj}`);
    
    const response = await fetch(
      `${this.baseUrl}/ServicoAnaliseOperacao/Consulta/${cleanCnpj}?AtualizaCadastro=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Length': '0',
        },
      }
    );

    if (!response.ok) {
      this.logger.error(`Failed to query CNPJ: ${response.statusText}`);
      throw new Error('Vadu CNPJ query failed');
    }

    return response.json() as Promise<VaduCompanyResult>;
  }

  /**
   * Queries a person by CPF
   * @param cpf The CPF of the person (numbers only)
   */
  async queryCpf(cpf: string): Promise<VaduPersonResult> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const token = await this.getAuthToken();

    this.logger.debug(`Querying CPF: ${cleanCpf}`);

    const response = await fetch(
      `${this.baseUrl}/ServicoAnaliseOperacao/ConsultaPF/${cleanCpf}?UltimoSerasa=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Length': '0',
        },
      }
    );

    if (!response.ok) {
      this.logger.error(`Failed to query CPF: ${response.statusText}`);
      throw new Error('Vadu CPF query failed');
    }

    return response.json() as Promise<VaduPersonResult>;
  }
}
