import { describe, it, expect } from 'vitest';
import { Collaborator, type CollaboratorProps } from './collaborator.entity';

function createCollaboratorFactory(overrides: Partial<CollaboratorProps> = {}): Collaborator {
  return Collaborator.reconstitute({
    id: `collab-${Date.now()}`,
    profileId: `profile-${Date.now()}`,
    flashEmployeeId: null,
    isActive: true,
    registrationNumber: '12345',
    badgeNumber: 'B001',
    employmentType: 'clt',
    isInternal: true,
    fullName: 'Test Collaborator',
    socialName: null,
    dateOfBirth: '1990-01-15',
    gender: 'masculino',
    maritalStatus: 'solteiro',
    nationality: 'Brasileira',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    rgIssuer: 'SSP/SP',
    voterRegistration: null,
    voterZone: null,
    voterSection: null,
    militaryCert: null,
    addressStreet: 'Rua Teste',
    addressNumber: '123',
    addressComplement: 'Apto 1',
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZip: '01000-000',
    phone: '11999999999',
    personalEmail: 'test@personal.com',
    corporateEmail: 'test@sarfaty.com',
    extension: '1234',
    company: 'Sarfaty',
    directorate: 'Tecnologia',
    department: 'Engineering',
    branch: 'SP',
    managerId: null,
    jobTitle: 'Developer',
    roleCode: 'DEV',
    roleLevel: 'Pleno',
    startDateOriginal: '2023-01-01',
    startDateCurrent: '2023-01-01',
    registrationDate: '2023-01-01',
    terminationDate: null,
    terminationReason: null,
    hasMedicalAssistance: true,
    medicalPlanNotes: null,
    plrEligible: false,
    thirteenthPj: false,
    guaranteedBonus: null,
    commissionPct: null,
    bankName: 'Banco do Brasil',
    bankBranch: '0001',
    bankAccount: '12345-6',
    bankAccountType: 'pf',
    currentSalary: 10000,
    lastMovementDate: null,
    lastMovementType: null,
    notes: null,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    ...overrides,
  });
}

describe('Collaborator Entity', () => {
  describe('reconstitute', () => {
    it('should reconstitute a collaborator from props', () => {
      const collab = createCollaboratorFactory();

      expect(collab.fullName).toBe('Test Collaborator');
      expect(collab.isActive).toBe(true);
      expect(collab.employmentType).toBe('clt');
      expect(collab.department).toBe('Engineering');
    });

    it('should correctly identify CLT collaborator', () => {
      const collab = createCollaboratorFactory({ employmentType: 'clt' });

      expect(collab.isClt).toBe(true);
      expect(collab.isPj).toBe(false);
    });

    it('should correctly identify PJ collaborator', () => {
      const collab = createCollaboratorFactory({ employmentType: 'pj' });

      expect(collab.isPj).toBe(true);
      expect(collab.isClt).toBe(false);
    });
  });

  describe('isSelfEditableField', () => {
    it('should return true for self-editable fields', () => {
      expect(Collaborator.isSelfEditableField('socialName')).toBe(true);
      expect(Collaborator.isSelfEditableField('phone')).toBe(true);
      expect(Collaborator.isSelfEditableField('personalEmail')).toBe(true);
      expect(Collaborator.isSelfEditableField('addressStreet')).toBe(true);
      expect(Collaborator.isSelfEditableField('bankName')).toBe(true);
      expect(Collaborator.isSelfEditableField('bankAccount')).toBe(true);
    });

    it('should return false for non-self-editable fields', () => {
      expect(Collaborator.isSelfEditableField('fullName')).toBe(false);
      expect(Collaborator.isSelfEditableField('employmentType')).toBe(false);
      expect(Collaborator.isSelfEditableField('currentSalary')).toBe(false);
      expect(Collaborator.isSelfEditableField('department')).toBe(false);
      expect(Collaborator.isSelfEditableField('jobTitle')).toBe(false);
      expect(Collaborator.isSelfEditableField('cpf')).toBe(false);
    });
  });

  describe('filterSelfEditableFields', () => {
    it('should only keep self-editable fields', () => {
      const data = {
        socialName: 'Social',
        phone: '11999999999',
        fullName: 'Should Be Removed',
        currentSalary: 99999,
        department: 'Should Be Removed',
        addressStreet: 'Kept',
      };

      const filtered = Collaborator.filterSelfEditableFields(data);

      expect(filtered).toEqual({
        socialName: 'Social',
        phone: '11999999999',
        addressStreet: 'Kept',
      });

      expect(filtered).not.toHaveProperty('fullName');
      expect(filtered).not.toHaveProperty('currentSalary');
      expect(filtered).not.toHaveProperty('department');
    });

    it('should return empty object when no self-editable fields provided', () => {
      const data = {
        fullName: 'Name',
        department: 'Engineering',
        currentSalary: 10000,
      };

      const filtered = Collaborator.filterSelfEditableFields(data);

      expect(Object.keys(filtered)).toHaveLength(0);
    });
  });

  describe('toManagerView', () => {
    it('should strip sensitive fields from the view', () => {
      const collab = createCollaboratorFactory({
        currentSalary: 10000,
        bankName: 'Banco do Brasil',
        bankBranch: '0001',
        bankAccount: '12345-6',
        bankAccountType: 'pf',
        commissionPct: 5,
        guaranteedBonus: 2000,
        plrEligible: true,
        thirteenthPj: false,
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        rgIssuer: 'SSP/SP',
      });

      const managerView = collab.toManagerView();

      expect(managerView).not.toHaveProperty('currentSalary');
      expect(managerView).not.toHaveProperty('bankName');
      expect(managerView).not.toHaveProperty('bankBranch');
      expect(managerView).not.toHaveProperty('bankAccount');
      expect(managerView).not.toHaveProperty('bankAccountType');
      expect(managerView).not.toHaveProperty('commissionPct');
      expect(managerView).not.toHaveProperty('guaranteedBonus');
      expect(managerView).not.toHaveProperty('plrEligible');
      expect(managerView).not.toHaveProperty('thirteenthPj');
      expect(managerView).not.toHaveProperty('cpf');
      expect(managerView).not.toHaveProperty('rg');
      expect(managerView).not.toHaveProperty('rgIssuer');

      // Non-sensitive fields should remain
      expect(managerView).toHaveProperty('fullName', 'Test Collaborator');
      expect(managerView).toHaveProperty('department', 'Engineering');
      expect(managerView).toHaveProperty('jobTitle', 'Developer');
    });
  });

  describe('toPlainObject', () => {
    it('should return all fields as a plain object', () => {
      const collab = createCollaboratorFactory();
      const plain = collab.toPlainObject();

      expect(plain.id).toBe(collab.id);
      expect(plain.fullName).toBe(collab.fullName);
      expect(plain.currentSalary).toBe(collab.currentSalary);
      expect(plain.employmentType).toBe(collab.employmentType);
    });
  });
});
