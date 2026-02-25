/**
 * Script de teste manual para o pipeline de extração de Faturamento.
 *
 * Lê todos os arquivos suportados de `docs/faturamentos/`, envia ao Gemini e
 * imprime um resumo no terminal, salvando os JSONs completos em `scripts/results/`.
 *
 * Tipos de arquivo suportados: .pdf, .jpg, .jpeg, .png, .webp
 *
 * Uso:
 *   pnpm test:faturamento
 *
 * Flags opcionais:
 *   --file "nome do arquivo.pdf"   processa apenas um arquivo específico
 *   --model gemini-2.0-flash       usa um modelo diferente do padrão
 */

import 'reflect-metadata';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { config as loadDotenv } from 'dotenv';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) loadDotenv({ path: envPath });

import { FaturamentoGeminiService } from '../src/modules/clients/infra/gemini/faturamento-gemini.service';
import { FaturamentoValidatorService } from '../src/modules/clients/infra/faturamento-validator.service';
import type { FaturamentoRawExtraction } from '@nexus/validators';

const WORKSPACE_ROOT = resolve(__dirname, '../../../');
const DOCS_DIR = join(WORKSPACE_ROOT, 'docs', 'faturamentos');
const RESULTS_DIR = join(__dirname, 'results');

const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

const MIME_TYPES: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
};

const args = process.argv.slice(2);
const fileFlag = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const modelOverride = args.includes('--model') ? args[args.indexOf('--model') + 1] : null;

interface ExtractionRecord {
  cnpj: string | null;
  companyName: string | null;
  year: number | null;
  totalAnnualRevenue: number | null;
  monthsPresent: number;
  confidence: string;
  warnings: string[];
}

interface FileResult {
  file: string;
  records: ExtractionRecord[];
  durationMs: number;
  error: string | null;
}

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 10_000;

function pad(str: string, length: number): string {
  return str.slice(0, length).padEnd(length);
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('"code":503') || msg.includes('"code":429') || msg.includes('fetch failed');
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === MAX_RETRIES || !isRetryable(err)) throw err;
      const waitMs = RETRY_BASE_MS * attempt;
      process.stdout.write(`\n    [tentativa ${attempt}/${MAX_RETRIES - 1} — aguardando ${waitMs / 1000}s] `);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw new Error(`${label}: max retries exceeded`);
}

async function processFile(
  filePath: string,
  gemini: FaturamentoGeminiService,
  validator: FaturamentoValidatorService,
): Promise<{ result: FileResult; extractions: FaturamentoRawExtraction[] }> {
  const fileName = basename(filePath);
  const ext = extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] ?? 'application/pdf';
  const start = Date.now();

  try {
    const fileBuffer = readFileSync(filePath);

    const extractions = await withRetry(
      () => gemini.extract(fileBuffer, mimeType),
      fileName,
    );

    const records: ExtractionRecord[] = extractions.map((extraction) => {
      const validationResult = validator.validate(extraction);
      const monthsPresent = extraction.monthlyRevenues
        ? Object.values(extraction.monthlyRevenues).filter((v) => v !== null).length
        : 0;
      return {
        cnpj: extraction.cnpj ?? null,
        companyName: extraction.companyName ?? null,
        year: extraction.year ?? null,
        totalAnnualRevenue: extraction.totalAnnualRevenue ?? null,
        monthsPresent,
        confidence: extraction.confidence,
        warnings: validationResult.warnings,
      };
    });

    return {
      result: { file: fileName, records, durationMs: Date.now() - start, error: null },
      extractions,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`\n  [DETALHE ERRO] ${fileName}:\n  ${errorMessage}\n`);
    return {
      result: { file: fileName, records: [], durationMs: Date.now() - start, error: errorMessage },
      extractions: [],
    };
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('\n❌  GEMINI_API_KEY não definida. Exporte antes de rodar o script.\n');
    process.exit(1);
  }

  if (!existsSync(DOCS_DIR)) {
    console.error(`\n❌  Diretório não encontrado: ${DOCS_DIR}\n`);
    process.exit(1);
  }

  mkdirSync(RESULTS_DIR, { recursive: true });

  let files = readdirSync(DOCS_DIR)
    .filter((f) => SUPPORTED_EXTENSIONS.has(extname(f).toLowerCase()))
    .map((f) => join(DOCS_DIR, f));

  if (fileFlag) {
    files = files.filter((f) => basename(f) === fileFlag);
    if (files.length === 0) {
      console.error(`\n❌  Arquivo "${fileFlag}" não encontrado em ${DOCS_DIR}\n`);
      process.exit(1);
    }
  }

  if (files.length === 0) {
    console.error(`\n❌  Nenhum arquivo suportado encontrado em ${DOCS_DIR}\n`);
    console.error(`    Tipos aceitos: ${[...SUPPORTED_EXTENSIONS].join(', ')}\n`);
    process.exit(1);
  }

  const modelLabel = modelOverride ?? 'gemini-2.5-pro (padrão)';

  console.log(`\n${'═'.repeat(90)}`);
  console.log(`  Faturamento Extraction — Teste Manual`);
  console.log(`  Arquivos encontrados : ${files.length}`);
  console.log(`  Modelo               : ${modelLabel}`);
  console.log(`  Diretório            : ${DOCS_DIR}`);
  console.log(`${'═'.repeat(90)}\n`);

  const gemini = new FaturamentoGeminiService(modelOverride ?? undefined);
  const validator = new FaturamentoValidatorService();

  const allResults: FileResult[] = [];

  for (const [index, filePath] of files.entries()) {
    const fileName = basename(filePath);
    process.stdout.write(`[${index + 1}/${files.length}] ${fileName} ... `);

    const { result, extractions } = await processFile(filePath, gemini, validator);
    allResults.push(result);

    if (result.error) {
      process.stdout.write(`ERRO\n`);
    } else {
      const label = extractions.length > 1 ? `${extractions.length} registros` : 'OK';
      process.stdout.write(`${label} (${result.durationMs}ms)\n`);
    }

    if (extractions.length > 0) {
      const safeName = basename(filePath).replace(/\.[^.]+$/, '');
      const content = extractions.length === 1 ? extractions[0] : extractions;
      writeFileSync(
        join(RESULTS_DIR, `Faturamento ${safeName}.json`),
        JSON.stringify(content, null, 2),
        'utf-8',
      );
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(90)}`);
  console.log(
    `  ${pad('ARQUIVO', 32)} ${pad('CNPJ', 16)} ${pad('ANO', 4)} ${pad('MESES', 5)} ${pad('TOTAL', 22)} CONF.`,
  );
  console.log(`${'─'.repeat(90)}`);

  let totalRecords = 0;
  let totalErrors = 0;
  let totalLowConf = 0;
  let totalIncomplete = 0;

  for (const fileResult of allResults) {
    if (fileResult.error) {
      totalErrors++;
      console.log(`  ${pad(fileResult.file, 32)} ERRO: ${fileResult.error.slice(0, 52)}`);
      continue;
    }

    if (fileResult.records.length === 0) {
      totalErrors++;
      console.log(`  ${pad(fileResult.file, 32)} sem dados`);
      continue;
    }

    const multiYear = fileResult.records.length > 1;

    for (const [recIdx, rec] of fileResult.records.entries()) {
      totalRecords++;
      if (rec.confidence === 'low') totalLowConf++;
      if (rec.monthsPresent > 0 && rec.monthsPresent < 12) totalIncomplete++;

      const fileLabel = recIdx === 0
        ? pad(fileResult.file + (multiYear ? ` [${fileResult.records.length}x]` : ''), 32)
        : pad(`  └─ ano ${rec.year ?? '?'}`, 32);

      const durationLabel = recIdx === 0 ? `  ${fileResult.durationMs}ms` : '';

      const line = [
        `  ${fileLabel}`,
        pad(formatCnpj(rec.cnpj), 16),
        pad(String(rec.year ?? '—'), 4),
        pad(`${rec.monthsPresent}/12`, 5),
        pad(formatCurrency(rec.totalAnnualRevenue), 22),
        rec.confidence,
        durationLabel,
      ].join(' ');

      console.log(line);

      if (recIdx === 0 && rec.companyName) {
        console.log(`    →  ${rec.companyName}`);
      }
      if (rec.warnings.length > 0) {
        console.log(`    ⚠  ${rec.warnings.join(' · ')}`);
      }
    }
  }

  console.log(`${'─'.repeat(90)}`);
  console.log(`\n  Arquivos: ${allResults.length} | Registros: ${totalRecords} | Erros: ${totalErrors} | Confiança baixa: ${totalLowConf} | Meses incompletos: ${totalIncomplete}`);
  console.log(`\n  JSONs completos salvos em: ${RESULTS_DIR}`);
  console.log(`\n${'═'.repeat(90)}\n`);

  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
