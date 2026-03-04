import { Injectable, Logger } from '@nestjs/common';

export interface PepMatch {
  cpf: string;
  nome: string;
  funcao: string;
  orgao: string;
  dataInicio: string | null;
  dataFim: string | null;
}

@Injectable()
export class PepAdapter {
  private readonly logger = new Logger(PepAdapter.name);
  private readonly pepDataUrl = 'https://portaldatransparencia.gov.br/download-de-dados/pep';
  private readonly requestTimeoutMs = 30_000;
  private cachedPepList: Map<string, PepMatch> | null = null;
  private cacheExpiresAt: number | null = null;
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24h

  /**
   * Checks a list of CPFs against the PEP (Politically Exposed Persons) database.
   * Downloads and caches the PEP CSV from the CGU transparency portal.
   */
  async checkCpfs(cpfs: Array<{ cpf: string; name: string }>): Promise<PepMatch[]> {
    const matches: PepMatch[] = [];

    try {
      const pepMap = await this.loadPepData();
      if (!pepMap) {
        this.logger.warn('PEP data not available, skipping check');
        return [];
      }

      for (const person of cpfs) {
        const cleanCpf = person.cpf.replaceAll(/\D/g, '');
        const match = pepMap.get(cleanCpf);
        if (match) {
          matches.push(match);
        }
      }
    } catch (error) {
      this.logger.error(`PEP check failed: ${(error as Error).message}`);
    }

    return matches;
  }

  private async loadPepData(): Promise<Map<string, PepMatch> | null> {
    if (this.cachedPepList && this.cacheExpiresAt && Date.now() < this.cacheExpiresAt) {
      return this.cachedPepList;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug('Downloading PEP data from CGU...');
      const response = await fetch(this.pepDataUrl, {
        headers: { 'Accept': 'text/csv,application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`PEP download returned ${response.status}`);
        return null;
      }

      const text = await response.text();
      const pepMap = this.parsePepCsv(text);

      this.cachedPepList = pepMap;
      this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
      this.logger.log(`PEP data loaded: ${pepMap.size} entries cached for 24h`);

      return pepMap;
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`PEP data download failed: ${(error as Error).message}`);
      return this.cachedPepList ?? null;
    }
  }

  private parsePepCsv(text: string): Map<string, PepMatch> {
    const map = new Map<string, PepMatch>();
    const lines = text.split('\n');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const fields = line.split(';').map(f => f.replaceAll(/^"|"$/g, '').trim());
      if (fields.length >= 4) {
        const cpf = (fields[0] ?? '').replaceAll(/\D/g, '');
        if (cpf.length === 11) {
          map.set(cpf, {
            cpf,
            nome: fields[1] || '',
            funcao: fields[2] || '',
            orgao: fields[3] || '',
            dataInicio: fields[4] || null,
            dataFim: fields[5] || null,
          });
        }
      }
    }

    return map;
  }
}
