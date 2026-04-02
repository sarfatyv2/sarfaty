import { describe, it, expect, vi } from 'vitest';
import { Collaborator, type CollaboratorProps } from '../domain/collaborator.entity';
import { SyncFlashCollaboratorsUseCase } from './sync-flash-collaborators.use-case';

vi.mock('../../../config/env', () => ({
  env: {
    FLASH_COMPANY_ID_MAP: {},
  },
}));

function createTestCollaborator(overrides: Partial<CollaboratorProps> = {}): Collaborator {
  return Collaborator.reconstitute({
    id: 'collab-1',
    profileId: null,
    flashEmployeeId: null,
    isActive: true,
    registrationNumber: null,
    badgeNumber: null,
    employmentType: 'clt',
    isInternal: true,
    fullName: 'Test User',
    socialName: null,
    dateOfBirth: null,
    gender: null,
    maritalStatus: null,
    nationality: 'Brasileira',
    cpf: '123.456.789-00',
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
    phone: null,
    personalEmail: null,
    corporateEmail: null,
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
    registrationDate: null,
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
    ...overrides,
  });
}

describe('SyncFlashCollaboratorsUseCase', () => {
  it('returns linked 0 when Flash is not configured', async () => {
    const flashAdapter = { isConfigured: () => false, listEmployees: vi.fn() };
    const repository = {
      findCollaboratorsWithCpfNotNull: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByProfileId: vi.fn(),
      findByCpfs: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new SyncFlashCollaboratorsUseCase(
      repository as never,
      flashAdapter as never,
    );

    const result = await useCase.execute();

    expect(result.linked).toBe(0);
    expect(repository.findCollaboratorsWithCpfNotNull).not.toHaveBeenCalled();
  });

  it('persists flash employee ids from Flash response', async () => {
    const collab = createTestCollaborator({ id: 'collab-1', flashEmployeeId: null });

    const flashAdapter = {
      isConfigured: () => true,
      listEmployees: vi.fn().mockResolvedValue({
        records: [
          { id: 'flash-99', companyId: 'c1', documentNumber: '12345678900' },
        ],
        metadata: { total: 1 },
      }),
    };

    const repository = {
      findCollaboratorsWithCpfNotNull: vi.fn().mockResolvedValue([collab]),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByProfileId: vi.fn(),
      findByCpfs: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn().mockImplementation((_id, data) =>
        Promise.resolve(createTestCollaborator({ ...collab.toPlainObject(), ...data })),
      ),
    };

    const useCase = new SyncFlashCollaboratorsUseCase(
      repository as never,
      flashAdapter as never,
    );

    const result = await useCase.execute();

    expect(result.linked).toBe(1);
    expect(repository.update).toHaveBeenCalledWith('collab-1', { flashEmployeeId: 'flash-99' });
    expect(flashAdapter.listEmployees).toHaveBeenCalled();
  });

  it('skips update when flash id already matches', async () => {
    const collab = createTestCollaborator({ id: 'collab-1', flashEmployeeId: 'flash-99' });

    const flashAdapter = {
      isConfigured: () => true,
      listEmployees: vi.fn().mockResolvedValue({
        records: [{ id: 'flash-99', companyId: 'c1', documentNumber: '12345678900' }],
        metadata: {},
      }),
    };

    const repository = {
      findCollaboratorsWithCpfNotNull: vi.fn().mockResolvedValue([collab]),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByProfileId: vi.fn(),
      findByCpfs: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new SyncFlashCollaboratorsUseCase(
      repository as never,
      flashAdapter as never,
    );

    const result = await useCase.execute();

    expect(result.linked).toBe(0);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
