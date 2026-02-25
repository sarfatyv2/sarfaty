import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IrpfClassifierService } from '../../src/modules/clients/infra/irpf-classifier.service';

const DUMMY_BUFFER = Buffer.from('fake-pdf');

function buildService(extractedText: string): IrpfClassifierService {
  const service = new IrpfClassifierService();
  // Spy on the private method to avoid depending on pdf-parse internals
  vi.spyOn(service as unknown as { extractTextLayer: (b: Buffer) => Promise<string> }, 'extractTextLayer')
    .mockResolvedValue(extractedText);
  return service;
}

describe('IrpfClassifierService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classify()', () => {
    it('classifies as receipt when only receipt anchor is present', async () => {
      const service = buildService(
        'RECIBO DE ENTREGA\nNúmero: 12345\nData: 01/01/2025',
      );
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('receipt');
      expect(result.label).toBe('Recibo de Entrega');
    });

    it('classifies as declaration when only declaration anchor is present', async () => {
      const service = buildService(
        'DECLARAÇÃO DE AJUSTE ANUAL\nExercício 2025 — Ano-Calendário 2024',
      );
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('declaration');
      expect(result.label).toBe('Declaração de Ajuste Anual');
    });

    it('classifies as declaration when ASCII variant anchor is present', async () => {
      const service = buildService(
        'DECLARACAO DE AJUSTE ANUAL\nExercício 2025 — Ano-Calendário 2024',
      );
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('declaration');
    });

    it('classifies as both when both anchors are present', async () => {
      const service = buildService(
        'DECLARAÇÃO DE AJUSTE ANUAL\nExercício 2025\nRECIBO DE ENTREGA\nNúmero: 99',
      );
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('both');
      expect(result.label).toBe('Recibo de Entrega + Declaração de Ajuste Anual');
    });

    it('classifies as unknown when no anchor is present', async () => {
      const service = buildService(
        'Documento fiscal brasileiro sem identificação clara.',
      );
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('unknown');
    });

    it('classifies as unknown when extracted text is empty', async () => {
      const service = buildService('');
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('unknown');
    });

    it('sets hasNativeText to true when text length >= 100 chars', async () => {
      const longText = 'RECIBO DE ENTREGA ' + 'x'.repeat(100);
      const service = buildService(longText);
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.hasNativeText).toBe(true);
    });

    it('sets hasNativeText to false when text length < 100 chars', async () => {
      const service = buildService('RECIBO DE ENTREGA curto');
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.hasNativeText).toBe(false);
    });

    it('returns unknown and hasNativeText false when pdf text extraction fails (returns empty)', async () => {
      // extractTextLayer has an internal try/catch: on error it returns ''.
      // Simulate that outcome by resolving with empty string.
      const service = buildService('');
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('unknown');
      expect(result.hasNativeText).toBe(false);
    });

    it('classification is case-insensitive (lowercase source)', async () => {
      const service = buildService('recibo de entrega\nnúmero: 1');
      const result = await service.classify(DUMMY_BUFFER);
      expect(result.type).toBe('receipt');
    });
  });
});
