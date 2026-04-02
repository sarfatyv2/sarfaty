import { FlashAdapter, normalizeBrazilianDocumentDigits } from './flash.adapter';
import { Collaborator } from '../../domain/collaborator.entity';

vi.mock('../../../../config/env', () => ({
  env: {
    FLASH_API_KEY: 'test-flash-key',
    FLASH_BASE_URL: 'https://api.flashapp.services',
    FLASH_COMPANY_ID_MAP: { Sarfaty: 'company-flash-1' },
  },
}));

describe('normalizeBrazilianDocumentDigits', () => {
  it('strips non-digit characters', () => {
    expect(normalizeBrazilianDocumentDigits('123.456.789-00')).toBe('12345678900');
  });
});

describe('FlashAdapter', () => {
  let adapter: FlashAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new FlashAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('listEmployees', () => {
    it('GETs /core/v1/employees with x-flash-auth and query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              records: [{ id: 'e1', companyId: 'c1', documentNumber: '12345678900' }],
              metadata: { total: 1, page: 1, limit: 50 },
            }),
          ),
      });

      const result = await adapter.listEmployees({
        page: 1,
        limit: 50,
        companyId: 'c1',
        documentNumbers: '12345678900',
      });

      expect(result.records).toHaveLength(1);
      expect(result.records[0]?.id).toBe('e1');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/core/v1/employees');
      expect(url).toContain('page=1');
      expect(url).toContain('documentNumbers=12345678900');
      expect(init.headers).toMatchObject({
        'x-flash-auth': 'test-flash-key',
      });
    });
  });

  describe('createEmployee', () => {
    it('POSTs body to /core/v1/employees', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              id: 'new-id',
              companyId: 'company-flash-1',
              groups: [],
            }),
          ),
      });

      const result = await adapter.createEmployee({
        companyId: 'company-flash-1',
        documentNumber: '12345678900',
        name: 'Jane Doe',
        externalId: 'uuid-collab',
      });

      expect(result.id).toBe('new-id');
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/core/v1/employees');
      expect(init.method).toBe('POST');
      const body = JSON.parse(init.body as string);
      expect(body.name).toBe('Jane Doe');
    });
  });

  describe('patchCollaboratorFromDomain', () => {
    it('PATCHes collaborator when flashEmployeeId is set', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              id: 'flash-emp-1',
              companyId: 'company-flash-1',
              groups: [],
            }),
          ),
      });

      const collab = Collaborator.reconstitute({
        id: 'collab-1',
        profileId: null,
        flashEmployeeId: 'flash-emp-1',
        isActive: true,
        registrationNumber: null,
        badgeNumber: null,
        employmentType: 'clt',
        isInternal: true,
        fullName: 'Jane Doe',
        socialName: null,
        dateOfBirth: null,
        gender: null,
        maritalStatus: null,
        nationality: 'Brasileira',
        cpf: '12345678900',
        rg: null,
        rgIssuer: null,
        voterRegistration: null,
        voterZone: null,
        voterSection: null,
        militaryCert: null,
        addressStreet: null,
        addressNumber: null,
        addressComplement: null,
        addressNeighborhood: null,
        addressCity: null,
        addressState: null,
        addressZip: null,
        phone: '11999999999',
        personalEmail: null,
        corporateEmail: 'jane@sarfaty.com',
        extension: null,
        company: 'Sarfaty',
        directorate: null,
        department: null,
        branch: null,
        managerId: null,
        jobTitle: null,
        roleCode: null,
        roleLevel: null,
        startDateOriginal: null,
        startDateCurrent: null,
        registrationDate: '2024-01-15',
        terminationDate: null,
        terminationReason: null,
        hasMedicalAssistance: true,
        medicalPlanNotes: null,
        plrEligible: false,
        thirteenthPj: false,
        guaranteedBonus: null,
        commissionPct: null,
        bankName: null,
        bankBranch: null,
        bankAccount: null,
        bankAccountType: null,
        currentSalary: null,
        lastMovementDate: null,
        lastMovementType: null,
        notes: null,
        createdAt: null,
        updatedAt: null,
      });

      await adapter.patchCollaboratorFromDomain(collab, null);

      const patchCall = mockFetch.mock.calls.find(([, init]) => init.method === 'PATCH');
      expect(patchCall).toBeDefined();
      const [, init] = patchCall as [string, RequestInit];
      expect(init.method).toBe('PATCH');
      const body = JSON.parse(init.body as string);
      expect(body.name).toBe('Jane Doe');
      expect(body.externalId).toBe('collab-1');
    });
  });
});
