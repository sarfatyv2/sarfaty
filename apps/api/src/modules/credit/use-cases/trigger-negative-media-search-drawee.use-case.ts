import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NegativeMediaAdapter } from '../bureaus/negative-media/negative-media.adapter';
import { NegativeMediaDraweeResultRepository, NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY } from '../domain/negative-media-drawee-result.repository';
import { NegativeMediaDraweeResult } from '../domain/negative-media-drawee-result.entity';
import { DraweeRepository, DRAWEE_REPOSITORY } from '../../drawees/domain/drawee.repository';

@Injectable()
export class TriggerNegativeMediaSearchDraweeUseCase {
  private readonly logger = new Logger(TriggerNegativeMediaSearchDraweeUseCase.name);

  constructor(
    @Inject(DRAWEE_REPOSITORY) private readonly draweeRepo: DraweeRepository,
    private readonly negativeMediaAdapter: NegativeMediaAdapter,
    @Inject(NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY) private readonly negativeMediaRepo: NegativeMediaDraweeResultRepository,
  ) {}

  async execute(draweeId: string) {
    const drawee = await this.draweeRepo.findById(draweeId);
    if (!drawee) {
      throw new NotFoundException(`Drawee ${draweeId} not found`);
    }

    if (!drawee.cnpj || !drawee.companyName) {
      throw new BadRequestException('Drawee must have CNPJ and company name to run negative media search');
    }

    this.logger.log(`Manual negative media search triggered for drawee ${draweeId}`);

    const result = await this.negativeMediaAdapter.search(
      drawee.companyName,
      drawee.cnpj,
      drawee.tradeName,
    );

    const entity = NegativeMediaDraweeResult.create({
      id: randomUUID(),
      draweeId,
      cnpj: drawee.cnpj,
      companyName: drawee.companyName,
      riskLevel: result.riskLevel,
      findingsCount: result.findingsCount,
      findings: result.findings as unknown as Record<string, unknown>[],
      summary: result.summary || null,
      groundingSources: result.groundingSources as unknown as Record<string, unknown>[],
      rawResponse: result.rawResponse,
    });

    await this.negativeMediaRepo.save(entity);

    return {
      id: entity.id,
      riskLevel: result.riskLevel,
      findingsCount: result.findingsCount,
      findings: result.findings.map((f) => ({
        category: f.category,
        title: f.title,
        snippet: f.snippet,
        sourceUrl: f.sourceUrl,
        sourceName: f.sourceName,
        date: f.date,
      })),
      summary: result.summary || null,
      groundingSources: result.groundingSources,
      queriedAt: entity.queriedAt.toISOString(),
    };
  }
}
