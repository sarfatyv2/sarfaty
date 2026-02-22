import { describe, it, expect } from 'vitest';
import { User } from './user.entity';

function createUserFactory(overrides: Partial<import('./user.entity').CreateUserProps> = {}) {
  return User.create({
    id: `test-${Date.now()}`,
    email: `test-${Date.now()}@sarfaty.com`,
    fullName: 'Test User',
    role: 'employee',
    ...overrides,
  });
}

function createUserWithCollaboratorFactory(overrides: Partial<import('./user.entity').CreateUserProps> = {}) {
  return createUserFactory({
    employmentType: 'clt',
    cpf: '123.456.789-00',
    department: 'Engineering',
    jobTitle: 'Developer',
    ...overrides,
  });
}

describe('User Entity', () => {
  describe('User.create()', () => {
    it('should create a user with minimal required fields', () => {
      const user = createUserFactory({
        email: 'admin@sarfaty.com',
        fullName: 'Admin User',
        role: 'admin',
      });

      expect(user.email).toBe('admin@sarfaty.com');
      expect(user.fullName).toBe('Admin User');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(true);
      expect(user.hasCollaboratorData).toBe(false);
    });

    it('should create a user with collaborator data', () => {
      const user = createUserWithCollaboratorFactory({
        email: 'dev@sarfaty.com',
        fullName: 'Dev User',
        role: 'employee',
        employmentType: 'clt',
      });

      expect(user.hasCollaboratorData).toBe(true);
      expect(user.isClt).toBe(true);
      expect(user.isPj).toBe(false);
    });

    it('should create a PJ user', () => {
      const user = createUserWithCollaboratorFactory({
        employmentType: 'pj',
        companyName: 'Dev Ltda',
        companyCnpj: '12.345.678/0001-90',
      });

      expect(user.isPj).toBe(true);
      expect(user.isClt).toBe(false);
      expect(user.companyName).toBe('Dev Ltda');
    });

    it('should default nationality to Brasileira', () => {
      const user = createUserFactory();
      expect(user.nationality).toBe('Brasileira');
    });

    it('should default company to Sarfaty', () => {
      const user = createUserFactory();
      expect(user.company).toBe('Sarfaty');
    });

    it('should default isInternal to true', () => {
      const user = createUserFactory();
      expect(user.isInternal).toBe(true);
    });

    it('should default plrEligible to false', () => {
      const user = createUserFactory();
      expect(user.plrEligible).toBe(false);
    });

    it('should default hasMedicalAssistance to true', () => {
      const user = createUserFactory();
      expect(user.hasMedicalAssistance).toBe(true);
    });
  });

  describe('validation', () => {
    it('should throw when role is invalid', () => {
      expect(() =>
        User.create({
          id: 'test-id',
          email: 'test@test.com',
          fullName: 'Test',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: 'invalid_role' as any,
        }),
      ).toThrow('Invalid role');
    });

    it('should throw when email is empty', () => {
      expect(() =>
        User.create({
          id: 'test-id',
          email: '',
          fullName: 'Test',
          role: 'admin',
        }),
      ).toThrow('Invalid email');
    });

    it('should throw when fullName is too short', () => {
      expect(() =>
        User.create({
          id: 'test-id',
          email: 'test@test.com',
          fullName: 'A',
          role: 'admin',
        }),
      ).toThrow('Full name must have at least 2 characters');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user without validation', () => {
      const user = User.reconstitute({
        id: 'existing-id',
        email: 'old@sarfaty.com',
        fullName: 'Existing User',
        role: 'hr',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      });

      expect(user.id).toBe('existing-id');
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });
});
