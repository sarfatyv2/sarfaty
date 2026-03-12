/**
 * Debug: extrai substrings nas posições do layout para validar o parse.
 * Uso: pnpm exec tsx apps/api/scripts/validate-cnab-positions.ts
 */

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const REM_PATH = join(ROOT, 'docs/teste/04031.rem');

function substr(line: string, start: number, end: number): string {
  return line.substring(start - 1, end);
}

const content = readFileSync(REM_PATH, 'utf-8');
const lines = content.split(/\r?\n/).filter((l) => l.length >= 2);

const header = lines[0]!;
const detail1 = lines[1]!;

console.log('=== HEADER (linha 1) - validações ===');
console.log('Pos 2-9 (REMESSA?):', JSON.stringify(substr(header, 2, 9)));
console.log('Pos 27-46 (cedentCode):', JSON.stringify(substr(header, 27, 46)));
console.log('Pos 47-76 (cedentName):', JSON.stringify(substr(header, 47, 76)));
console.log('Pos 77-79 (bankCode):', JSON.stringify(substr(header, 77, 79)));
console.log('Pos 95-100 (remittanceDate DDMMAA):', JSON.stringify(substr(header, 95, 100)));

console.log('\n=== DETALHE 1 - validações ===');
console.log('Pos 63-76 (documentNumber):', JSON.stringify(substr(detail1, 63, 76)));
console.log('Pos 108-110 (portfolioCode):', JSON.stringify(substr(detail1, 108, 110)));
console.log('Pos 111-120 (ourNumber):', JSON.stringify(substr(detail1, 111, 120)));
console.log('Pos 121-126 (dueDate DDMMAA):', JSON.stringify(substr(detail1, 121, 126)));
console.log('Pos 127-139 (faceValue centavos):', JSON.stringify(substr(detail1, 127, 139)));
console.log('Pos 151-156 (issueDate DDMMAA):', JSON.stringify(substr(detail1, 151, 156)));
console.log('Pos 219-220 (draweeDocType):', JSON.stringify(substr(detail1, 219, 220)));
console.log('Pos 221-234 (draweeDoc/CNPJ):', JSON.stringify(substr(detail1, 221, 234)));
console.log('Pos 235-274 (draweeName):', JSON.stringify(substr(detail1, 235, 274)));
console.log('Pos 275-314 (draweeAddress):', JSON.stringify(substr(detail1, 275, 314)));
console.log('Pos 327-334 (draweeZip):', JSON.stringify(substr(detail1, 327, 334)));
console.log('Pos 335-349 (draweeCity):', JSON.stringify(substr(detail1, 335, 349)));
console.log('Pos 350-351 (draweeState):', JSON.stringify(substr(detail1, 350, 351)));
