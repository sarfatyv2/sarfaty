/**
 * Valida se o parse CNAB extrai dados corretamente do arquivo 04031.rem.
 * Uso: pnpm exec tsx apps/api/scripts/validate-cnab-parse.ts
 */

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BradescoParser } from '../src/modules/cnab/parser/bradesco.parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const REM_PATH = join(ROOT, 'docs/teste/04031.rem');

const content = readFileSync(REM_PATH, 'utf-8');
const parser = new BradescoParser();
const result = parser.parse(content);

console.log('=== HEADER (arquivo) ===');
console.log(JSON.stringify(result.header, null, 2));

console.log('\n=== TÍTULOS (details) ===');
for (let i = 0; i < result.details.length; i++) {
  const d = result.details[i]!;
  console.log(`\n--- Título ${i + 1} ---`);
  console.log(`  Sacado: ${d.draweeName} (${d.draweeDocType}: ${d.draweeDoc})`);
  console.log(`  Endereço: ${d.draweeAddress} - ${d.draweeZip} ${d.draweeCity}/${d.draweeState}`);
  console.log(`  Nosso número: ${d.ourNumber} | Doc: ${d.documentNumber}`);
  console.log(`  Vencimento: ${d.dueDate} | Valor: R$ ${Number(d.faceValue ?? 0).toFixed(2)}`);
  console.log(`  Emissão: ${d.issueDate} | Carteira: ${d.portfolioCode}`);
}

if (result.errors.length > 0) {
  console.log('\n=== ERROS DE PARSE ===');
  console.log(JSON.stringify(result.errors, null, 2));
}

console.log(`\nTotal: ${result.details.length} títulos, ${result.errors.length} erros`);
