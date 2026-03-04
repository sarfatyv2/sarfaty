import { GetComplianceResultsUseCase } from './get-compliance-results.use-case';
import { CguCheckResult } from '../domain/cgu-check-result.entity';
import { PepCheckResult } from '../domain/pep-check-result.entity';
import { PgfnCheckResult } from '../domain/pgfn-check-result.entity';
import { CndtCheckResult } from '../domain/cndt-check-result.entity';
import { AddressValidationResult } from '../domain/address-validation-result.entity';
import { SanctionsCheckResult } from '../domain/sanctions-check-result.entity';
import { SlaveLaborCheckResult } from '../domain/slave-labor-check-result.entity';
import { NegativeMediaResult } from '../domain/negative-media-result.entity';
import { DigitalPresenceResult } from '../domain/digital-presence-result.entity';

const CLIENT_ID = 'client-456';
const NOW = new Date('2025-06-15T12:00:00Z');

function createMockRepos() {
  return {
    cguRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue([]) },
    pepRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue([]) },
    pgfnRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null) },
    cndtRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null) },
    addressRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null) },
    sanctionsRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue([]) },
    slaveLaborRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null) },
    negativeMediaRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null), getAllByClientId: vi.fn().mockResolvedValue([]) },
    digitalPresenceRepo: { save: vi.fn(), getLatestByClientId: vi.fn().mockResolvedValue(null) },
  };
}

function buildUseCase(repos: ReturnType<typeof createMockRepos>) {
  return new GetComplianceResultsUseCase(
    repos.cguRepo as any,
    repos.pepRepo as any,
    repos.pgfnRepo as any,
    repos.cndtRepo as any,
    repos.addressRepo as any,
    repos.sanctionsRepo as any,
    repos.slaveLaborRepo as any,
    repos.negativeMediaRepo as any,
    repos.digitalPresenceRepo as any,
  );
}

function makeNegativeMediaResult(riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR', findingsCount = 0) {
  return NegativeMediaResult.reconstitute({
    id: 'nm-1',
    clientId: CLIENT_ID,
    cnpj: '12345678000190',
    companyName: 'Acme Corp',
    riskLevel,
    findingsCount,
    findings: findingsCount > 0 ? [{ category: 'fraude', title: 'Test' }] : [],
    summary: findingsCount > 0 ? 'Found issues' : null,
    groundingSources: [],
    rawResponse: null,
    queriedAt: NOW,
  });
}

function makeDigitalPresenceResult(emailType: 'corporate' | 'free' | 'unknown', hasActiveSite = true) {
  return DigitalPresenceResult.reconstitute({
    id: 'dp-1',
    clientId: CLIENT_ID,
    domain: 'empresa.com.br',
    emailType,
    hasDns: true,
    hasActiveSite,
    siteTitle: hasActiveSite ? 'Empresa LTDA' : null,
    rawData: null,
    queriedAt: NOW,
  });
}

function makeCguResult(checkType: 'CEIS' | 'CNEP' | 'CEPIM', hasMatch: boolean, matchCount = 0) {
  return CguCheckResult.reconstitute({
    id: `cgu-${checkType}`,
    clientId: CLIENT_ID,
    cnpj: '12345678000190',
    checkType,
    hasMatch,
    matchCount,
    summary: hasMatch ? `${matchCount} match(es)` : null,
    rawData: null,
    queriedAt: NOW,
  });
}

function makePepResult(cpf: string, hasMatch: boolean) {
  return PepCheckResult.reconstitute({
    id: `pep-${cpf}`,
    clientId: CLIENT_ID,
    cpf,
    personName: 'Test Person',
    hasMatch,
    matchedRole: hasMatch ? 'Deputado' : null,
    matchedOrg: hasMatch ? 'Câmara' : null,
    rawData: null,
    queriedAt: NOW,
  });
}

function makePgfnResult(hasDebt: boolean, totalDebtAmount: number | null = null, debtCount = 0) {
  return PgfnCheckResult.reconstitute({
    id: 'pgfn-1',
    clientId: CLIENT_ID,
    cnpj: '12345678000190',
    hasDebt,
    totalDebtAmount,
    debtCount,
    summary: hasDebt ? `${debtCount} debt(s)` : null,
    rawData: null,
    queriedAt: NOW,
  });
}

function makeCndtResult(certificateStatus: 'NEGATIVE' | 'POSITIVE' | 'POSITIVE_WITH_EFFECTS' | 'UNAVAILABLE' | 'UNKNOWN') {
  return CndtCheckResult.reconstitute({
    id: 'cndt-1',
    clientId: CLIENT_ID,
    cnpj: '12345678000190',
    certificateStatus,
    certificateNumber: certificateStatus === 'UNAVAILABLE' || certificateStatus === 'UNKNOWN' ? null : 'CND-001',
    validUntil: certificateStatus === 'UNAVAILABLE' || certificateStatus === 'UNKNOWN' ? null : new Date('2027-01-01T00:00:00Z'),
    rawData: null,
    queriedAt: NOW,
  });
}

function makeAddressResult(matchesRegistered: boolean | null) {
  return AddressValidationResult.reconstitute({
    id: 'addr-1',
    clientId: CLIENT_ID,
    cep: '01001000',
    isValid: true,
    street: 'Rua A',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    matchesRegistered,
    rawData: null,
    queriedAt: NOW,
  });
}

function makeSanctionsResult(hasMatch: boolean) {
  return SanctionsCheckResult.reconstitute({
    id: 'sanc-1',
    clientId: CLIENT_ID,
    entityName: 'Acme Corp',
    documentSearched: '12345678000190',
    source: 'OFAC',
    hasMatch,
    matchScore: hasMatch ? 0.95 : null,
    matchDetails: hasMatch ? 'Match found' : null,
    rawData: null,
    queriedAt: NOW,
  });
}

function makeSlaveLaborResult(hasMatch: boolean) {
  return SlaveLaborCheckResult.reconstitute({
    id: 'slave-1',
    clientId: CLIENT_ID,
    cnpj: '12345678000190',
    hasMatch,
    employerName: hasMatch ? 'Bad Company' : null,
    rescuedWorkers: hasMatch ? 5 : null,
    inspectionDate: hasMatch ? new Date('2024-03-01T00:00:00Z') : null,
    rawData: null,
    queriedAt: NOW,
  });
}

describe('GetComplianceResultsUseCase', () => {
  let repos: ReturnType<typeof createMockRepos>;
  let useCase: GetComplianceResultsUseCase;

  beforeEach(() => {
    repos = createMockRepos();
    useCase = buildUseCase(repos);
  });

  it('should return PENDING risk when no data exists', async () => {
    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('PENDING');
    expect(result.pgfn).toBeNull();
    expect(result.cndt).toBeNull();
    expect(result.addressValidation).toBeNull();
    expect(result.slaveLaborCheck).toBeNull();
    expect(result.pep).toHaveLength(0);
    expect(result.sanctions).toHaveLength(0);
  });

  it('should return CLEAR when all checks are clean', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.addressRepo.getLatestByClientId.mockResolvedValue(makeAddressResult(true));
    repos.sanctionsRepo.getLatestByClientId.mockResolvedValue([makeSanctionsResult(false)]);
    repos.slaveLaborRepo.getLatestByClientId.mockResolvedValue(makeSlaveLaborResult(false));
    repos.pepRepo.getLatestByClientId.mockResolvedValue([makePepResult('11122233344', false)]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('CLEAR');
  });

  it('should return CRITICAL when CEIS has match', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', true, 1),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('CRITICAL');
  });

  it('should return CRITICAL when sanctions have match', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.sanctionsRepo.getLatestByClientId.mockResolvedValue([makeSanctionsResult(true)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('CRITICAL');
  });

  it('should return CRITICAL when slave labor has match', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.slaveLaborRepo.getLatestByClientId.mockResolvedValue(makeSlaveLaborResult(true));
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('CRITICAL');
  });

  it('should return HIGH when PGFN has debt', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(true, 50000, 3));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('HIGH');
  });

  it('should return HIGH when PEP has match', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pepRepo.getLatestByClientId.mockResolvedValue([makePepResult('11122233344', true)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('HIGH');
  });

  it('should return MEDIUM when CNDT is POSITIVE_WITH_EFFECTS', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('POSITIVE_WITH_EFFECTS'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('MEDIUM');
  });

  it('should return MEDIUM when address does not match', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.addressRepo.getLatestByClientId.mockResolvedValue(makeAddressResult(false));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('MEDIUM');
  });

  it('should return LOW when CNDT is UNAVAILABLE but everything else is clear', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('UNAVAILABLE'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('LOW');
    expect(result.cndt?.certificateStatus).toBe('UNAVAILABLE');
  });

  it('should aggregate CGU results by checkType (CEIS, CNEP, CEPIM)', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', true, 2),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', true, 1),
    ]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.cgu.ceis.hasMatch).toBe(true);
    expect(result.cgu.ceis.matchCount).toBe(2);
    expect(result.cgu.cnep.hasMatch).toBe(false);
    expect(result.cgu.cnep.matchCount).toBe(0);
    expect(result.cgu.cepim.hasMatch).toBe(true);
    expect(result.cgu.cepim.matchCount).toBe(1);
  });

  it('should map dates to ISO strings', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([makeCguResult('CEIS', false)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.slaveLaborRepo.getLatestByClientId.mockResolvedValue(makeSlaveLaborResult(true));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.cgu.ceis.queriedAt).toBe(NOW.toISOString());
    expect(result.pgfn?.queriedAt).toBe(NOW.toISOString());
    expect(result.cndt?.queriedAt).toBe(NOW.toISOString());
    expect(result.cndt?.validUntil).toBe('2027-01-01T00:00:00.000Z');
    expect(result.slaveLaborCheck?.queriedAt).toBe(NOW.toISOString());
    expect(result.slaveLaborCheck?.inspectionDate).toBe('2024-03-01T00:00:00.000Z');
  });

  it('should return empty defaults for CGU check types not present', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([makeCguResult('CEIS', false)]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.cgu.cnep).toEqual({ hasMatch: false, matchCount: 0, summary: null, rawData: null, queriedAt: null });
    expect(result.cgu.cepim).toEqual({ hasMatch: false, matchCount: 0, summary: null, rawData: null, queriedAt: null });
  });

  it('should return negative media results as array when available', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([makeCguResult('CEIS', false)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.negativeMediaRepo.getAllByClientId.mockResolvedValue([makeNegativeMediaResult('CLEAR')]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.negativeMedia).toHaveLength(1);
    expect(result.negativeMedia[0]?.riskLevel).toBe('CLEAR');
    expect(result.negativeMedia[0]?.queriedAt).toBe(NOW.toISOString());
  });

  it('should return multiple negative media results ordered by date', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([makeCguResult('CEIS', false)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.negativeMediaRepo.getAllByClientId.mockResolvedValue([
      makeNegativeMediaResult('CLEAR'),
      makeNegativeMediaResult('HIGH', 2),
    ]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.negativeMedia).toHaveLength(2);
  });

  it('should return HIGH risk when most recent negative media has HIGH risk', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.negativeMediaRepo.getAllByClientId.mockResolvedValue([makeNegativeMediaResult('HIGH', 2)]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('HIGH');
  });

  it('should return MEDIUM risk when most recent negative media has MEDIUM risk', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([
      makeCguResult('CEIS', false),
      makeCguResult('CNEP', false),
      makeCguResult('CEPIM', false),
    ]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.negativeMediaRepo.getAllByClientId.mockResolvedValue([makeNegativeMediaResult('MEDIUM', 1)]);

    const result = await useCase.execute(CLIENT_ID);

    expect(result.overallRisk).toBe('MEDIUM');
  });

  it('should return digital presence results when available', async () => {
    repos.cguRepo.getLatestByClientId.mockResolvedValue([makeCguResult('CEIS', false)]);
    repos.pgfnRepo.getLatestByClientId.mockResolvedValue(makePgfnResult(false));
    repos.cndtRepo.getLatestByClientId.mockResolvedValue(makeCndtResult('NEGATIVE'));
    repos.digitalPresenceRepo.getLatestByClientId.mockResolvedValue(makeDigitalPresenceResult('corporate'));

    const result = await useCase.execute(CLIENT_ID);

    expect(result.digitalPresence).not.toBeNull();
    expect(result.digitalPresence?.emailType).toBe('corporate');
    expect(result.digitalPresence?.hasActiveSite).toBe(true);
    expect(result.digitalPresence?.domain).toBe('empresa.com.br');
  });

  it('should return empty negative media array and null digital presence when not available', async () => {
    const result = await useCase.execute(CLIENT_ID);

    expect(result.negativeMedia).toEqual([]);
    expect(result.digitalPresence).toBeNull();
  });
});
