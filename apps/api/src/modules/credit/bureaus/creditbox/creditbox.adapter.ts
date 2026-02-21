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
    const cleanApiKey = apiKey.replace(/^"|"$/g, '');

    this.logger.debug('Fetching new CreditBox temporary token');

    const response = await fetch(`${this.baseUrl}/Autenticacao/JSONPegarToken`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to get CreditBox token: ${response.status} ${response.statusText} - ${errorText}`);
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
      } else if (token.startsWith('\"') && token.endsWith('\"')) {
        token = token.slice(1, -1);
      }
    } catch (e) {
      // Ignore parse errors, fallback to raw text
    }

    this.cachedToken = token;
    // Token is valid for 18 hours, let's cache for 17 hours to be safe
    this.tokenExpiresAt = Date.now() + 17 * 60 * 60 * 1000;

    return token;
  }

  async requestReport(input: CreditboxReportRequestInput): Promise<CreditboxReportRequestOutput> {
    const token = await this.getAuthToken();
    const cleanDoc = input.documento.replace(/\D/g, '');

    const payload = {
      documento: cleanDoc,
      formatosSaida: input.formatosSaida || ['json', 'pdf'],
      secaoCedente: input.secaoCedente || { blocos: [] },
      secaoGerais: input.secaoGerais || { blocos: [] },
      secaoExclusivos: input.secaoExclusivos || { blocos: [] },
    };

    this.logger.debug(`Requesting CreditBox report for document ${cleanDoc}`);

    const response = await fetch(`${this.baseUrl}/CreditBoxReport/JSONGerarReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`CreditBox requestReport failed: ${response.status} ${errorText}`);
      throw new Error(`CreditBox API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as CreditboxReportRequestOutput;
  }

  async consultReport(processId: string): Promise<CreditboxReportConsultOutput> {
    const token = await this.getAuthToken();

    this.logger.debug(`Consulting CreditBox report status for processId ${processId}`);

    const response = await fetch(`${this.baseUrl}/CreditBoxReport/JConsultarReport/${processId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`CreditBox consultReport failed: ${response.status} ${errorText}`);
      throw new Error(`CreditBox API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as CreditboxReportConsultOutput;
  }
}
