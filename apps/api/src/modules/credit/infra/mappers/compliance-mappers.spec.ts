import { CguCheckResultMapper } from './cgu-check-result.mapper';
import { PepCheckResultMapper } from './pep-check-result.mapper';
import { PgfnCheckResultMapper } from './pgfn-check-result.mapper';
import { CndtCheckResultMapper } from './cndt-check-result.mapper';
import { AddressValidationResultMapper } from './address-validation-result.mapper';
import { SanctionsCheckResultMapper } from './sanctions-check-result.mapper';
import { SlaveLaborCheckResultMapper } from './slave-labor-check-result.mapper';
import { CguCheckResult } from '../../domain/cgu-check-result.entity';
import { PepCheckResult } from '../../domain/pep-check-result.entity';
import { PgfnCheckResult } from '../../domain/pgfn-check-result.entity';
import { CndtCheckResult } from '../../domain/cndt-check-result.entity';
import { AddressValidationResult } from '../../domain/address-validation-result.entity';
import { SanctionsCheckResult } from '../../domain/sanctions-check-result.entity';
import { SlaveLaborCheckResult } from '../../domain/slave-labor-check-result.entity';

describe('CguCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');

  const dbRow = {
    id: 'uuid-cgu',
    clientId: 'client-1',
    cnpj: '12345678000199',
    checkType: 'CEIS',
    hasMatch: true,
    matchCount: 3,
    summary: 'Found 3 matches',
    rawData: { entries: [1, 2, 3] },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should map all fields from DB row to entity', () => {
      const entity = CguCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(CguCheckResult);
      expect(entity.id).toBe('uuid-cgu');
      expect(entity.clientId).toBe('client-1');
      expect(entity.cnpj).toBe('12345678000199');
      expect(entity.checkType).toBe('CEIS');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchCount).toBe(3);
      expect(entity.summary).toBe('Found 3 matches');
      expect(entity.rawData).toEqual({ entries: [1, 2, 3] });
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });

  describe('toPersistence()', () => {
    it('should map entity to DB row with id set to undefined when empty', () => {
      const entity = CguCheckResult.create({
        clientId: 'client-1',
        cnpj: '12345678000199',
        checkType: 'CNEP',
        hasMatch: false,
        matchCount: 0,
        summary: null,
        rawData: null,
      });

      const row = CguCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.clientId).toBe('client-1');
      expect(row.cnpj).toBe('12345678000199');
      expect(row.checkType).toBe('CNEP');
      expect(row.hasMatch).toBe(false);
      expect(row.matchCount).toBe(0);
      expect(row.summary).toBeNull();
      expect(row.rawData).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = CguCheckResult.reconstitute({ ...dbRow, checkType: 'CEIS' as const });
      const row = CguCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-cgu');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = CguCheckResult.create({
        id: 'round-trip-id',
        clientId: 'client-1',
        cnpj: '12345678000199',
        checkType: 'CEPIM',
        hasMatch: true,
        matchCount: 1,
        summary: 'One match',
        rawData: { foo: 'bar' },
      });

      const persisted = CguCheckResultMapper.toPersistence(original);
      const restored = CguCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.cnpj).toBe(original.cnpj);
      expect(restored.checkType).toBe(original.checkType);
      expect(restored.hasMatch).toBe(original.hasMatch);
      expect(restored.matchCount).toBe(original.matchCount);
      expect(restored.summary).toBe(original.summary);
      expect(restored.rawData).toEqual(original.rawData);
    });
  });
});

describe('PepCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');

  const dbRow = {
    id: 'uuid-pep',
    clientId: 'client-2',
    cpf: '12345678901',
    personName: 'João Silva',
    hasMatch: true,
    matchedRole: 'Deputado Federal',
    matchedOrg: 'Câmara dos Deputados',
    rawData: { source: 'portal' },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should map all fields from DB row to entity', () => {
      const entity = PepCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(PepCheckResult);
      expect(entity.id).toBe('uuid-pep');
      expect(entity.clientId).toBe('client-2');
      expect(entity.cpf).toBe('12345678901');
      expect(entity.personName).toBe('João Silva');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchedRole).toBe('Deputado Federal');
      expect(entity.matchedOrg).toBe('Câmara dos Deputados');
      expect(entity.rawData).toEqual({ source: 'portal' });
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });

  describe('toPersistence()', () => {
    it('should map entity to DB row with id set to undefined when empty', () => {
      const entity = PepCheckResult.create({
        clientId: 'client-2',
        cpf: '12345678901',
        personName: 'Maria',
        hasMatch: false,
        matchedRole: null,
        matchedOrg: null,
        rawData: null,
      });

      const row = PepCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.clientId).toBe('client-2');
      expect(row.cpf).toBe('12345678901');
      expect(row.personName).toBe('Maria');
      expect(row.hasMatch).toBe(false);
      expect(row.matchedRole).toBeNull();
      expect(row.matchedOrg).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = PepCheckResult.reconstitute(dbRow);
      const row = PepCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-pep');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = PepCheckResult.create({
        id: 'round-trip-pep',
        clientId: 'client-2',
        cpf: '12345678901',
        personName: 'Carlos',
        hasMatch: true,
        matchedRole: 'Senador',
        matchedOrg: 'Senado',
        rawData: { x: 1 },
      });

      const persisted = PepCheckResultMapper.toPersistence(original);
      const restored = PepCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.cpf).toBe(original.cpf);
      expect(restored.personName).toBe(original.personName);
      expect(restored.hasMatch).toBe(original.hasMatch);
      expect(restored.matchedRole).toBe(original.matchedRole);
      expect(restored.matchedOrg).toBe(original.matchedOrg);
      expect(restored.rawData).toEqual(original.rawData);
    });
  });
});

describe('PgfnCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');

  const dbRow = {
    id: 'uuid-pgfn',
    clientId: 'client-3',
    cnpj: '98765432000188',
    hasDebt: true,
    totalDebtAmount: '150000.50',
    debtCount: 5,
    summary: '5 active debts',
    rawData: { debts: [] },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should convert totalDebtAmount from string to number', () => {
      const entity = PgfnCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(PgfnCheckResult);
      expect(entity.id).toBe('uuid-pgfn');
      expect(entity.clientId).toBe('client-3');
      expect(entity.cnpj).toBe('98765432000188');
      expect(entity.hasDebt).toBe(true);
      expect(entity.totalDebtAmount).toBe(150000.5);
      expect(typeof entity.totalDebtAmount).toBe('number');
      expect(entity.debtCount).toBe(5);
      expect(entity.summary).toBe('5 active debts');
      expect(entity.rawData).toEqual({ debts: [] });
      expect(entity.queriedAt).toBe(queriedAt);
    });

    it('should handle null totalDebtAmount', () => {
      const entity = PgfnCheckResultMapper.toDomain({ ...dbRow, totalDebtAmount: null } as any);

      expect(entity.totalDebtAmount).toBeNull();
    });
  });

  describe('toPersistence()', () => {
    it('should convert totalDebtAmount from number to string', () => {
      const entity = PgfnCheckResult.create({
        clientId: 'client-3',
        cnpj: '98765432000188',
        hasDebt: true,
        totalDebtAmount: 250000.99,
        debtCount: 2,
        summary: null,
        rawData: null,
      });

      const row = PgfnCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.totalDebtAmount).toBe('250000.99');
      expect(typeof row.totalDebtAmount).toBe('string');
      expect(row.hasDebt).toBe(true);
      expect(row.debtCount).toBe(2);
    });

    it('should handle null totalDebtAmount in toPersistence', () => {
      const entity = PgfnCheckResult.create({
        clientId: 'client-3',
        cnpj: null,
        hasDebt: false,
        totalDebtAmount: null,
        debtCount: 0,
        summary: null,
        rawData: null,
      });

      const row = PgfnCheckResultMapper.toPersistence(entity);

      expect(row.totalDebtAmount).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = PgfnCheckResult.reconstitute({
        id: 'uuid-pgfn',
        clientId: 'client-3',
        cnpj: null,
        hasDebt: false,
        totalDebtAmount: 100,
        debtCount: 1,
        summary: null,
        rawData: null,
        queriedAt,
      });

      const row = PgfnCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-pgfn');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = PgfnCheckResult.create({
        id: 'round-trip-pgfn',
        clientId: 'client-3',
        cnpj: '98765432000188',
        hasDebt: true,
        totalDebtAmount: 99999.12,
        debtCount: 3,
        summary: 'debts',
        rawData: { x: 1 },
      });

      const persisted = PgfnCheckResultMapper.toPersistence(original);
      const restored = PgfnCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.totalDebtAmount).toBe(original.totalDebtAmount);
      expect(restored.debtCount).toBe(original.debtCount);
    });
  });
});

describe('CndtCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');
  const validUntil = new Date('2026-01-15T00:00:00Z');

  const dbRow = {
    id: 'uuid-cndt',
    clientId: 'client-4',
    cnpj: '11223344000155',
    certificateStatus: 'NEGATIVE',
    certificateNumber: 'CNDT-2025-001234',
    validUntil,
    rawData: { certUrl: 'https://example.com' },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should map all fields from DB row to entity', () => {
      const entity = CndtCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(CndtCheckResult);
      expect(entity.id).toBe('uuid-cndt');
      expect(entity.clientId).toBe('client-4');
      expect(entity.cnpj).toBe('11223344000155');
      expect(entity.certificateStatus).toBe('NEGATIVE');
      expect(entity.certificateNumber).toBe('CNDT-2025-001234');
      expect(entity.validUntil).toBe(validUntil);
      expect(entity.rawData).toEqual({ certUrl: 'https://example.com' });
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });

  describe('toPersistence()', () => {
    it('should map entity to DB row with id set to undefined when empty', () => {
      const entity = CndtCheckResult.create({
        clientId: 'client-4',
        cnpj: '11223344000155',
        certificateStatus: 'POSITIVE_WITH_EFFECTS',
        certificateNumber: null,
        validUntil: null,
        rawData: null,
      });

      const row = CndtCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.clientId).toBe('client-4');
      expect(row.certificateStatus).toBe('POSITIVE_WITH_EFFECTS');
      expect(row.certificateNumber).toBeNull();
      expect(row.validUntil).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = CndtCheckResult.reconstitute({
        ...dbRow,
        certificateStatus: 'NEGATIVE' as const,
      });
      const row = CndtCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-cndt');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = CndtCheckResult.create({
        id: 'round-trip-cndt',
        clientId: 'client-4',
        cnpj: '11223344000155',
        certificateStatus: 'POSITIVE',
        certificateNumber: 'CERT-999',
        validUntil,
        rawData: { y: 2 },
      });

      const persisted = CndtCheckResultMapper.toPersistence(original);
      const restored = CndtCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.certificateStatus).toBe(original.certificateStatus);
      expect(restored.certificateNumber).toBe(original.certificateNumber);
      expect(restored.validUntil).toBe(original.validUntil);
    });
  });
});

describe('AddressValidationResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');

  const dbRow = {
    id: 'uuid-addr',
    clientId: 'client-5',
    cep: '01001000',
    isValid: true,
    street: 'Praça da Sé',
    neighborhood: 'Sé',
    city: 'São Paulo',
    state: 'SP',
    matchesRegistered: true,
    rawData: { ibge: '3550308' },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should map all fields from DB row to entity', () => {
      const entity = AddressValidationResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(AddressValidationResult);
      expect(entity.id).toBe('uuid-addr');
      expect(entity.clientId).toBe('client-5');
      expect(entity.cep).toBe('01001000');
      expect(entity.isValid).toBe(true);
      expect(entity.street).toBe('Praça da Sé');
      expect(entity.neighborhood).toBe('Sé');
      expect(entity.city).toBe('São Paulo');
      expect(entity.state).toBe('SP');
      expect(entity.matchesRegistered).toBe(true);
      expect(entity.rawData).toEqual({ ibge: '3550308' });
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });

  describe('toPersistence()', () => {
    it('should map entity to DB row with id set to undefined when empty', () => {
      const entity = AddressValidationResult.create({
        clientId: 'client-5',
        cep: '20040020',
        isValid: false,
        street: null,
        neighborhood: null,
        city: null,
        state: null,
        matchesRegistered: null,
        rawData: null,
      });

      const row = AddressValidationResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.clientId).toBe('client-5');
      expect(row.cep).toBe('20040020');
      expect(row.isValid).toBe(false);
      expect(row.street).toBeNull();
      expect(row.matchesRegistered).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = AddressValidationResult.reconstitute(dbRow);
      const row = AddressValidationResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-addr');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = AddressValidationResult.create({
        id: 'round-trip-addr',
        clientId: 'client-5',
        cep: '01001000',
        isValid: true,
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'RJ',
        state: 'RJ',
        matchesRegistered: false,
        rawData: { z: 3 },
      });

      const persisted = AddressValidationResultMapper.toPersistence(original);
      const restored = AddressValidationResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.cep).toBe(original.cep);
      expect(restored.isValid).toBe(original.isValid);
      expect(restored.street).toBe(original.street);
      expect(restored.neighborhood).toBe(original.neighborhood);
      expect(restored.city).toBe(original.city);
      expect(restored.state).toBe(original.state);
      expect(restored.matchesRegistered).toBe(original.matchesRegistered);
    });
  });
});

describe('SanctionsCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');

  const dbRow = {
    id: 'uuid-sanc',
    clientId: 'client-6',
    entityName: 'Acme Corp',
    documentSearched: '12345678000199',
    source: 'OFAC',
    hasMatch: true,
    matchScore: '0.9500',
    matchDetails: 'SDN List match',
    rawData: { listName: 'SDN' },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should convert matchScore from string to number', () => {
      const entity = SanctionsCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(SanctionsCheckResult);
      expect(entity.id).toBe('uuid-sanc');
      expect(entity.clientId).toBe('client-6');
      expect(entity.entityName).toBe('Acme Corp');
      expect(entity.documentSearched).toBe('12345678000199');
      expect(entity.source).toBe('OFAC');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchScore).toBe(0.95);
      expect(typeof entity.matchScore).toBe('number');
      expect(entity.matchDetails).toBe('SDN List match');
      expect(entity.rawData).toEqual({ listName: 'SDN' });
      expect(entity.queriedAt).toBe(queriedAt);
    });

    it('should handle null matchScore', () => {
      const entity = SanctionsCheckResultMapper.toDomain({ ...dbRow, matchScore: null } as any);

      expect(entity.matchScore).toBeNull();
    });
  });

  describe('toPersistence()', () => {
    it('should convert matchScore from number to string', () => {
      const entity = SanctionsCheckResult.create({
        clientId: 'client-6',
        entityName: 'Test Entity',
        documentSearched: '99988877000166',
        source: 'OFAC',
        hasMatch: true,
        matchScore: 0.85,
        matchDetails: 'Partial match',
        rawData: null,
      });

      const row = SanctionsCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.matchScore).toBe('0.85');
      expect(typeof row.matchScore).toBe('string');
      expect(row.source).toBe('OFAC');
      expect(row.hasMatch).toBe(true);
    });

    it('should handle null matchScore in toPersistence', () => {
      const entity = SanctionsCheckResult.create({
        clientId: 'client-6',
        entityName: null,
        documentSearched: null,
        source: 'OFAC',
        hasMatch: false,
        matchScore: null,
        matchDetails: null,
        rawData: null,
      });

      const row = SanctionsCheckResultMapper.toPersistence(entity);

      expect(row.matchScore).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = SanctionsCheckResult.reconstitute({
        id: 'uuid-sanc',
        clientId: 'client-6',
        entityName: null,
        documentSearched: null,
        source: 'OFAC',
        hasMatch: false,
        matchScore: 0.5,
        matchDetails: null,
        rawData: null,
        queriedAt,
      });

      const row = SanctionsCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-sanc');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = SanctionsCheckResult.create({
        id: 'round-trip-sanc',
        clientId: 'client-6',
        entityName: 'Test Corp',
        documentSearched: '12345678000199',
        source: 'OFAC',
        hasMatch: true,
        matchScore: 0.77,
        matchDetails: 'Match found',
        rawData: { a: 1 },
      });

      const persisted = SanctionsCheckResultMapper.toPersistence(original);
      const restored = SanctionsCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.matchScore).toBe(original.matchScore);
      expect(restored.source).toBe(original.source);
      expect(restored.hasMatch).toBe(original.hasMatch);
    });
  });
});

describe('SlaveLaborCheckResultMapper', () => {
  const queriedAt = new Date('2025-06-01T12:00:00Z');
  const inspectionDate = new Date('2024-03-15T00:00:00Z');

  const dbRow = {
    id: 'uuid-slave',
    clientId: 'client-7',
    cnpj: '55667788000100',
    hasMatch: true,
    employerName: 'Fazenda XYZ',
    rescuedWorkers: 12,
    inspectionDate,
    rawData: { operation: 'Op. Resgate' },
    queriedAt,
  };

  describe('toDomain()', () => {
    it('should map all fields from DB row to entity', () => {
      const entity = SlaveLaborCheckResultMapper.toDomain(dbRow as any);

      expect(entity).toBeInstanceOf(SlaveLaborCheckResult);
      expect(entity.id).toBe('uuid-slave');
      expect(entity.clientId).toBe('client-7');
      expect(entity.cnpj).toBe('55667788000100');
      expect(entity.hasMatch).toBe(true);
      expect(entity.employerName).toBe('Fazenda XYZ');
      expect(entity.rescuedWorkers).toBe(12);
      expect(entity.inspectionDate).toBe(inspectionDate);
      expect(entity.rawData).toEqual({ operation: 'Op. Resgate' });
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });

  describe('toPersistence()', () => {
    it('should map entity to DB row with id set to undefined when empty', () => {
      const entity = SlaveLaborCheckResult.create({
        clientId: 'client-7',
        cnpj: '55667788000100',
        hasMatch: false,
        employerName: null,
        rescuedWorkers: null,
        inspectionDate: null,
        rawData: null,
      });

      const row = SlaveLaborCheckResultMapper.toPersistence(entity);

      expect(row.id).toBeUndefined();
      expect(row.clientId).toBe('client-7');
      expect(row.cnpj).toBe('55667788000100');
      expect(row.hasMatch).toBe(false);
      expect(row.employerName).toBeNull();
      expect(row.rescuedWorkers).toBeNull();
      expect(row.inspectionDate).toBeNull();
    });

    it('should preserve id when entity has one', () => {
      const entity = SlaveLaborCheckResult.reconstitute(dbRow);
      const row = SlaveLaborCheckResultMapper.toPersistence(entity);

      expect(row.id).toBe('uuid-slave');
    });
  });

  describe('round-trip', () => {
    it('should preserve data through toPersistence → toDomain', () => {
      const original = SlaveLaborCheckResult.create({
        id: 'round-trip-slave',
        clientId: 'client-7',
        cnpj: '55667788000100',
        hasMatch: true,
        employerName: 'Test Farm',
        rescuedWorkers: 5,
        inspectionDate,
        rawData: { b: 2 },
      });

      const persisted = SlaveLaborCheckResultMapper.toPersistence(original);
      const restored = SlaveLaborCheckResultMapper.toDomain(persisted as any);

      expect(restored.id).toBe(original.id);
      expect(restored.clientId).toBe(original.clientId);
      expect(restored.cnpj).toBe(original.cnpj);
      expect(restored.hasMatch).toBe(original.hasMatch);
      expect(restored.employerName).toBe(original.employerName);
      expect(restored.rescuedWorkers).toBe(original.rescuedWorkers);
      expect(restored.inspectionDate).toEqual(original.inspectionDate);
    });
  });
});
