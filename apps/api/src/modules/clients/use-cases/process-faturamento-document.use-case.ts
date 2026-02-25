import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ClientStorageService } from '../infra/client-storage.service';
import { FaturamentoGeminiService } from '../infra/gemini/faturamento-gemini.service';
import { FaturamentoValidatorService } from '../infra/faturamento-validator.service';
import { FaturamentoUnifierService } from '../infra/faturamento-unifier.service';
import {
  FATURAMENTO_EXTRACTION_REPOSITORY,
  type FaturamentoExtractionRepository,
} from '../domain/faturamento-extraction.repository';
import {
  CLIENT_DOCUMENT_REPOSITORY,
  type ClientDocumentRepository,
} from '../domain/client-document.repository';
import type { FaturamentoExtractionProps } from '../domain/faturamento-extraction.entity';
import type { FaturamentoRawExtraction } from '@nexus/validators';

export interface ProcessFaturamentoInput {
  documentId: string;
  clientId: string;
  storagePath: string;
  mimeType: string;
  referenceYear: number | null;
}

@Injectable()
export class ProcessFaturamentoDocumentUseCase {
  private readonly logger = new Logger(ProcessFaturamentoDocumentUseCase.name);

  constructor(
    private readonly storageService: ClientStorageService,
    private readonly geminiService: FaturamentoGeminiService,
    private readonly validator: FaturamentoValidatorService,
    private readonly unifier: FaturamentoUnifierService,
    @Inject(FATURAMENTO_EXTRACTION_REPOSITORY)
    private readonly extractionRepo: FaturamentoExtractionRepository,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepo: ClientDocumentRepository,
  ) {}

  async execute(input: ProcessFaturamentoInput): Promise<FaturamentoExtractionProps[]> {
    this.logger.log(`Processing faturamento document ${input.documentId} for client ${input.clientId}`);

    // 1. Download file
    const fileBuffer = await this.storageService.downloadDocument(input.storagePath);
    const fileHash = createHash('sha256').update(fileBuffer).digest('hex');

    // 2. Idempotency: skip if already processed (returns all records for multi-year documents)
    const alreadyProcessed = await this.extractionRepo.findAllByFileHash(fileHash);
    if (alreadyProcessed.length > 0) {
      this.logger.log(`Document ${input.documentId} already processed (hash: ${fileHash}, ${alreadyProcessed.length} record(s)). Skipping.`);
      return alreadyProcessed;
    }

    // 3. Update document status to processing
    await this.documentRepo.updateExtraction(input.documentId, {
      extractedData: null,
      validationStatus: 'processing',
      validatedAt: new Date(),
    });

    try {
      // 4. Extract via Gemini — returns one item per year found in the document
      const rawExtractions = await this.geminiService.extract(fileBuffer, input.mimeType);
      this.logger.log(`Gemini extracted ${rawExtractions.length} record(s) from document ${input.documentId}`);

      // 5. Process each extraction (one per year)
      const persisted: FaturamentoExtractionProps[] = [];
      for (const rawExtraction of rawExtractions) {
        const result = await this.processOneExtraction(rawExtraction, input, fileHash);
        if (result) persisted.push(result);
      }

      if (persisted.length === 0) {
        throw new Error('No valid extraction could be produced from the document');
      }

      // 6. Update original document validation status based on worst-case result
      const anyNeedsReview = persisted.some((p) => p.needsReview);
      const finalStatus = anyNeedsReview ? 'needs_review' : 'valid';
      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: rawExtractions,
        validationStatus: finalStatus,
        validatedAt: new Date(),
      });

      this.logger.log(`Faturamento: ${persisted.length} record(s) persisted. Status: ${finalStatus}`);
      return persisted;
    } catch (error) {
      this.logger.error(`Faturamento extraction failed for document ${input.documentId}`, error);

      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: null,
        validationStatus: 'invalid',
        validatedAt: new Date(),
      });

      throw error;
    }
  }

  private async processOneExtraction(
    rawExtraction: FaturamentoRawExtraction,
    input: ProcessFaturamentoInput,
    fileHash: string,
  ): Promise<FaturamentoExtractionProps | null> {
    const validationResult = this.validator.validate(rawExtraction);

    const cnpj = rawExtraction.cnpj ?? `doc:${input.documentId}`;
    const year = rawExtraction.year ?? input.referenceYear ?? new Date().getFullYear();

    const existing = rawExtraction.cnpj
      ? await this.extractionRepo.findByCnpjAndYear(cnpj, year)
      : null;

    const canonicalData = this.unifier.buildCanonical(
      {
        clientId: input.clientId,
        documentId: input.documentId,
        referenceYear: input.referenceYear,
        validationResult,
      },
      existing,
    );

    const persistedRecord = await this.extractionRepo.upsert(canonicalData);

    await this.extractionRepo.createSource({
      extractionId: persistedRecord.id,
      documentId: input.documentId,
      fileHash,
      pageCount: null,
      ocrApplied: false,
      ocrQuality: null,
    });

    this.logger.log(`Persisted extraction ${persistedRecord.id} for CNPJ ${cnpj} / year ${year}`);
    return persistedRecord;
  }
}
