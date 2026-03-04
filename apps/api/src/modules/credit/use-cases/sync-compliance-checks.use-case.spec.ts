import { SyncComplianceChecksUseCase } from './sync-compliance-checks.use-case';

const CLIENT_ID = 'client-123';
const CNPJ = '12345678000190';

function createMocks() {
  const cguAdapter = { checkAll: vi.fn() };
  const pepAdapter = { checkCpfs: vi.fn() };
  const pgfnAdapter = { queryByCnpj: vi.fn() };
  const cndtAdapter = { queryByCnpj: vi.fn() };
  const viacepAdapter = { queryCep: vi.fn() };
  const sanctionsAdapter = { screenEntity: vi.fn() };
  const slaveLaborAdapter = { checkByCnpj: vi.fn() };
  const negativeMediaAdapter = { search: vi.fn() };
  const digitalPresenceAdapter = { check: vi.fn() };

  const cguRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const pepRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const pgfnRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const cndtRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const addressRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const sanctionsRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const slaveLaborRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const negativeMediaRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };
  const digitalPresenceRepo = { save: vi.fn(), getLatestByClientId: vi.fn() };

  const useCase = new SyncComplianceChecksUseCase(
    cguAdapter as any,
    pepAdapter as any,
    pgfnAdapter as any,
    cndtAdapter as any,
    viacepAdapter as any,
    sanctionsAdapter as any,
    slaveLaborAdapter as any,
    negativeMediaAdapter as any,
    digitalPresenceAdapter as any,
    cguRepo as any,
    pepRepo as any,
    pgfnRepo as any,
    cndtRepo as any,
    addressRepo as any,
    sanctionsRepo as any,
    slaveLaborRepo as any,
    negativeMediaRepo as any,
    digitalPresenceRepo as any,
  );

  return {
    useCase,
    adapters: { cguAdapter, pepAdapter, pgfnAdapter, cndtAdapter, viacepAdapter, sanctionsAdapter, slaveLaborAdapter, negativeMediaAdapter, digitalPresenceAdapter },
    repos: { cguRepo, pepRepo, pgfnRepo, cndtRepo, addressRepo, sanctionsRepo, slaveLaborRepo, negativeMediaRepo, digitalPresenceRepo },
  };
}

function stubAdaptersWithDefaults(adapters: ReturnType<typeof createMocks>['adapters']) {
  adapters.cguAdapter.checkAll.mockResolvedValue({ ceis: [], cnep: [], cepim: [] });
  adapters.pgfnAdapter.queryByCnpj.mockResolvedValue({ found: false, totalDebtAmount: null, debtCount: 0, rawEntries: [] });
  adapters.cndtAdapter.queryByCnpj.mockResolvedValue({ status: 'NEGATIVE', certificateNumber: 'CND-001', validUntil: '01/01/2027', reason: null, rawHtml: '' });
  adapters.slaveLaborAdapter.checkByCnpj.mockResolvedValue(null);
  adapters.viacepAdapter.queryCep.mockResolvedValue({ logradouro: 'Rua A', bairro: 'Centro', localidade: 'São Paulo', uf: 'SP' });
  adapters.pepAdapter.checkCpfs.mockResolvedValue([]);
  adapters.sanctionsAdapter.screenEntity.mockResolvedValue([]);
  adapters.negativeMediaAdapter.search.mockResolvedValue({
    riskLevel: 'CLEAR', findings: [], findingsCount: 0, summary: '', groundingSources: [], rawResponse: {},
  });
  adapters.digitalPresenceAdapter.check.mockResolvedValue({
    domain: 'empresa.com.br', emailType: 'corporate', hasDns: true, hasActiveSite: true, siteTitle: 'Test', rawData: {},
  });
}

describe('SyncComplianceChecksUseCase', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    stubAdaptersWithDefaults(mocks.adapters);
  });

  it('should call CGU, PGFN, CNDT, and slave-labor adapters when CNPJ is provided', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(adapters.cguAdapter.checkAll).toHaveBeenCalledWith(CNPJ);
    expect(adapters.pgfnAdapter.queryByCnpj).toHaveBeenCalledWith(CNPJ);
    expect(adapters.cndtAdapter.queryByCnpj).toHaveBeenCalledWith(CNPJ);
    expect(adapters.slaveLaborAdapter.checkByCnpj).toHaveBeenCalledWith(CNPJ);
  });

  it('should NOT call CGU/PGFN/CNDT/slave-labor when CNPJ is missing', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID });

    expect(adapters.cguAdapter.checkAll).not.toHaveBeenCalled();
    expect(adapters.pgfnAdapter.queryByCnpj).not.toHaveBeenCalled();
    expect(adapters.cndtAdapter.queryByCnpj).not.toHaveBeenCalled();
    expect(adapters.slaveLaborAdapter.checkByCnpj).not.toHaveBeenCalled();
  });

  it('should call ViaCEP adapter when CEP is provided', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cep: '01001000' });

    expect(adapters.viacepAdapter.queryCep).toHaveBeenCalledWith('01001000');
  });

  it('should NOT call ViaCEP when CEP is missing', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID });

    expect(adapters.viacepAdapter.queryCep).not.toHaveBeenCalled();
  });

  it('should call PEP adapter when authorizedPersons are provided', async () => {
    const { useCase, adapters } = mocks;
    const persons = [{ cpf: '111.222.333-44', name: 'John Doe' }];

    await useCase.execute({ clientId: CLIENT_ID, authorizedPersons: persons });

    expect(adapters.pepAdapter.checkCpfs).toHaveBeenCalledWith(persons);
  });

  it('should NOT call PEP when authorizedPersons is empty', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, authorizedPersons: [] });

    expect(adapters.pepAdapter.checkCpfs).not.toHaveBeenCalled();
  });

  it('should call sanctions adapter when companyName is provided', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, companyName: 'Acme Corp', tradeName: 'Acme', cnpj: CNPJ });

    expect(adapters.sanctionsAdapter.screenEntity).toHaveBeenCalledWith('Acme Corp', 'Acme');
  });

  it('should save 3 CGU records (CEIS, CNEP, CEPIM) when CGU returns data', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.cguAdapter.checkAll.mockResolvedValue({
      ceis: [{ id: 1, name: 'match' }],
      cnep: [],
      cepim: [{ id: 2 }, { id: 3 }],
    });

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(repos.cguRepo.save).toHaveBeenCalledTimes(3);

    const savedEntities = repos.cguRepo.save.mock.calls.map((c: any) => c[0]);
    const ceisEntity = savedEntities.find((e: any) => e.checkType === 'CEIS');
    const cnepEntity = savedEntities.find((e: any) => e.checkType === 'CNEP');
    const cepimEntity = savedEntities.find((e: any) => e.checkType === 'CEPIM');

    expect(ceisEntity.hasMatch).toBe(true);
    expect(ceisEntity.matchCount).toBe(1);
    expect(cnepEntity.hasMatch).toBe(false);
    expect(cnepEntity.matchCount).toBe(0);
    expect(cepimEntity.hasMatch).toBe(true);
    expect(cepimEntity.matchCount).toBe(2);
  });

  it('should save PEP records per person', async () => {
    const { useCase, adapters, repos } = mocks;
    const persons = [
      { cpf: '11122233344', name: 'Alice' },
      { cpf: '55566677788', name: 'Bob' },
    ];
    adapters.pepAdapter.checkCpfs.mockResolvedValue([
      { cpf: '11122233344', funcao: 'Deputado', orgao: 'Câmara' },
    ]);

    await useCase.execute({ clientId: CLIENT_ID, authorizedPersons: persons });

    expect(repos.pepRepo.save).toHaveBeenCalledTimes(2);

    const savedEntities = repos.pepRepo.save.mock.calls.map((c: any) => c[0]);
    const alice = savedEntities.find((e: any) => e.cpf === '11122233344');
    const bob = savedEntities.find((e: any) => e.cpf === '55566677788');

    expect(alice.hasMatch).toBe(true);
    expect(alice.matchedRole).toBe('Deputado');
    expect(bob.hasMatch).toBe(false);
    expect(bob.matchedRole).toBeNull();
  });

  it('should save PGFN result to repository', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.pgfnAdapter.queryByCnpj.mockResolvedValue({
      found: true,
      totalDebtAmount: 50000,
      debtCount: 3,
      rawEntries: [{ id: 1 }],
    });

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(repos.pgfnRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.pgfnRepo.save.mock.calls[0][0];
    expect(saved.hasDebt).toBe(true);
    expect(saved.totalDebtAmount).toBe(50000);
    expect(saved.debtCount).toBe(3);
  });

  it('should save CNDT result to repository', async () => {
    const { useCase, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(repos.cndtRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.cndtRepo.save.mock.calls[0][0];
    expect(saved.certificateStatus).toBe('NEGATIVE');
    expect(saved.certificateNumber).toBe('CND-001');
  });

  it('should save address validation result to repository', async () => {
    const { useCase, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cep: '01001000', registeredCity: 'São Paulo', registeredState: 'SP' });

    expect(repos.addressRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.addressRepo.save.mock.calls[0][0];
    expect(saved.isValid).toBe(true);
    expect(saved.city).toBe('São Paulo');
    expect(saved.matchesRegistered).toBe(true);
  });

  it('should save sanctions result (no match) to repository', async () => {
    const { useCase, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, companyName: 'Acme Corp' });

    expect(repos.sanctionsRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.sanctionsRepo.save.mock.calls[0][0];
    expect(saved.hasMatch).toBe(false);
    expect(saved.entityName).toBe('Acme Corp');
  });

  it('should save slave labor result to repository', async () => {
    const { useCase, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(repos.slaveLaborRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.slaveLaborRepo.save.mock.calls[0][0];
    expect(saved.hasMatch).toBe(false);
  });

  it('should handle adapter failure gracefully — other adapters still run', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.cguAdapter.checkAll.mockRejectedValue(new Error('CGU down'));

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    expect(repos.cguRepo.save).not.toHaveBeenCalled();
    expect(repos.pgfnRepo.save).toHaveBeenCalledTimes(1);
    expect(repos.cndtRepo.save).toHaveBeenCalledTimes(1);
    expect(repos.slaveLaborRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should save CNDT UNAVAILABLE status as-is when portal has captcha', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.cndtAdapter.queryByCnpj.mockResolvedValue({
      status: 'UNAVAILABLE',
      certificateNumber: null,
      validUntil: null,
      reason: 'Portal requer CAPTCHA — verificação manual necessária',
      rawHtml: '',
    });

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ });

    const saved = repos.cndtRepo.save.mock.calls[0][0];
    expect(saved.certificateStatus).toBe('UNAVAILABLE');
  });

  it('should save multiple sanctions matches when adapter returns matches', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.sanctionsAdapter.screenEntity.mockResolvedValue([
      { entitySearched: 'Acme Corp', source: 'OFAC', matchedName: 'ACME', score: 0.95, rawRecord: { id: 1 } },
      { entitySearched: 'Acme Corp', source: 'UN', matchedName: 'ACME CORP', score: 0.88, rawRecord: { id: 2 } },
    ]);

    await useCase.execute({ clientId: CLIENT_ID, companyName: 'Acme Corp', cnpj: CNPJ });

    expect(repos.sanctionsRepo.save).toHaveBeenCalledTimes(2);
    const first = repos.sanctionsRepo.save.mock.calls[0][0];
    expect(first.hasMatch).toBe(true);
    expect(first.matchScore).toBe(0.95);
  });

  it('should call negative media adapter when companyName and CNPJ are provided', async () => {
    const { useCase, adapters, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ, companyName: 'Acme Corp', tradeName: 'Acme' });

    expect(adapters.negativeMediaAdapter.search).toHaveBeenCalledWith('Acme Corp', CNPJ, 'Acme');
    expect(repos.negativeMediaRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.negativeMediaRepo.save.mock.calls[0][0];
    expect(saved.riskLevel).toBe('CLEAR');
    expect(saved.clientId).toBe(CLIENT_ID);
  });

  it('should NOT call negative media adapter when companyName or CNPJ is missing', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, companyName: 'Acme Corp' });

    expect(adapters.negativeMediaAdapter.search).not.toHaveBeenCalled();
  });

  it('should call digital presence adapter when email is provided', async () => {
    const { useCase, adapters, repos } = mocks;

    await useCase.execute({ clientId: CLIENT_ID, email: 'test@empresa.com.br' });

    expect(adapters.digitalPresenceAdapter.check).toHaveBeenCalledWith('test@empresa.com.br');
    expect(repos.digitalPresenceRepo.save).toHaveBeenCalledTimes(1);
    const saved = repos.digitalPresenceRepo.save.mock.calls[0][0];
    expect(saved.emailType).toBe('corporate');
    expect(saved.domain).toBe('empresa.com.br');
  });

  it('should NOT call digital presence adapter when email is missing', async () => {
    const { useCase, adapters } = mocks;

    await useCase.execute({ clientId: CLIENT_ID });

    expect(adapters.digitalPresenceAdapter.check).not.toHaveBeenCalled();
  });

  it('should handle negative media adapter failure gracefully', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.negativeMediaAdapter.search.mockRejectedValue(new Error('Gemini API down'));

    await useCase.execute({ clientId: CLIENT_ID, cnpj: CNPJ, companyName: 'Acme Corp' });

    expect(repos.negativeMediaRepo.save).not.toHaveBeenCalled();
    expect(repos.cguRepo.save).toHaveBeenCalled();
  });

  it('should handle digital presence adapter failure gracefully', async () => {
    const { useCase, adapters, repos } = mocks;
    adapters.digitalPresenceAdapter.check.mockRejectedValue(new Error('DNS timeout'));

    await useCase.execute({ clientId: CLIENT_ID, email: 'test@empresa.com.br' });

    expect(repos.digitalPresenceRepo.save).not.toHaveBeenCalled();
  });
});
