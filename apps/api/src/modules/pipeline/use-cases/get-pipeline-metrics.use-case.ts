import { Inject, Injectable } from '@nestjs/common';
import type { PipelineMetrics, FunnelStageData } from '@nexus/types';
import { PIPELINE_REPOSITORY, type PipelineRepository, type PipelineFilters } from '../domain/pipeline.repository';

@Injectable()
export class GetPipelineMetricsUseCase {
  constructor(
    @Inject(PIPELINE_REPOSITORY)
    private readonly pipelineRepository: PipelineRepository,
  ) {}

  async execute(filters: PipelineFilters): Promise<PipelineMetrics> {
    const row = await this.pipelineRepository.getMetrics(filters);
    const total = Number(row.countTotal) || 1;

    const stages: FunnelStageData[] = [
      { stage: 'prospecting', count: Number(row.countProspecting), amount: '0', percentage: Math.round((Number(row.countProspecting) / total) * 100) },
      { stage: 'documentation', count: Number(row.countDocumentation), amount: '0', percentage: Math.round((Number(row.countDocumentation) / total) * 100) },
      { stage: 'analysis', count: Number(row.countAnalysis), amount: '0', percentage: Math.round((Number(row.countAnalysis) / total) * 100) },
      { stage: 'approval', count: Number(row.countApproval), amount: '0', percentage: Math.round((Number(row.countApproval) / total) * 100) },
      { stage: 'approved', count: Number(row.countApproved), amount: '0', percentage: Math.round((Number(row.countApproved) / total) * 100) },
      { stage: 'active', count: Number(row.countActive), amount: '0', percentage: Math.round((Number(row.countActive) / total) * 100) },
      { stage: 'lost', count: Number(row.countLost), amount: '0', percentage: Math.round((Number(row.countLost) / total) * 100) },
    ];

    const approvedPlusActive = Number(row.countApproved) + Number(row.countActive);
    const totalExcludingLost = total - Number(row.countLost);
    const conversionRate = totalExcludingLost > 0
      ? Math.round((approvedPlusActive / totalExcludingLost) * 100)
      : 0;

    return {
      stages,
      totalPipelineAmount: row.totalPipelineAmount,
      totalApprovedAmount: row.totalApprovedAmount,
      avgHoursToSubmit: row.avgHoursToSubmit ? Math.round(row.avgHoursToSubmit * 10) / 10 : null,
      avgHoursToApprove: row.avgHoursToApprove ? Math.round(row.avgHoursToApprove * 10) / 10 : null,
      conversionRate,
      activeCount: Number(row.countActive),
    };
  }
}
