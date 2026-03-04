import { Injectable, Logger } from '@nestjs/common';

export interface SanctionEntry {
  name: string;
  source: 'OFAC' | 'UN' | 'EU' | 'OPENSANCTIONS';
  details: string;
  rawRecord: any;
}

export interface SanctionsMatch {
  entitySearched: string;
  source: 'OFAC' | 'UN' | 'EU' | 'OPENSANCTIONS';
  matchedName: string;
  score: number;
  details: string;
  rawRecord: any;
}

@Injectable()
export class SanctionsAdapter {
  private readonly logger = new Logger(SanctionsAdapter.name);
  private readonly ofacSdnUrl = 'https://www.treasury.gov/ofac/downloads/sdn.csv';
  private readonly requestTimeoutMs = 60_000;
  private cachedSdnList: SanctionEntry[] | null = null;
  private cacheExpiresAt: number | null = null;
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24h

  /**
   * Screens a company name against OFAC SDN list using fuzzy matching.
   */
  async screenEntity(companyName: string, tradeName?: string | null): Promise<SanctionsMatch[]> {
    const matches: SanctionsMatch[] = [];
    if (!companyName) return matches;

    try {
      const sdnList = await this.loadOfacSdn();
      if (!sdnList || sdnList.length === 0) {
        this.logger.warn('OFAC SDN data not available, skipping sanctions check');
        return [];
      }

      const namesToCheck = [companyName];
      if (tradeName) namesToCheck.push(tradeName);

      for (const nameToCheck of namesToCheck) {
        const normalizedSearch = this.normalize(nameToCheck);
        for (const entry of sdnList) {
          const normalizedEntry = this.normalize(entry.name);
          const score = this.similarityScore(normalizedSearch, normalizedEntry);
          if (score >= 0.85) {
            matches.push({
              entitySearched: nameToCheck,
              source: entry.source,
              matchedName: entry.name,
              score,
              details: entry.details,
              rawRecord: entry.rawRecord,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Sanctions screening failed: ${(error as Error).message}`);
    }

    return matches;
  }

  private async loadOfacSdn(): Promise<SanctionEntry[]> {
    if (this.cachedSdnList && this.cacheExpiresAt && Date.now() < this.cacheExpiresAt) {
      return this.cachedSdnList;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug('Downloading OFAC SDN list...');
      const response = await fetch(this.ofacSdnUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`OFAC SDN download returned ${response.status}`);
        return this.cachedSdnList ?? [];
      }

      const text = await response.text();
      const entries = this.parseSdnCsv(text);

      this.cachedSdnList = entries;
      this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
      this.logger.log(`OFAC SDN loaded: ${entries.length} entries cached for 24h`);

      return entries;
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`OFAC SDN download failed: ${(error as Error).message}`);
      return this.cachedSdnList ?? [];
    }
  }

  private parseSdnCsv(text: string): SanctionEntry[] {
    const entries: SanctionEntry[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const fields = line.split(',').map(f => f.replaceAll(/^"|"$/g, '').trim());
      if (fields.length >= 2 && fields[1]) {
        entries.push({
          name: fields[1],
          source: 'OFAC',
          details: fields[3] || '',
          rawRecord: { uid: fields[0], name: fields[1], type: fields[2], program: fields[3] },
        });
      }
    }

    return entries;
  }

  private normalize(str: string): string {
    return str.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').replaceAll(/[^a-z0-9 ]/g, '').trim();
  }

  private similarityScore(a: string, b: string): number {
    if (a === b) return 1;
    if (!a || !b) return 0;

    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 1;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, () => new Array<number>(a.length + 1).fill(0));

    for (let i = 0; i <= b.length; i++) matrix[i]![0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0]![j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i - 1] === a[j - 1] ? 0 : 1;
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j - 1]! + cost,
        );
      }
    }

    return matrix[b.length]![a.length]!;
  }
}
