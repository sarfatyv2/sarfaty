import { Injectable } from '@nestjs/common';
import type { IrpfConflict } from '@nexus/types';
import type { IrpfExtractionProps } from '../domain/irpf-extraction.entity';
import type { IrpfValidationResult } from './irpf-validator.service';
import type { IrpfClassification } from './irpf-classifier.service';
import { buildInitialCanonical } from './irpf-canonical-builder';
import { runMergePipeline } from './irpf-merge-helpers';

export interface IrpfUnifyInput {
  clientId: string;
  authorizedPersonId: string | null;
  documentId: string;
  partnerName: string | null;
  referenceYear: number | null;
  classification: IrpfClassification;
  validationResult: IrpfValidationResult;
}

type CanonicalData = Omit<IrpfExtractionProps, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class IrpfUnifierService {
  buildCanonical(input: IrpfUnifyInput, existing: IrpfExtractionProps | null): CanonicalData {
    const { validationResult, classification } = input;
    const incoming = validationResult.data;

    if (!existing) {
      return buildInitialCanonical(input, incoming, validationResult);
    }

    return this.mergeWithExisting(existing, input, classification);
  }

  private mergeWithExisting(
    existing: IrpfExtractionProps,
    input: IrpfUnifyInput,
    classification: IrpfClassification,
  ): CanonicalData {
    const previousConflicts = (existing.conflicts as IrpfConflict[]) ?? [];
    const existingRecord = existing as unknown as Record<string, unknown>;

    const { merged, conflicts } = runMergePipeline(
      existingRecord,
      input.validationResult.data,
      classification,
      previousConflicts,
    );

    const needsReview = conflicts.some((c) => c.needsReview) || !input.validationResult.isValid;
    const previousLog = (existing.extractionLog as Record<string, unknown>) ?? {};

    const result: Record<string, unknown> = {
      ...merged,
      conflicts,
      needsReview,
      extractionStatus: needsReview ? 'needs_review' : 'completed',
      extractionConfidence: input.validationResult.confidence,
      extractionLog: {
        ...previousLog,
        lastMerge: {
          documentSubtype: classification.type,
          warnings: input.validationResult.warnings,
          conflictsAdded: conflicts.length,
        },
      },
    };

    return result as unknown as CanonicalData;
  }
}
