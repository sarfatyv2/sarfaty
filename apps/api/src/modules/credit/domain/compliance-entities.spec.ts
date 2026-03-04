import { CguCheckResult } from './cgu-check-result.entity';
import { PepCheckResult } from './pep-check-result.entity';
import { PgfnCheckResult } from './pgfn-check-result.entity';
import { CndtCheckResult } from './cndt-check-result.entity';
import { AddressValidationResult } from './address-validation-result.entity';
import { SanctionsCheckResult } from './sanctions-check-result.entity';
import { SlaveLaborCheckResult } from './slave-labor-check-result.entity';

describe('CguCheckResult', () => {
  const baseProps = {
    clientId: 'client-1',
    cnpj: '12345678000199',
    checkType: 'CEIS' as const,
    hasMatch: true,
    matchCount: 3,
    summary: 'Found 3 matches in CEIS',
    rawData: { entries: [1, 2, 3] },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = CguCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.checkType).toBe('CEIS');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchCount).toBe(3);
      expect(entity.summary).toBe(baseProps.summary);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = CguCheckResult.create({ ...baseProps, id: 'custom-id' });

      expect(entity.id).toBe('custom-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = CguCheckResult.reconstitute({
        id: 'uuid-123',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-123');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.checkType).toBe('CEIS');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchCount).toBe(3);
      expect(entity.summary).toBe(baseProps.summary);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('PepCheckResult', () => {
  const baseProps = {
    clientId: 'client-2',
    cpf: '12345678901',
    personName: 'João Silva',
    hasMatch: true,
    matchedRole: 'Deputado Federal',
    matchedOrg: 'Câmara dos Deputados',
    rawData: { source: 'portal-transparencia' },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = PepCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cpf).toBe(baseProps.cpf);
      expect(entity.personName).toBe(baseProps.personName);
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchedRole).toBe(baseProps.matchedRole);
      expect(entity.matchedOrg).toBe(baseProps.matchedOrg);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = PepCheckResult.create({ ...baseProps, id: 'pep-id' });

      expect(entity.id).toBe('pep-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = PepCheckResult.reconstitute({
        id: 'uuid-pep',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-pep');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cpf).toBe(baseProps.cpf);
      expect(entity.personName).toBe(baseProps.personName);
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchedRole).toBe(baseProps.matchedRole);
      expect(entity.matchedOrg).toBe(baseProps.matchedOrg);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('PgfnCheckResult', () => {
  const baseProps = {
    clientId: 'client-3',
    cnpj: '98765432000188',
    hasDebt: true,
    totalDebtAmount: 150000.5,
    debtCount: 5,
    summary: '5 active debts',
    rawData: { debts: [] },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = PgfnCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.hasDebt).toBe(true);
      expect(entity.totalDebtAmount).toBe(150000.5);
      expect(entity.debtCount).toBe(5);
      expect(entity.summary).toBe(baseProps.summary);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = PgfnCheckResult.create({ ...baseProps, id: 'pgfn-id' });

      expect(entity.id).toBe('pgfn-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = PgfnCheckResult.reconstitute({
        id: 'uuid-pgfn',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-pgfn');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.hasDebt).toBe(true);
      expect(entity.totalDebtAmount).toBe(150000.5);
      expect(entity.debtCount).toBe(5);
      expect(entity.summary).toBe(baseProps.summary);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('CndtCheckResult', () => {
  const validUntil = new Date('2026-01-15T00:00:00Z');
  const baseProps = {
    clientId: 'client-4',
    cnpj: '11223344000155',
    certificateStatus: 'NEGATIVE' as const,
    certificateNumber: 'CNDT-2025-001234',
    validUntil,
    rawData: { certUrl: 'https://example.com/cert' },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = CndtCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.certificateStatus).toBe('NEGATIVE');
      expect(entity.certificateNumber).toBe(baseProps.certificateNumber);
      expect(entity.validUntil).toBe(validUntil);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = CndtCheckResult.create({ ...baseProps, id: 'cndt-id' });

      expect(entity.id).toBe('cndt-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = CndtCheckResult.reconstitute({
        id: 'uuid-cndt',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-cndt');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.certificateStatus).toBe('NEGATIVE');
      expect(entity.certificateNumber).toBe(baseProps.certificateNumber);
      expect(entity.validUntil).toBe(validUntil);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('AddressValidationResult', () => {
  const baseProps = {
    clientId: 'client-5',
    cep: '01001000',
    isValid: true,
    street: 'Praça da Sé',
    neighborhood: 'Sé',
    city: 'São Paulo',
    state: 'SP',
    matchesRegistered: true,
    rawData: { ibge: '3550308' },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = AddressValidationResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cep).toBe(baseProps.cep);
      expect(entity.isValid).toBe(true);
      expect(entity.street).toBe(baseProps.street);
      expect(entity.neighborhood).toBe(baseProps.neighborhood);
      expect(entity.city).toBe(baseProps.city);
      expect(entity.state).toBe(baseProps.state);
      expect(entity.matchesRegistered).toBe(true);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = AddressValidationResult.create({ ...baseProps, id: 'addr-id' });

      expect(entity.id).toBe('addr-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = AddressValidationResult.reconstitute({
        id: 'uuid-addr',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-addr');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cep).toBe(baseProps.cep);
      expect(entity.isValid).toBe(true);
      expect(entity.street).toBe(baseProps.street);
      expect(entity.neighborhood).toBe(baseProps.neighborhood);
      expect(entity.city).toBe(baseProps.city);
      expect(entity.state).toBe(baseProps.state);
      expect(entity.matchesRegistered).toBe(true);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('SanctionsCheckResult', () => {
  const baseProps = {
    clientId: 'client-6',
    entityName: 'Acme Corp',
    documentSearched: '12345678000199',
    source: 'OFAC' as const,
    hasMatch: true,
    matchScore: 0.95,
    matchDetails: 'SDN List match',
    rawData: { listName: 'SDN' },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = SanctionsCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.entityName).toBe(baseProps.entityName);
      expect(entity.documentSearched).toBe(baseProps.documentSearched);
      expect(entity.source).toBe('OFAC');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchScore).toBe(0.95);
      expect(entity.matchDetails).toBe(baseProps.matchDetails);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = SanctionsCheckResult.create({ ...baseProps, id: 'sanc-id' });

      expect(entity.id).toBe('sanc-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = SanctionsCheckResult.reconstitute({
        id: 'uuid-sanc',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-sanc');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.entityName).toBe(baseProps.entityName);
      expect(entity.documentSearched).toBe(baseProps.documentSearched);
      expect(entity.source).toBe('OFAC');
      expect(entity.hasMatch).toBe(true);
      expect(entity.matchScore).toBe(0.95);
      expect(entity.matchDetails).toBe(baseProps.matchDetails);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});

describe('SlaveLaborCheckResult', () => {
  const inspectionDate = new Date('2024-03-15T00:00:00Z');
  const baseProps = {
    clientId: 'client-7',
    cnpj: '55667788000100',
    hasMatch: true,
    employerName: 'Fazenda XYZ',
    rescuedWorkers: 12,
    inspectionDate,
    rawData: { operation: 'Op. Resgate' },
  };

  describe('create()', () => {
    it('should set queriedAt to approximately now and id to empty string', () => {
      const before = new Date();
      const entity = SlaveLaborCheckResult.create(baseProps);
      const after = new Date();

      expect(entity.id).toBe('');
      expect(entity.queriedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.queriedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.hasMatch).toBe(true);
      expect(entity.employerName).toBe(baseProps.employerName);
      expect(entity.rescuedWorkers).toBe(12);
      expect(entity.inspectionDate).toBe(inspectionDate);
      expect(entity.rawData).toEqual(baseProps.rawData);
    });

    it('should keep the provided id when given', () => {
      const entity = SlaveLaborCheckResult.create({ ...baseProps, id: 'slave-id' });

      expect(entity.id).toBe('slave-id');
    });
  });

  describe('reconstitute()', () => {
    it('should preserve all props exactly', () => {
      const queriedAt = new Date('2025-06-01T12:00:00Z');
      const entity = SlaveLaborCheckResult.reconstitute({
        id: 'uuid-slave',
        ...baseProps,
        queriedAt,
      });

      expect(entity.id).toBe('uuid-slave');
      expect(entity.clientId).toBe(baseProps.clientId);
      expect(entity.cnpj).toBe(baseProps.cnpj);
      expect(entity.hasMatch).toBe(true);
      expect(entity.employerName).toBe(baseProps.employerName);
      expect(entity.rescuedWorkers).toBe(12);
      expect(entity.inspectionDate).toBe(inspectionDate);
      expect(entity.rawData).toEqual(baseProps.rawData);
      expect(entity.queriedAt).toBe(queriedAt);
    });
  });
});
