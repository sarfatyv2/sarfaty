import { describe, it, expect } from 'vitest';
import { Dependent, type DependentProps } from './dependent.entity';

function createDependentFactory(overrides: Partial<DependentProps> = {}): Dependent {
  return Dependent.reconstitute({
    id: `dep-${Date.now()}`,
    collaboratorId: `collab-${Date.now()}`,
    relationship: 'filho',
    fullName: 'Test Dependent',
    dateOfBirth: '2020-06-15',
    cpf: '123.456.789-00',
    isIrDependent: true,
    isHealthPlan: true,
    notes: null,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    ...overrides,
  });
}

describe('Dependent Entity', () => {
  describe('reconstitute', () => {
    it('should reconstitute a dependent from props', () => {
      const dep = createDependentFactory();

      expect(dep.fullName).toBe('Test Dependent');
      expect(dep.relationship).toBe('filho');
      expect(dep.isIrDependent).toBe(true);
      expect(dep.isHealthPlan).toBe(true);
    });

    it('should handle null optional fields', () => {
      const dep = createDependentFactory({
        dateOfBirth: null,
        cpf: null,
        notes: null,
      });

      expect(dep.dateOfBirth).toBeNull();
      expect(dep.cpf).toBeNull();
      expect(dep.notes).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a dependent with valid data', () => {
      const dep = Dependent.create({
        collaboratorId: 'collab-123',
        fullName: 'Maria Silva',
        relationship: 'conjuge',
        dateOfBirth: '1990-05-10',
        cpf: null,
        isIrDependent: false,
        isHealthPlan: true,
        notes: null,
      });

      expect(dep.fullName).toBe('Maria Silva');
      expect(dep.relationship).toBe('conjuge');
      expect(dep.isIrDependent).toBe(false);
      expect(dep.isHealthPlan).toBe(true);
    });

    it('should throw when fullName is too short', () => {
      expect(() =>
        Dependent.create({
          collaboratorId: 'collab-123',
          fullName: 'A',
          relationship: 'filho',
          dateOfBirth: null,
          cpf: null,
          isIrDependent: false,
          isHealthPlan: false,
          notes: null,
        }),
      ).toThrow('Dependent full name must have at least 2 characters');
    });

    it('should throw when fullName is empty', () => {
      expect(() =>
        Dependent.create({
          collaboratorId: 'collab-123',
          fullName: '',
          relationship: null,
          dateOfBirth: null,
          cpf: null,
          isIrDependent: false,
          isHealthPlan: false,
          notes: null,
        }),
      ).toThrow('Dependent full name must have at least 2 characters');
    });
  });

  describe('toPlainObject', () => {
    it('should return all fields as a plain object', () => {
      const dep = createDependentFactory();
      const plain = dep.toPlainObject();

      expect(plain.id).toBe(dep.id);
      expect(plain.fullName).toBe(dep.fullName);
      expect(plain.relationship).toBe(dep.relationship);
      expect(plain.collaboratorId).toBe(dep.collaboratorId);
      expect(plain.isIrDependent).toBe(dep.isIrDependent);
      expect(plain.isHealthPlan).toBe(dep.isHealthPlan);
    });
  });
});
