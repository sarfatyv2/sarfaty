import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ClientStorageService } from '../infra/client-storage.service';
import { IrpfClassifierService } from '../infra/irpf-classifier.service';
import { IrpfGeminiService, type IrpfExtractionContext } from '../infra/gemini/irpf-gemini.service';
import { IrpfValidatorService } from '../infra/irpf-validator.service';
import { IrpfUnifierService } from '../infra/irpf-unifier.service';
import {
  IRPF_EXTRACTION_REPOSITORY,
  type IrpfExtractionRepository,
} from '../domain/irpf-extraction.repository';
import {
  CLIENT_DOCUMENT_REPOSITORY,
  type ClientDocumentRepository,
} from '../domain/client-document.repository';
import type { IrpfExtractionProps } from '../domain/irpf-extraction.entity';

const CURRENT_YEAR = new Date().getFullYear();

function normalizeNameForComparison(name: string): string {
  return name
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function countWordMatches(normalizedExtracted: string, expectedWords: string[]): number {
  return expectedWords.filter((word) => normalizedExtracted.includes(word)).length;
}

function namesMatch(extracted: string | null, expected: string | null): boolean {
  if (!extracted || !expected) return true;
  const normalizedExtracted = normalizeNameForComparison(extracted);
  const normalizedExpected = normalizeNameForComparison(expected);
  // Accept if at least 2 significant words from the expected name appear in the extracted name
  const expectedWords = normalizedExpected.split(' ').filter((w) => w.length > 2);
  const matchCount = countWordMatches(normalizedExtracted, expectedWords);
  return matchCount >= Math.min(2, expectedWords.length);
}

interface IdentityCheckResult {
  rejected: boolean;
  rejectionReason: string;
  fullName: string | null;
  exerciseYear: number | null;
}

function checkIdentityMismatch(
  extractedName: string | null,
  extractedYear: number | null,
  expectedPartnerName: string | null,
  expectedYears: number[],
): IdentityCheckResult {
  const yearMismatch = extractedYear !== null && !expectedYears.includes(extractedYear);
  const nameMismatch =
    expectedPartnerName !== null &&
    extractedName !== null &&
    !namesMatch(extractedName, expectedPartnerName);

  if (!nameMismatch && !yearMismatch) {
    return { rejected: false, rejectionReason: '', fullName: extractedName, exerciseYear: extractedYear };
  }

  const reasons: string[] = [];
  if (nameMismatch) {
    reasons.push(
      `o contribuinte '${extractedName}' não corresponde ao sócio esperado '${expectedPartnerName}'`,
    );
  }
  if (yearMismatch) {
    reasons.push(
      `o ano de exercício ${extractedYear} não está na lista esperada [${expectedYears.join(', ')}]`,
    );
  }

  return {
    rejected: true,
    rejectionReason: `Documento rejeitado: ${reasons.join(' e ')}.`,
    fullName: extractedName,
    exerciseYear: extractedYear,
  };
}

export interface ProcessIrpfInput {
  documentId: string;
  clientId: string;
  storagePath: string;
  authorizedPersonId: string | null;
  partnerName: string | null;
  referenceYear: number | null;
}

@Injectable()
export class ProcessIrpfDocumentUseCase {
  private readonly logger = new Logger(ProcessIrpfDocumentUseCase.name);

  constructor(
    private readonly storageService: ClientStorageService,
    private readonly classifier: IrpfClassifierService,
    private readonly geminiService: IrpfGeminiService,
    private readonly validator: IrpfValidatorService,
    private readonly unifier: IrpfUnifierService,
    @Inject(IRPF_EXTRACTION_REPOSITORY)
    private readonly extractionRepo: IrpfExtractionRepository,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepo: ClientDocumentRepository,
  ) {}

  async execute(input: ProcessIrpfInput): Promise<IrpfExtractionProps> {
    this.logger.log(`Processing IRPF document ${input.documentId} for client ${input.clientId}`);

    try {
      // 1. Download PDF
      const pdfBuffer = await this.storageService.downloadDocument(input.storagePath);
      const fileHash = createHash('sha256').update(pdfBuffer).digest('hex');

      // 2. Idempotency: skip re-extraction if already processed, but still validate identity
      const alreadyProcessed = await this.extractionRepo.findByFileHash(fileHash);
      if (alreadyProcessed) {
        this.logger.log(`Document ${input.documentId} already processed (hash: ${fileHash}). Validating identity before skipping.`);

        const expectedYearsForCache = input.referenceYear
          ? [input.referenceYear]
          : [CURRENT_YEAR - 1, CURRENT_YEAR - 2];

        const cacheCheck = checkIdentityMismatch(
          alreadyProcessed.fullName,
          alreadyProcessed.exerciseYear,
          input.partnerName,
          expectedYearsForCache,
        );

        if (cacheCheck.rejected) {
          this.logger.warn(`Identity mismatch (cached) for document ${input.documentId}: ${cacheCheck.rejectionReason}`);
          await this.documentRepo.updateExtraction(input.documentId, {
            extractedData: { _rejectionReason: cacheCheck.rejectionReason, fullName: cacheCheck.fullName, exerciseYear: cacheCheck.exerciseYear },
            validationStatus: 'invalid',
            validatedAt: new Date(),
          });
          throw new Error(cacheCheck.rejectionReason);
        }

        // Still resolve the current document's status — same file, same result
        const cachedFinalStatus = alreadyProcessed.needsReview ? 'needs_review' : 'valid';
        await this.documentRepo.updateExtraction(input.documentId, {
          extractedData: null,
          validationStatus: cachedFinalStatus,
          validatedAt: new Date(),
        });

        return alreadyProcessed;
      }

      // 3. Update document status to processing
      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: null,
        validationStatus: 'processing',
        validatedAt: new Date(),
      });

      // 4. Classify document type
      const classification = await this.classifier.classify(pdfBuffer);
      this.logger.log(`Document classified as: ${classification.type}`);

      // 5. Build extraction context and extract via Gemini
      const expectedExerciseYears = input.referenceYear
        ? [input.referenceYear]
        : [CURRENT_YEAR - 1, CURRENT_YEAR - 2];

      const extractionContext: IrpfExtractionContext = {
        expectedPartnerName: input.partnerName,
        expectedExerciseYears,
      };

      const rawExtraction = await this.geminiService.extract(pdfBuffer, classification, extractionContext);

      // 6. Validate document identity: reject early if name or year does not match
      const identityCheck = checkIdentityMismatch(
        rawExtraction.fullName,
        rawExtraction.exerciseYear,
        input.partnerName,
        expectedExerciseYears,
      );

      if (identityCheck.rejected) {
        this.logger.warn(`Identity mismatch for document ${input.documentId}: ${identityCheck.rejectionReason}`);
        await this.documentRepo.updateExtraction(input.documentId, {
          extractedData: { _rejectionReason: identityCheck.rejectionReason, fullName: identityCheck.fullName, exerciseYear: identityCheck.exerciseYear },
          validationStatus: 'invalid',
          validatedAt: new Date(),
        });
        throw new Error(identityCheck.rejectionReason);
      }

      // 7. Validate (Zod + business rules)
      const validationResult = this.validator.validate(rawExtraction);

      // 8. Find existing canonical record for this CPF + exercise year
      const cpf = rawExtraction.cpf ?? '';
      const exerciseYear = rawExtraction.exerciseYear ?? input.referenceYear ?? 0;
      const existing = cpf
        ? await this.extractionRepo.findByCpfAndExercise(cpf, exerciseYear)
        : null;

      // 9. Unify (create or merge)
      const canonicalData = this.unifier.buildCanonical(
        {
          clientId: input.clientId,
          authorizedPersonId: input.authorizedPersonId,
          documentId: input.documentId,
          partnerName: input.partnerName,
          referenceYear: input.referenceYear,
          classification,
          validationResult,
        },
        existing,
      );

      // 10. Persist canonical record (upsert)
      const persisted = await this.extractionRepo.upsert(canonicalData);

      // 11. Register source document for audit trail
      await this.extractionRepo.createSource({
        extractionId: persisted.id,
        documentId: input.documentId,
        documentSubtype: classification.type === 'receipt' || classification.type === 'declaration'
          ? classification.type
          : 'unknown',
        fileHash,
        pageCount: null,
        ocrApplied: !classification.hasNativeText,
        ocrQuality: null,
      });

      // 12. Update original document validation status
      const finalStatus = persisted.needsReview ? 'needs_review' : 'valid';
      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: rawExtraction,
        validationStatus: finalStatus,
        validatedAt: new Date(),
      });

      this.logger.log(`IRPF extraction ${persisted.id} completed. Status: ${finalStatus}`);
      return persisted;
    } catch (error) {
      const isIdentityRejection = error instanceof Error &&
        (error.message.startsWith('Documento rejeitado:'));

      if (!isIdentityRejection) {
        this.logger.error(`IRPF extraction failed for document ${input.documentId}`, error);
        await this.documentRepo.updateExtraction(input.documentId, {
          extractedData: null,
          validationStatus: 'invalid',
          validatedAt: new Date(),
        });
      }

      throw error;
    }
  }
}
