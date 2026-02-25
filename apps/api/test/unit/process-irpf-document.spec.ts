import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessIrpfDocumentUseCase } from '../../src/modules/clients/use-cases/process-irpf-document.use-case';
import type { ProcessIrpfInput } from '../../src/modules/clients/use-cases/process-irpf-document.use-case';
import type { IrpfExtractionProps } from '../../src/modules/clients/domain/irpf-extraction.entity';
import type { IrpfRawExtraction } from '@nexus/validators';

function makeExtraction(overrides: Partial<IrpfExtractionProps> = {}): IrpfExtractionProps {
  return {
    id: 'extraction-001',
    clientId: 'client-001',
    authorizedPersonId: null,
    cpf: '12345678901',
    exerciseYear: 2025,
    calendarYear: 2024,
    fullName: 'João Silva',
    birthDate: null,
    occupation: null,
    occupationCode: null,
    nationality: null,
    naturality: null,
    phone: null,
    email: null,
    addressStreet: null,
    addressNumber: null,
    addressComplement: null,
    addressNeighborhood: null,
    addressCity: null,
    addressState: null,
    addressZip: null,
    spouseName: null,
    spouseCpf: null,
    declarationType: null,
    taxationOption: null,
    receiptNumber: null,
    deliveryTimestamp: null,
    totalTaxableIncome: '100000',
    totalExemptIncome: null,
    totalExclusiveIncome: null,
    totalDeductions: null,
    taxableBase: null,
    taxDue: null,
    taxPaid: null,
    taxRefund: null,
    taxBalance: null,
    totalAssetsCurrentYear: null,
    totalAssetsPreviousYear: null,
    totalDebtsCurrentYear: null,
    totalDebtsPreviousYear: null,
    dependents: [],
    taxableIncomeItems: [],
    exemptIncomeItems: [],
    exclusiveIncomeItems: [],
    payments: [],
    assets: [],
    debts: [],
    extractionStatus: 'completed',
    extractionConfidence: 'high',
    ocrApplied: false,
    needsReview: false,
    conflicts: null,
    extractionLog: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRawExtraction(overrides: Partial<IrpfRawExtraction> = {}): IrpfRawExtraction {
  return {
    cpf: '12345678901',
    fullName: 'João Silva',
    exerciseYear: 2025,
    calendarYear: 2024,
    declarationType: 'original',
    taxationOption: 'deductions',
    receiptNumber: null,
    deliveryTimestamp: null,
    birthDate: null,
    occupation: null,
    occupationCode: null,
    nationality: null,
    naturality: null,
    phone: null,
    email: null,
    addressStreet: null,
    addressNumber: null,
    addressComplement: null,
    addressNeighborhood: null,
    addressCity: null,
    addressState: null,
    addressZip: null,
    spouseName: null,
    spouseCpf: null,
    totalTaxableIncome: 100000,
    totalExemptIncome: null,
    totalExclusiveIncome: null,
    totalDeductions: null,
    taxableBase: null,
    taxDue: null,
    taxPaid: null,
    taxRefund: null,
    taxBalance: null,
    totalAssetsCurrentYear: null,
    totalAssetsPreviousYear: null,
    totalDebtsCurrentYear: null,
    totalDebtsPreviousYear: null,
    dependents: [],
    taxableIncomeItems: [],
    exemptIncomeItems: [],
    exclusiveIncomeItems: [],
    payments: [],
    assets: [],
    debts: [],
    confidence: 'high',
    evidence: [],
    ...overrides,
  };
}

const DEFAULT_INPUT: ProcessIrpfInput = {
  documentId: 'doc-001',
  clientId: 'client-001',
  storagePath: 'client-001/irpf/doc-001.pdf',
  authorizedPersonId: null,
  partnerName: 'João Silva',
  referenceYear: 2025,
};

const PDF_BUFFER = Buffer.from('fake-pdf-content');

function makeDeps() {
  const rawExtraction = makeRawExtraction();
  const persisted = makeExtraction();
  const classification = { type: 'declaration' as const, label: 'Declaração', hasNativeText: true };
  const validationResult = { data: rawExtraction, confidence: 'high' as const, warnings: [], isValid: true };
  const canonicalData = { ...persisted };

  const storageService = { downloadDocument: vi.fn().mockResolvedValue(PDF_BUFFER) };
  const classifier = { classify: vi.fn().mockResolvedValue(classification) };
  const geminiService = { extract: vi.fn().mockResolvedValue(rawExtraction) };
  const validator = { validate: vi.fn().mockReturnValue(validationResult) };
  const unifier = { buildCanonical: vi.fn().mockReturnValue(canonicalData) };
  const extractionRepo = {
    findByFileHash: vi.fn().mockResolvedValue(null),
    findByCpfAndExercise: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(persisted),
    createSource: vi.fn().mockResolvedValue(undefined),
  };
  const documentRepo = {
    updateExtraction: vi.fn().mockResolvedValue(undefined),
  };

  const useCase = new ProcessIrpfDocumentUseCase(
    storageService as never,
    classifier as never,
    geminiService as never,
    validator as never,
    unifier as never,
    extractionRepo as never,
    documentRepo as never,
  );

  return { useCase, storageService, classifier, geminiService, validator, unifier, extractionRepo, documentRepo, persisted };
}

describe('ProcessIrpfDocumentUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('idempotency', () => {
    it('returns existing extraction without calling Gemini when file hash already processed', async () => {
      const { useCase, extractionRepo, geminiService, persisted } = makeDeps();
      extractionRepo.findByFileHash.mockResolvedValue(persisted);

      const result = await useCase.execute(DEFAULT_INPUT);

      expect(result).toBe(persisted);
      expect(geminiService.extract).not.toHaveBeenCalled();
    });
  });

  describe('full pipeline', () => {
    it('calls each step in the correct order', async () => {
      const { useCase, storageService, classifier, geminiService, validator, unifier, extractionRepo, documentRepo } = makeDeps();

      await useCase.execute(DEFAULT_INPUT);

      expect(storageService.downloadDocument).toHaveBeenCalledWith(DEFAULT_INPUT.storagePath);
      expect(extractionRepo.findByFileHash).toHaveBeenCalled();
      expect(documentRepo.updateExtraction).toHaveBeenCalledWith(DEFAULT_INPUT.documentId, expect.objectContaining({ validationStatus: 'processing' }));
      expect(classifier.classify).toHaveBeenCalledWith(PDF_BUFFER);
      expect(geminiService.extract).toHaveBeenCalled();
      expect(validator.validate).toHaveBeenCalled();
      expect(unifier.buildCanonical).toHaveBeenCalled();
      expect(extractionRepo.upsert).toHaveBeenCalled();
      expect(extractionRepo.createSource).toHaveBeenCalled();
      expect(documentRepo.updateExtraction).toHaveBeenCalledWith(DEFAULT_INPUT.documentId, expect.objectContaining({ validationStatus: 'valid' }));
    });

    it('sets final validationStatus to needs_review when extraction needsReview is true', async () => {
      const { useCase, extractionRepo, documentRepo } = makeDeps();
      extractionRepo.upsert.mockResolvedValue(makeExtraction({ needsReview: true }));

      await useCase.execute(DEFAULT_INPUT);

      expect(documentRepo.updateExtraction).toHaveBeenLastCalledWith(
        DEFAULT_INPUT.documentId,
        expect.objectContaining({ validationStatus: 'needs_review' }),
      );
    });

    it('looks up existing canonical record by CPF and exercise year', async () => {
      const { useCase, extractionRepo } = makeDeps();

      await useCase.execute(DEFAULT_INPUT);

      expect(extractionRepo.findByCpfAndExercise).toHaveBeenCalledWith('12345678901', 2025);
    });

    it('skips canonical lookup when CPF is empty', async () => {
      const { useCase, geminiService, extractionRepo } = makeDeps();
      geminiService.extract.mockResolvedValue(makeRawExtraction({ cpf: null }));

      await useCase.execute(DEFAULT_INPUT);

      expect(extractionRepo.findByCpfAndExercise).not.toHaveBeenCalled();
    });

    it('registers the source document with the correct subtype', async () => {
      const { useCase, extractionRepo } = makeDeps();

      await useCase.execute(DEFAULT_INPUT);

      expect(extractionRepo.createSource).toHaveBeenCalledWith(
        expect.objectContaining({ documentSubtype: 'declaration' }),
      );
    });
  });

  describe('error handling', () => {
    it('updates document status to invalid and re-throws when Gemini fails', async () => {
      const { useCase, geminiService, documentRepo } = makeDeps();
      const geminiError = new Error('Gemini API timeout');
      geminiService.extract.mockRejectedValue(geminiError);

      await expect(useCase.execute(DEFAULT_INPUT)).rejects.toThrow('Gemini API timeout');

      expect(documentRepo.updateExtraction).toHaveBeenLastCalledWith(
        DEFAULT_INPUT.documentId,
        expect.objectContaining({ validationStatus: 'invalid' }),
      );
    });

    it('updates document status to invalid and re-throws when classifier fails', async () => {
      const { useCase, classifier, documentRepo } = makeDeps();
      classifier.classify.mockRejectedValue(new Error('PDF parse failed'));

      await expect(useCase.execute(DEFAULT_INPUT)).rejects.toThrow('PDF parse failed');

      expect(documentRepo.updateExtraction).toHaveBeenLastCalledWith(
        DEFAULT_INPUT.documentId,
        expect.objectContaining({ validationStatus: 'invalid' }),
      );
    });
  });
});
