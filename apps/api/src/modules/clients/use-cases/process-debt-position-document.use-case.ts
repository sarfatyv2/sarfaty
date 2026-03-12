import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientStorageService } from '../infra/client-storage.service';
import { DebtPositionGeminiService } from '../infra/gemini/debt-position-gemini.service';
import {
  DEBT_POSITION_ITEM_REPOSITORY,
  type DebtPositionItemRepository,
} from '../domain/debt-position-item.repository';
import {
  CLIENT_DOCUMENT_REPOSITORY,
  type ClientDocumentRepository,
} from '../domain/client-document.repository';
import type { DebtPositionItemProps } from '../domain/debt-position-item.entity';
import type { DebtPositionRawItem } from '@nexus/validators';

export interface ProcessDebtPositionInput {
  documentId: string;
  clientId: string;
  storagePath: string;
  mimeType: string;
}

@Injectable()
export class ProcessDebtPositionDocumentUseCase {
  private readonly logger = new Logger(ProcessDebtPositionDocumentUseCase.name);

  constructor(
    private readonly storageService: ClientStorageService,
    private readonly geminiService: DebtPositionGeminiService,
    @Inject(DEBT_POSITION_ITEM_REPOSITORY)
    private readonly repo: DebtPositionItemRepository,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepo: ClientDocumentRepository,
  ) {}

  async execute(input: ProcessDebtPositionInput): Promise<DebtPositionItemProps[]> {
    this.logger.log(`Processing debt position document ${input.documentId} for client ${input.clientId}`);

    try {
      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: null,
        validationStatus: 'processing',
        validatedAt: new Date(),
      });

      const fileBuffer = await this.storageService.downloadDocument(input.storagePath);

      const rawItems = await this.geminiService.extract(fileBuffer, input.mimeType);
      this.logger.log(`Gemini extracted ${rawItems.length} debt item(s) from document ${input.documentId}`);

      // Delete any previously AI-extracted items for this document to avoid duplicates on reprocess
      await this.repo.deleteByDocumentId(input.documentId);

      const persisted: DebtPositionItemProps[] = [];

      if (rawItems.length === 0) {
        await this.documentRepo.updateExtraction(input.documentId, {
          extractedData: [],
          validationStatus: 'needs_review',
          validatedAt: new Date(),
        });
        this.logger.log(`No debt items found — document marked as needs_review`);
        return persisted;
      }

      for (const rawItem of rawItems) {
        const item = await this.persistItem(rawItem, input);
        persisted.push(item);
      }

      const anyLowConfidence = rawItems.some((r) => r.confidence === 'low');
      const finalStatus = anyLowConfidence ? 'needs_review' : 'valid';

      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: rawItems,
        validationStatus: finalStatus,
        validatedAt: new Date(),
      });

      this.logger.log(`DebtPosition: ${persisted.length} item(s) persisted. Status: ${finalStatus}`);
      return persisted;
    } catch (error) {
      this.logger.error(`Debt position extraction failed for document ${input.documentId}`, error);

      await this.documentRepo.updateExtraction(input.documentId, {
        extractedData: null,
        validationStatus: 'invalid',
        validatedAt: new Date(),
      });

      throw error;
    }
  }

  private async persistItem(
    rawItem: DebtPositionRawItem,
    input: ProcessDebtPositionInput,
  ): Promise<DebtPositionItemProps> {
    return this.repo.create({
      clientId: input.clientId,
      documentId: input.documentId,
      institution: rawItem.institution ?? 'Não identificada',
      modality: rawItem.modality,
      guarantee: rawItem.guarantee,
      guaranteePercentage: rawItem.guaranteePercentage == null ? null : String(rawItem.guaranteePercentage),
      value: rawItem.value == null ? '0' : String(rawItem.value),
      notes: null,
      source: 'ai',
      extractionConfidence: rawItem.confidence,
      isAiGenerated: true,
    });
  }
}
