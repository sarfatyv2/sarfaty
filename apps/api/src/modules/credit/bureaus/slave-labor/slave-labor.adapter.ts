import { Injectable, Logger } from '@nestjs/common';

export interface SlaveLaborEntry {
  cnpjCpf: string;
  employerName: string;
  rescuedWorkers: number;
  inspectionDate: string | null;
  state: string | null;
  cnae: string | null;
}

export interface SlaveLaborMatch {
  cnpj: string;
  employerName: string;
  rescuedWorkers: number;
  inspectionDate: string | null;
}

@Injectable()
export class SlaveLaborAdapter {
  private readonly logger = new Logger(SlaveLaborAdapter.name);
  private readonly dataUrl = 'https://api.portaldatransparencia.gov.br/api-de-dados/trabalho-escravo';
  private readonly requestTimeoutMs = 30_000;

  /**
   * Checks if a CNPJ appears in the slave labor dirty list (Lista Suja do MTE).
   * Uses the transparency portal API which exposes this data.
   */
  async checkByCnpj(cnpj: string): Promise<SlaveLaborMatch | null> {
    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug(`Querying slave labor list for CNPJ ${cleanCnpj}`);

      const { env } = await import('../../../../config/env');
      const apiKey = env.CGU_API_KEY;

      if (apiKey) {
        const url = `${this.dataUrl}?cpfCnpj=${cleanCnpj}&pagina=1`;
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'chave-api-dados': apiKey,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const entries = Array.isArray(data) ? data : [];

          if (entries.length > 0) {
            const entry = entries[0];
            return {
              cnpj: cleanCnpj,
              employerName: entry.nomeEmpregador || entry.empregador || '',
              rescuedWorkers: Number.parseInt(entry.quantidadeTrabalhadores || '0', 10),
              inspectionDate: entry.dataFiscalizacao || null,
            };
          }
        }
      } else {
        clearTimeout(timeoutId);
        this.logger.warn('CGU_API_KEY not configured, slave labor check not available');
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`Slave labor check failed: ${(error as Error).message}`);
      return null;
    }
  }
}
