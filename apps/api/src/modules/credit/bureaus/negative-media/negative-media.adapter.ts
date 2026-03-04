import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env';

export type MediaRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';
export type FindingCategory =
  | 'fraude'
  | 'golpe'
  | 'recuperacao_judicial'
  | 'trabalho_escravo'
  | 'multa_ambiental'
  | 'processo_criminal'
  | 'outro';

export interface MediaFinding {
  category: FindingCategory;
  title: string;
  snippet: string;
  sourceUrl: string | null;
  sourceName: string | null;
  date: string | null;
}

export interface NegativeMediaSearchResult {
  riskLevel: MediaRiskLevel;
  findings: MediaFinding[];
  findingsCount: number;
  summary: string;
  groundingSources: Array<{ uri: string; title: string }>;
  rawResponse: Record<string, unknown>;
}

@Injectable()
export class NegativeMediaAdapter {
  private readonly logger = new Logger(NegativeMediaAdapter.name);
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private readonly requestTimeoutMs = 45_000;

  async search(
    companyName: string,
    cnpj: string,
    tradeName?: string | null,
  ): Promise<NegativeMediaSearchResult> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured, skipping negative media check');
      return this.emptyResult();
    }

    const tradeNamePart = tradeName ? `, nome fantasia: "${tradeName}"` : '';
    const prompt = [
      `Pesquise na internet sobre a empresa "${companyName}" (CNPJ: ${cnpj}${tradeNamePart}).`,
      'Busque especificamente por notícias, reportagens ou menções envolvendo:',
      'fraude, golpe, falência, recuperação judicial, trabalho escravo,',
      'multas ambientais, processos criminais, escândalos, denúncias, lavagem de dinheiro.',
      '',
      'Retorne APENAS um JSON válido (sem markdown, sem code blocks) com esta estrutura:',
      '{',
      '  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "CLEAR",',
      '  "findings": [',
      '    {',
      '      "category": "fraude" | "golpe" | "recuperacao_judicial" | "trabalho_escravo" | "multa_ambiental" | "processo_criminal" | "outro",',
      '      "title": "título da notícia",',
      '      "snippet": "trecho curto relevante (máximo 200 caracteres)",',
      '      "sourceUrl": "URL da fonte",',
      '      "sourceName": "nome do veículo/site",',
      '      "date": "data aproximada (YYYY-MM-DD ou YYYY-MM ou YYYY)"',
      '    }',
      '  ],',
      '  "summary": "Resumo em 2-3 frases do cenário reputacional da empresa"',
      '}',
      '',
      'Regras:',
      '- Se não encontrar nada negativo, retorne riskLevel "CLEAR", findings vazio e summary dizendo que não foram encontradas menções negativas.',
      '- HIGH: fraude confirmada, processo criminal, trabalho escravo.',
      '- MEDIUM: recuperação judicial, multas ambientais, denúncias em apuração.',
      '- LOW: menções negativas antigas (>2 anos) ou de baixa relevância.',
      '- Máximo de 10 findings.',
    ].join('\n');

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.log(`Searching negative media for "${companyName}" (${cnpj})`);

      const response = await fetch(`${this.apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API returned ${response.status}: ${errorText}`);
        return this.emptyResult();
      }

      const data = (await response.json()) as Record<string, unknown>;
      return this.parseResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`Negative media search failed: ${(error as Error).message}`);
      return this.emptyResult();
    }
  }

  private parseResponse(data: Record<string, unknown>): NegativeMediaSearchResult {
    const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
    if (!candidates?.length) {
      this.logger.warn('Gemini returned no candidates');
      return this.emptyResult();
    }

    const candidate = candidates[0]!;
    const content = candidate.content as Record<string, unknown> | undefined;
    const parts = content?.parts as Array<Record<string, unknown>> | undefined;
    const textPart = parts?.find((p) => typeof p.text === 'string');
    const rawText = (textPart?.text as string) ?? '';

    const groundingMetadata = candidate.groundingMetadata as Record<string, unknown> | undefined;
    const groundingChunks = (groundingMetadata?.groundingChunks as Array<Record<string, unknown>>) ?? [];
    const groundingSources = groundingChunks
      .map((chunk) => {
        const web = chunk.web as Record<string, unknown> | undefined;
        return web ? { uri: (web.uri as string) ?? '', title: (web.title as string) ?? '' } : null;
      })
      .filter((s): s is { uri: string; title: string } => s !== null);

    const parsed = this.extractJson(rawText);
    if (!parsed) {
      this.logger.warn('Failed to parse JSON from Gemini response');
      return {
        ...this.emptyResult(),
        rawResponse: data,
        groundingSources,
        summary: rawText.slice(0, 500),
      };
    }

    const findings: MediaFinding[] = Array.isArray(parsed.findings)
      ? parsed.findings.slice(0, 10).map((f: Record<string, unknown>) => {
          const title = typeof f.title === 'string' ? f.title : '';
          const snippet = typeof f.snippet === 'string' ? f.snippet : '';
          const sourceUrl = typeof f.sourceUrl === 'string' ? f.sourceUrl : null;
          const sourceName = typeof f.sourceName === 'string' ? f.sourceName : null;
          const date = typeof f.date === 'string' ? f.date : null;
          return {
            category: this.validateCategory(f.category as string),
            title,
            snippet: snippet.slice(0, 300),
            sourceUrl,
            sourceName,
            date,
          };
        })
      : [];

    return {
      riskLevel: this.validateRiskLevel(parsed.riskLevel as string),
      findings,
      findingsCount: findings.length,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      groundingSources,
      rawResponse: data,
    };
  }

  private extractJson(text: string): Record<string, unknown> | null {
    const cleaned = text
      .replaceAll(/```json\s*/g, '')
      .replaceAll(/```\s*/g, '')
      .trim();

    try {
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      const jsonRegex = /\{[\s\S]*\}/;
      const match = jsonRegex.exec(cleaned);
      if (match) {
        try {
          return JSON.parse(match[0]) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private validateRiskLevel(level: string): MediaRiskLevel {
    const valid: MediaRiskLevel[] = ['HIGH', 'MEDIUM', 'LOW', 'CLEAR'];
    return valid.includes(level as MediaRiskLevel) ? (level as MediaRiskLevel) : 'CLEAR';
  }

  private validateCategory(category: string): FindingCategory {
    const valid: FindingCategory[] = [
      'fraude', 'golpe', 'recuperacao_judicial', 'trabalho_escravo',
      'multa_ambiental', 'processo_criminal', 'outro',
    ];
    return valid.includes(category as FindingCategory) ? (category as FindingCategory) : 'outro';
  }

  private emptyResult(): NegativeMediaSearchResult {
    return {
      riskLevel: 'CLEAR',
      findings: [],
      findingsCount: 0,
      summary: '',
      groundingSources: [],
      rawResponse: {},
    };
  }
}
