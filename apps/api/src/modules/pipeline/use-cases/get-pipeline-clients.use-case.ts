import { Inject, Injectable } from '@nestjs/common';
import type { ClientStatus, FunnelStage } from '@nexus/types';
import { PIPELINE_REPOSITORY, type PipelineRepository, type PipelineFilters, type PipelineClientRow } from '../domain/pipeline.repository';
import { FUNNEL_STAGE_STATUSES } from '@nexus/utils';

type StageClients = Record<FunnelStage, PipelineClientRow[]>;

@Injectable()
export class GetPipelineClientsUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: PipelineRepository,
  ) {}

  async execute(filters: PipelineFilters): Promise<StageClients> {
    const allClients = await this.pipelineRepository.getClients(filters);

    const stages: StageClients = {
      prospecting: [],
      documentation: [],
      analysis: [],
      approval: [],
      approved: [],
      active: [],
      lost: [],
    };

    for (const client of allClients) {
      const stage = this.getStage(client.status);
      stages[stage].push(client);
    }

    return stages;
  }

  private getStage(status: ClientStatus): FunnelStage {
    for (const [stage, statuses] of Object.entries(FUNNEL_STAGE_STATUSES) as [FunnelStage, ClientStatus[]][]) {
      if (statuses.includes(status)) return stage;
    }
    return 'lost';
  }
}
