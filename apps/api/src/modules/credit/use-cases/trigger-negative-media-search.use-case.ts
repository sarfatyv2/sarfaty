import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NegativeMediaAdapter } from '../bureaus/negative-media/negative-media.adapter';
import { NegativeMediaRepository, NEGATIVE_MEDIA_REPOSITORY } from '../domain/negative-media.repository';
import { NegativeMediaResult } from '../domain/negative-media-result.entity';
import { ClientRepository, CLIENT_REPOSITORY } from '../../clients/domain/client.repository';

@Injectable()
export class TriggerNegativeMediaSearchUseCase {
  private readonly logger = new Logger(TriggerNegativeMediaSearchUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly negativeMediaAdapter: NegativeMediaAdapter,
    @Inject(NEGATIVE_MEDIA_REPOSITORY) private readonly negativeMediaRepo: NegativeMediaRepository,
  ) {}

  async execute(clientId: string) {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    if (!client.cnpj || !client.companyName) {
      throw new BadRequestException('Client must have CNPJ and company name to run negative media search');
    }

    this.logger.log(`Manual negative media search triggered for client ${clientId}`);

    const result = await this.negativeMediaAdapter.search(client.companyName, client.cnpj, client.tradeName);

    const entity = NegativeMediaResult.create({
      id: randomUUID(),
      clientId,
      cnpj: client.cnpj,
      companyName: client.companyName,
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
