/**
 * Script de teste manual para o pipeline de extração IRPF.
 *
 * Lê todos os PDFs de `docs/teste irpf/`, classifica e envia ao Gemini,
 * imprime um resumo no terminal e salva os JSONs completos em `scripts/results/`.
 *
 * Uso:
 *   GEMINI_API_KEY=xxx pnpm dlx tsx apps/api/scripts/test-irpf-extraction.ts
 *
 * Flags opcionais:
 *   --file "nome do arquivo.pdf"   processa apenas um arquivo específico
 *   --no-gemini                    executa só o classificador (sem chamar a API)
 */

import 'reflect-metadata';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { config as loadDotenv } from 'dotenv';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) loadDotenv({ path: envPath });
import { IrpfClassifierService } from '../src/modules/clients/infra/irpf-classifier.service';
import type { IrpfGeminiService } from '../src/modules/clients/infra/gemini/irpf-gemini.service';
import type { IrpfRawExtraction } from '@nexus/validators';

const WORKSPACE_ROOT = resolve(__dirname, '../../../');
const PDF_DIR = join(WORKSPACE_ROOT, 'docs', 'teste irpf');
const RESULTS_DIR = join(__dirname, 'results');

const args = process.argv.slice(2);
const fileFlag = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const skipGemini = args.includes('--no-gemini');
const modelOverride = args.includes('--model') ? args[args.indexOf('--model') + 1] : null;

interface TestResult {
  file: string;
  classification: string;
  hasNativeText: boolean;
  cpf: string | null;
  fullName: string | null;
  exerciseYear: number | null;
  confidence: string | null;
  warnings: string[];
  durationMs: number;
  error: string | null;
}

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 10_000;

function pad(str: string, length: number): string {
  return str.slice(0, length).padEnd(length);
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
  classifier: IrpfClassifierService,
  gemini: IrpfGeminiService | null,
): Promise<{ result: TestResult; extraction: IrpfRawExtraction | null }> {
  const fileName = basename(filePath);
  const start = Date.now();
  let extraction: IrpfRawExtraction | null = null;

  try {
    const pdfBuffer = readFileSync(filePath);

    const classification = await classifier.classify(pdfBuffer);

    if (!gemini) {
      return {
        result: {
          file: fileName,
          classification: classification.type,
          hasNativeText: classification.hasNativeText,
          cpf: null,
          fullName: null,
          exerciseYear: null,
          confidence: null,
          warnings: ['--no-gemini: extração pulada'],
          durationMs: Date.now() - start,
          error: null,
        },
        extraction: null,
      };
    }

    extraction = await withRetry(
      () => gemini.extract(pdfBuffer, classification),
      fileName,
    );

    const warnings: string[] = [];
    if (!extraction.cpf) warnings.push('CPF ausente');
    if (!extraction.exerciseYear) warnings.push('Ano de exercício ausente');
    if (!extraction.fullName) warnings.push('Nome ausente');
    if (extraction.confidence === 'low') warnings.push('Confiança baixa — possível OCR');

    return {
      result: {
        file: fileName,
        classification: classification.type,
        hasNativeText: classification.hasNativeText,
        cpf: extraction.cpf ?? null,
        fullName: extraction.fullName ?? null,
        exerciseYear: extraction.exerciseYear ?? null,
        confidence: extraction.confidence ?? null,
        warnings,
        durationMs: Date.now() - start,
        error: null,
      },
      extraction,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`\n  [DETALHE ERRO] ${fileName}:\n  ${errorMessage}\n`);
    return {
      result: {
        file: fileName,
        classification: '—',
        hasNativeText: false,
        cpf: null,
        fullName: null,
        exerciseYear: null,
        confidence: null,
        warnings: [],
        durationMs: Date.now() - start,
        error: errorMessage,
      },
      extraction: null,
    };
  }
}

async function main() {
  if (!skipGemini && !process.env.GEMINI_API_KEY) {
    console.error('\n❌  GEMINI_API_KEY não definida. Use --no-gemini para testar só o classificador.\n');
    process.exit(1);
  }

  mkdirSync(RESULTS_DIR, { recursive: true });

  let files = readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => join(PDF_DIR, f));

  if (fileFlag) {
    files = files.filter((f) => basename(f) === fileFlag);
    if (files.length === 0) {
      console.error(`\n❌  Arquivo "${fileFlag}" não encontrado em ${PDF_DIR}\n`);
      process.exit(1);
    }
  }

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  IRPF Extraction — Teste Manual`);
  console.log(`  PDFs encontrados : ${files.length}`);
  console.log(`  Modelo           : ${skipGemini ? '—' : (modelOverride ?? 'gemini-3.1-pro-preview (padrão)')}`);
  console.log(`  Modo             : ${skipGemini ? 'Classificador apenas (--no-gemini)' : 'Classificador + Gemini'}`);
  console.log(`${'═'.repeat(80)}\n`);

  const classifier = new IrpfClassifierService();
  let gemini: IrpfGeminiService | null = null;
  if (!skipGemini) {
    const { IrpfGeminiService } = await import('../src/modules/clients/infra/gemini/irpf-gemini.service');
    gemini = new IrpfGeminiService(modelOverride ?? undefined);
  }

  const results: TestResult[] = [];

  for (const [index, filePath] of files.entries()) {
    const fileName = basename(filePath);
    process.stdout.write(`[${index + 1}/${files.length}] ${fileName} ... `);

    const { result, extraction } = await processFile(filePath, classifier, gemini);
    results.push(result);

    if (result.error) {
      process.stdout.write(`ERRO\n`);
    } else {
      process.stdout.write(`OK (${result.durationMs}ms)\n`);
    }

    if (extraction) {
      const safeName = fileName.replace('.pdf', '');
      writeFileSync(
        join(RESULTS_DIR, `${safeName}.json`),
        JSON.stringify(extraction, null, 2),
        'utf-8',
      );
    }
  }

  console.log(`\n${'─'.repeat(80)}`);
  console.log(
    `  ${pad('ARQUIVO', 42)} ${pad('TIPO', 12)} ${pad('CPF', 13)} ${pad('ANO', 4)} ${pad('CONF.', 6)} ms`,
  );
  console.log(`${'─'.repeat(80)}`);

  for (const r of results) {
    if (r.error) {
      console.log(`  ${pad(r.file, 42)} ERRO: ${r.error}`);
      continue;
    }

    const ocr = r.hasNativeText ? '' : ' [OCR]';
    const line = [
      `  ${pad(r.file, 42)}`,
      pad(`${r.classification}${ocr}`, 12),
      pad(r.cpf ?? '—', 13),
      pad(String(r.exerciseYear ?? '—'), 4),
      pad(r.confidence ?? '—', 6),
      String(r.durationMs),
    ].join(' ');

    console.log(line);

    if (r.warnings.length > 0) {
      console.log(`    ⚠  ${r.warnings.join(' · ')}`);
    }
  }

  console.log(`${'─'.repeat(80)}`);

  const errors = results.filter((r) => r.error);
  const lowConf = results.filter((r) => r.confidence === 'low');
  const ocrDocs = results.filter((r) => !r.hasNativeText);

  console.log(`\n  Total: ${results.length} | Erros: ${errors.length} | Confiança baixa: ${lowConf.length} | OCR: ${ocrDocs.length}`);

  if (!skipGemini) {
    console.log(`\n  JSONs completos salvos em: ${RESULTS_DIR}`);
  }

  console.log(`\n${'═'.repeat(80)}\n`);

  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
