export const FUNNEL_STAGES = [
  'prospecting',
  'documentation',
  'analysis',
  'approval',
  'approved',
  'active',
  'lost',
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export interface FunnelStageData {
  stage: FunnelStage;
  count: number;
  amount: string;
  percentage: number;
}

export interface PipelineMetrics {
  stages: FunnelStageData[];
  totalPipelineAmount: string;
  totalApprovedAmount: string;
  avgHoursToSubmit: number | null;
  avgHoursToApprove: number | null;
  conversionRate: number;
  activeCount: number;
}
