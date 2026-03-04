import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';

interface CguApiRecord {
  [key: string]: any;
}

@Injectable()
export class CguAdapter {
  private readonly logger = new Logger(CguAdapter.name);
  private readonly baseUrl = 'https://api.portaldatransparencia.gov.br/api-de-dados';
  private readonly requestTimeoutMs = 15_000;

  async checkCeis(cnpj: string): Promise<CguApiRecord[]> {
    return this.queryEndpoint('ceis', 'cnpjSancionado', cnpj);
  }

  async checkCnep(cnpj: string): Promise<CguApiRecord[]> {
    return this.queryEndpoint('cnep', 'cnpjSancionado', cnpj);
  }

  async checkCepim(cnpj: string): Promise<CguApiRecord[]> {
    return this.queryEndpoint('cepim', 'cnpjSancionado', cnpj);
  }

  async checkAll(cnpj: string): Promise<{ ceis: CguApiRecord[]; cnep: CguApiRecord[]; cepim: CguApiRecord[] }> {
    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const [ceis, cnep, cepim] = await Promise.allSettled([
      this.checkCeis(cleanCnpj),
      this.checkCnep(cleanCnpj),
      this.checkCepim(cleanCnpj),
    ]);

    return {
      ceis: ceis.status === 'fulfilled' ? ceis.value : [],
      cnep: cnep.status === 'fulfilled' ? cnep.value : [],
      cepim: cepim.status === 'fulfilled' ? cepim.value : [],
    };
  }

  private async queryEndpoint(endpoint: string, paramName: string, cnpj: string): Promise<CguApiRecord[]> {
    const apiKey = env.CGU_API_KEY;
    if (!apiKey) {
      this.logger.warn('CGU_API_KEY not configured, skipping CGU check');
      return [];
    }

    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const url = `${this.baseUrl}/${endpoint}?${paramName}=${cleanCnpj}&pagina=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug(`Querying CGU ${endpoint} for CNPJ ${cleanCnpj}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'chave-api-dados': apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`CGU ${endpoint} returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`CGU ${endpoint} failed: ${(error as Error).message}`);
      return [];
    }
  }
}
