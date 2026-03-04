import { Injectable, Logger } from '@nestjs/common';

export interface PgfnDebtorResult {
  found: boolean;
  totalDebtAmount: number | null;
  debtCount: number;
  rawEntries: any[];
}

@Injectable()
export class PgfnAdapter {
  private readonly logger = new Logger(PgfnAdapter.name);
  private readonly baseUrl = 'https://www.listadevedores.pgfn.gov.br';
  private readonly requestTimeoutMs = 20_000;

  /**
   * Queries the PGFN public debtor list.
   * The PGFN portal is HTML-based, so this adapter attempts to scrape results.
   * If scraping fails (portal changes), it gracefully returns not-found.
   */
  async queryByCnpj(cnpj: string): Promise<PgfnDebtorResult> {
    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug(`Querying PGFN for CNPJ ${cleanCnpj}`);

      const searchUrl = `${this.baseUrl}/api/consulta?cpfCnpj=${cleanCnpj}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`PGFN returned ${response.status}, falling back to not-found`);
        return { found: false, totalDebtAmount: null, debtCount: 0, rawEntries: [] };
      }

      const data = await response.json() as Record<string, unknown>;
      const entries = Array.isArray(data) ? data : (data?.resultados as unknown[] ?? data?.inscricoes as unknown[] ?? []);

      if (entries.length === 0) {
        return { found: false, totalDebtAmount: null, debtCount: 0, rawEntries: [] };
      }

      let totalDebt = 0;
      for (const entry of entries) {
        const value = Number.parseFloat(entry.valorConsolidado || entry.valor || '0');
        if (!Number.isNaN(value)) totalDebt += value;
      }

      return {
        found: true,
        totalDebtAmount: totalDebt > 0 ? totalDebt : null,
        debtCount: entries.length,
        rawEntries: entries,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`PGFN query failed: ${(error as Error).message}`);
      return { found: false, totalDebtAmount: null, debtCount: 0, rawEntries: [] };
    }
  }
}
