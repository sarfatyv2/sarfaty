import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { COMMERCIAL_REPORT_REPOSITORY, type CommercialReportRepository } from '../domain/commercial-report.repository';
import { type VisitStatus, computeVisitStatusFromDate } from './visit-status.helper';

export interface ClientVisitDetail {
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

export interface CommercialRepVisitSummary {
  profileId: string;
  profileName: string | null;
  totalClients: number;
  onTrack: number;
  approaching: number;
  overdue: number;
  neverVisited: number;
  clients: ClientVisitDetail[];
}

export interface GetTeamOverviewInput {
  teamId?: string;
  regionId?: string;
  assignedTo?: string;
}

@Injectable()
export class GetTeamOverviewUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(COMMERCIAL_REPORT_REPOSITORY)
    private readonly commercialReportRepository: CommercialReportRepository,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async execute(input: GetTeamOverviewInput): Promise<CommercialRepVisitSummary[]> {
    const { clients } = await this.clientRepository.findByFilters({
      teamId: input.teamId,
      regionId: input.regionId,
      assignedTo: input.assignedTo,
      page: 1,
      pageSize: 5000,
      sortOrder: 'asc',
      sortBy: 'companyName',
    });

    if (clients.length === 0) return [];

    const clientIds = clients.map((c) => c.id);
    const latestVisitDates = await this.commercialReportRepository.findLatestVisitDateByClientIds(clientIds);

    const profileIds = [...new Set(clients.map((c) => c.assignedTo))];
    const profileNames = await this.fetchProfileNames(profileIds);

    const grouped = new Map<string, CommercialRepVisitSummary>();

    for (const client of clients) {
      const profileId = client.assignedTo;
      if (!grouped.has(profileId)) {
        grouped.set(profileId, {
          profileId,
          profileName: profileNames[profileId] ?? null,
          totalClients: 0,
          onTrack: 0,
          approaching: 0,
          overdue: 0,
          neverVisited: 0,
          clients: [],
        });
      }

      const summary = grouped.get(profileId)!;
      const lastVisitDate = latestVisitDates[client.id] ?? null;
      const { status, nextVisitDue, daysUntilDue, daysOverdue } = computeVisitStatusFromDate(lastVisitDate);

      summary.totalClients++;
      if (status === 'on_track') summary.onTrack++;
      else if (status === 'approaching') summary.approaching++;
      else if (status === 'overdue') summary.overdue++;
      else summary.neverVisited++;

      summary.clients.push({
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
      });
    }

    return [...grouped.values()].sort((a, b) =>
      (a.profileName ?? '').localeCompare(b.profileName ?? ''),
    );
  }

  private async fetchProfileNames(profileIds: string[]): Promise<Record<string, string>> {
    if (profileIds.length === 0) return {};
    const rows = await this.db
      .select({ id: profiles.id, fullName: profiles.fullName })
      .from(profiles)
      .where(inArray(profiles.id, profileIds));
    return Object.fromEntries(rows.map((r) => [r.id, r.fullName]));
  }
}
