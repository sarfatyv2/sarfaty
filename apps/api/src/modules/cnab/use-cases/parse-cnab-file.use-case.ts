import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SPECIES_CODE_MAP } from '@nexus/types';
import type { CnabParsedDetail, CnabParseResult } from '@nexus/types';
import { CNAB_FILE_REPOSITORY, type CnabFileRepository } from '../domain/cnab-file.repository';
import { TRADE_RECEIVABLE_REPOSITORY, type TradeReceivableRepository } from '../domain/trade-receivable.repository';
import { CLIENT_DRAWEE_REPOSITORY, type ClientDraweeRepository } from '../domain/client-drawee.repository';
import { CnabFileNotFoundException } from '../domain/exceptions/cnab-file-not-found.exception';
import { UnsupportedBankException } from '../domain/exceptions/unsupported-bank.exception';
import { ClientNotMatchedException } from '../domain/exceptions/client-not-matched.exception';
import { TradeReceivableEntity } from '../domain/trade-receivable.entity';
import { CnabParserRegistry } from '../parser/cnab-parser.registry';
import { CLIENT_REPOSITORY, type ClientRepository } from '../../clients/domain/client.repository';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../../drawees/domain/drawee.repository';
import { Drawee } from '../../drawees/domain/drawee.entity';
import { DraweeCreatedEvent } from '../../drawees/domain/events/drawee-created.event';

function stripNonDigits(value: string): string {
  return value.replaceAll(/\D/g, '');
}

@Injectable()
export class ParseCnabFileUseCase {
  private readonly logger = new Logger(ParseCnabFileUseCase.name);

  constructor(
    @Inject(CNAB_FILE_REPOSITORY)
    private readonly cnabFileRepo: CnabFileRepository,
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly tradeReceivableRepo: TradeReceivableRepository,
    @Inject(CLIENT_DRAWEE_REPOSITORY)
    private readonly clientDraweeRepo: ClientDraweeRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepo: DraweeRepository,
    private readonly parserRegistry: CnabParserRegistry,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(cnabFileId: string, fileContent: string): Promise<{ totalParsed: number; errors: number }> {
    const cnabFile = await this.cnabFileRepo.findById(cnabFileId);
    if (!cnabFile) throw new CnabFileNotFoundException(cnabFileId);

    await this.cnabFileRepo.updateStatus(cnabFileId, 'processing');

    try {
      const bankCode = this.parserRegistry.detectBankCode(fileContent) ?? cnabFile.bankCode;
      const parser = this.parserRegistry.getParser(bankCode);
      if (!parser) throw new UnsupportedBankException(bankCode);

      const result = parser.parse(fileContent);

      let client = await this.clientRepo.findByCnpj(stripNonDigits(result.header.cedentCode));
      if (!client) {
        client = await this.clientRepo.findById(cnabFile.clientId);
        if (!client) throw new ClientNotMatchedException(result.header.cedentCode);
      }

      const { receivables, totalAmount } = await this.buildReceivables(result, client.id, cnabFileId);
      await this.tradeReceivableRepo.saveMany(receivables);

      const finalStatus = result.errors.length > 0 ? 'partially_processed' : 'processed';
      await this.cnabFileRepo.updateStatus(cnabFileId, finalStatus, {
        bankName: result.header.bankName,
        cedentCode: result.header.cedentCode,
        cedentName: result.header.cedentName,
        remittanceDate: result.header.remittanceDate || null,
        sequentialNumber: result.header.sequentialNumber,
        totalRecords: result.totalRecords,
        totalAmount: String(totalAmount),
        parsingErrors: result.errors.length > 0 ? result.errors : null,
        processedAt: new Date(),
      });

      return { totalParsed: result.totalRecords, errors: result.errors.length };
    } catch (err) {
      this.logger.error(`Failed to parse CNAB file ${cnabFileId}: ${(err as Error).message}`);
      await this.cnabFileRepo.updateStatus(cnabFileId, 'error', {
        parsingErrors: [{ line: 0, message: (err as Error).message }],
      });
      throw err;
    }
  }

  private async buildReceivables(
    result: CnabParseResult,
    clientId: string,
    cnabFileId: string,
  ): Promise<{ receivables: TradeReceivableEntity[]; totalAmount: number }> {
    const draweeCache = new Map<string, string>();
    const receivables: TradeReceivableEntity[] = [];
    let totalAmount = 0;

    for (const detail of result.details) {
      const draweeId = await this.resolveDrawee(detail, draweeCache);
      receivables.push(this.mapDetailToEntity(detail, clientId, draweeId, cnabFileId));
      totalAmount += detail.faceValue ?? 0;

      if (draweeId) {
        await this.clientDraweeRepo.upsert(
          clientId,
          draweeId,
          1,
          detail.faceValue ?? 0,
          detail.issueDate || new Date().toISOString().substring(0, 10),
        );
      }
    }

    return { receivables, totalAmount };
  }

  private mapDetailToEntity(
    detail: CnabParsedDetail,
    clientId: string,
    draweeId: string | null,
    cnabFileId: string,
  ): TradeReceivableEntity {
    const docType = SPECIES_CODE_MAP[detail.speciesCode] ?? 'duplicate';

    return TradeReceivableEntity.create({
      clientId,
      draweeId,
      cnabFileId,
      documentNumber: detail.documentNumber || null,
      ourNumber: detail.ourNumber || null,
      documentType: docType,
      speciesCode: detail.speciesCode || null,
      issueDate: detail.issueDate || null,
      dueDate: detail.dueDate || null,
      faceValue: detail.faceValue ? String(detail.faceValue) : null,
      interestPerDay: detail.interestPerDay ? String(detail.interestPerDay) : null,
      discountValue: detail.discountValue ? String(detail.discountValue) : null,
      discountDeadline: detail.discountDeadline || null,
      penaltyValue: detail.penaltyValue ? String(detail.penaltyValue) : null,
      iofValue: detail.iofValue ? String(detail.iofValue) : null,
      acceptance: detail.acceptance || null,
      instruction1: detail.instruction1 || null,
      instruction2: detail.instruction2 || null,
      draweeDocType: detail.draweeDocType || null,
      draweeDoc: detail.draweeDoc || null,
      draweeName: detail.draweeName || null,
      draweeAddress: detail.draweeAddress || null,
      draweeNeighborhood: detail.draweeNeighborhood || null,
      draweeZip: detail.draweeZip || null,
      draweeCity: detail.draweeCity || null,
      draweeState: detail.draweeState || null,
      draweeEmail: detail.draweeEmail || null,
      bankCode: detail.bankCode || null,
      branch: detail.branch || null,
      portfolioCode: detail.portfolioCode || null,
      status: 'pending',
      portfolioPositionId: null,
      cnabRecordSequence: detail.recordSequence,
      rawLine: detail.rawLine || null,
    });
  }

  private async resolveDrawee(detail: CnabParsedDetail, cache: Map<string, string>): Promise<string | null> {
    const doc = detail.draweeDoc ? stripNonDigits(detail.draweeDoc) : '';
    if (!doc) return null;

    const cached = cache.get(doc);
    if (cached) return cached;

    const isCompany = detail.draweeDocType === 'cnpj';
    const existing = isCompany
      ? await this.draweeRepo.findByCnpj(doc)
      : await this.draweeRepo.findByCpf(doc);

    if (existing) {
      cache.set(doc, existing.id);
      return existing.id;
    }

    const newDrawee = Drawee.create({
      personType: isCompany ? 'company' : 'individual',
      companyName: detail.draweeName || 'DESCONHECIDO',
      tradeName: null,
      legalName: null,
      cnpj: isCompany ? doc : null,
      cnpjRoot: isCompany ? doc.substring(0, 8) : null,
      cpf: isCompany ? null : doc,
      rg: null,
      birthDate: null,
      gender: null,
      rgDocumentId: null,
      cnhDocumentId: null,
      isPep: false,
      isOfacListed: false,
      riskRating: null,
      creditScore: null,
      assignedTo: null,
      segmentId: null,
      economicGroupId: null,
      status: 'active',
      blockedAt: null,
      blockReason: null,
      legacySgsId: null,
      legacyNfId: null,
    });

    const saved = await this.draweeRepo.save(newDrawee);
    cache.set(doc, saved.id);
    this.logger.log(`Auto-created drawee ${doc} (${detail.draweeName})`);

    this.eventEmitter.emit(DraweeCreatedEvent.EVENT_NAME, new DraweeCreatedEvent(saved.id));

    return saved.id;
  }
}
