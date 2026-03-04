/**
 * Manual integration test — runs real adapters against live APIs.
 * Usage: npx tsx test/manual/test-compliance-real.ts
 */

import { CguAdapter } from '../../src/modules/credit/bureaus/cgu/cgu.adapter';
import { ViacepAdapter } from '../../src/modules/credit/bureaus/viacep/viacep.adapter';
import { PgfnAdapter } from '../../src/modules/credit/bureaus/pgfn/pgfn.adapter';
import { CndtAdapter } from '../../src/modules/credit/bureaus/cndt/cndt.adapter';
import { SanctionsAdapter } from '../../src/modules/credit/bureaus/sanctions/sanctions.adapter';
import { SlaveLaborAdapter } from '../../src/modules/credit/bureaus/slave-labor/slave-labor.adapter';

const CNPJ = '22295040000140';
const CEP = '01310100'; // Av Paulista, SP
const COMPANY_NAME = 'SARFATY';

function separator(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function runViacep() {
  separator('1. ViaCEP');
  const viacep = new ViacepAdapter();
  const result = await viacep.queryCep(CEP);
  console.log('Status:', result ? 'OK' : 'NOT FOUND');
  if (result) {
    console.log(`  Logradouro: ${result.logradouro}`);
    console.log(`  Bairro: ${result.bairro}`);
    console.log(`  Cidade: ${result.localidade} / ${result.uf}`);
  }
}

async function runPgfn() {
  separator('2. PGFN — Lista de Devedores');
  const pgfn = new PgfnAdapter();
  const result = await pgfn.queryByCnpj(CNPJ);
  console.log('Tem dívida?', result.found ? 'SIM' : 'NÃO');
  if (result.found) {
    console.log(`  Total: R$ ${result.totalDebtAmount}`);
    console.log(`  Quantidade: ${result.debtCount}`);
  }
}

async function runCndt() {
  separator('3. CNDT — Certidão de Débitos Trabalhistas');
  const cndt = new CndtAdapter();
  const result = await cndt.queryByCnpj(CNPJ);
  console.log('Status:', result.status);
  if (result.reason) console.log(`  Motivo: ${result.reason}`);
  if (result.certificateNumber) console.log(`  Certidão nº: ${result.certificateNumber}`);
  if (result.validUntil) console.log(`  Validade: ${result.validUntil}`);
  console.log(`  HTML size: ${result.rawHtml.length} chars`);
}

async function runCgu() {
  separator('4. CGU — CEIS / CNEP / CEPIM');
  const cgu = new CguAdapter();
  const result = await cgu.checkAll(CNPJ);
  console.log(`  CEIS: ${result.ceis.length} registro(s)`);
  console.log(`  CNEP: ${result.cnep.length} registro(s)`);
  console.log(`  CEPIM: ${result.cepim.length} registro(s)`);
  if (result.ceis.length > 0) console.log('  CEIS data:', JSON.stringify(result.ceis[0], null, 2));
}

async function runSanctions() {
  separator('5. Sanctions — OFAC SDN');
  const sanctions = new SanctionsAdapter();
  const result = await sanctions.screenEntity(COMPANY_NAME);
  console.log(`Matches: ${result.length}`);
  if (result.length > 0) {
    for (const m of result) {
      console.log(`  ${m.matchedName} (score: ${m.score.toFixed(2)}, source: ${m.source})`);
    }
  } else {
    console.log('  Nenhum match encontrado (limpo)');
  }
}

async function runSlaveLaborCheck() {
  separator('6. Lista de Trabalho Escravo');
  const slave = new SlaveLaborAdapter();
  const result = await slave.checkByCnpj(CNPJ);
  if (result) {
    console.log('MATCH ENCONTRADO!');
    console.log(`  Empregador: ${result.employerName}`);
    console.log(`  Trabalhadores resgatados: ${result.rescuedWorkers}`);
  } else {
    console.log('  Nenhum registro (limpo)');
  }
}

const checks = [runViacep, runPgfn, runCndt, runCgu, runSanctions, runSlaveLaborCheck];

console.log(`\nTestando compliance checks com CNPJ: ${CNPJ}\n`);

for (const check of checks) {
  try {
    await check();
  } catch (e) {
    console.error('ERRO:', (e as Error).message);
  }
}

separator('RESUMO');
console.log('Teste concluído!\n');
