import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { COMMERCIAL_REPORT_REPOSITORY, type CommercialReportRepository } from '../domain/commercial-report.repository';
import { computeVisitStatusFromDate, type VisitStatus } from './visit-status.helper';

export type { VisitStatus } from './visit-status.helper';

export interface ClientVisitSummary {
  clientId: string;
  companyName: string;
  tradeName: string | null;
  cnpj: string | null;
  clientStatus: string;
  lastVisitDate: string | null;
  nextVisitDue: string | null;
  visitStatus: VisitStatus;
  daysUntilDue: number | null;
  daysOverdue: number | null;
}

export interface GetVisitsOverviewInput {
  assignedTo?: string;
  statusFilter?: VisitStatus;
}

@Injectable()
export class GetVisitsOverviewUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(COMMERCIAL_REPORT_REPOSITORY)
    private readonly commercialReportRepository: CommercialReportRepository,
  ) {}

  async execute(input: GetVisitsOverviewInput): Promise<ClientVisitSummary[]> {
    const { clients } = await this.clientRepository.findByFilters({
      assignedTo: input.assignedTo,
      page: 1,
      pageSize: 1000,
      sortOrder: 'asc',
      sortBy: 'companyName',
    });

    if (clients.length === 0) return [];

    const clientIds = clients.map((c) => c.id);
    const latestVisitDates = await this.commercialReportRepository.findLatestVisitDateByClientIds(clientIds);

    const summaries: ClientVisitSummary[] = clients.map((client) => {
      const lastVisitDate = latestVisitDates[client.id] ?? null;
      const { status, nextVisitDue, daysUntilDue, daysOverdue } = computeVisitStatusFromDate(lastVisitDate);
      return {
        clientId: client.id,
        companyName: client.companyName,
        tradeName: client.tradeName ?? null,
        cnpj: client.cnpj ?? null,
        clientStatus: client.status,
        lastVisitDate,
        nextVisitDue,
        visitStatus: status,
        daysUntilDue,
        daysOverdue,
      };
    });

    if (input.statusFilter) {
      return summaries.filter((s) => s.visitStatus === input.statusFilter);
    }

    return summaries.sort((a, b) => {
      const statusOrder: Record<VisitStatus, number> = {
        overdue: 0,
        approaching: 1,
        never_visited: 2,
        on_track: 3,
      };
      return statusOrder[a.visitStatus] - statusOrder[b.visitStatus];
    });
  }
}
