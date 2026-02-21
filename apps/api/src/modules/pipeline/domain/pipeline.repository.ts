import type { ClientStatus } from '@nexus/types';

export const PIPELINE_REPOSITORY = Symbol('PIPELINE_REPOSITORY');

export interface PipelineClientRow {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  requestedAmount: string | null;
  approvedAmount: string | null;
  status: ClientStatus;
  assignedTo: string;
  teamId: string | null;
  regionId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt: Date | null;
}

export interface PipelineFilters {
  assignedTo?: string;
  teamId?: string;
  regionId?: string;
  segmentId?: string;
}

export interface MetricsRow {
  countProspecting: number;
  countDocumentation: number;
  countAnalysis: number;
  countApproval: number;
  countApproved: number;
  countActive: number;
  countLost: number;
  countTotal: number;
  totalPipelineAmount: string;
  totalApprovedAmount: string;
  avgHoursToSubmit: number | null;
  avgHoursToApprove: number | null;
}

export interface PipelineRepository {
  getClients(filters: PipelineFilters): Promise<PipelineClientRow[]>;
  getMetrics(filters: PipelineFilters): Promise<MetricsRow>;
}
