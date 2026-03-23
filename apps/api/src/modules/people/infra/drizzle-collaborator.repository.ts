import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, or, count, asc, desc, and, inArray, isNotNull, ne, type SQL } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { collaborators } from '../../../database/schema/collaborators';
import { profiles } from '../../../database/schema/profiles';
import { collaboratorCltData } from '../../../database/schema/collaborator-clt-data';
import { collaboratorPjData } from '../../../database/schema/collaborator-pj-data';
import type {
  CollaboratorRepository,
  CollaboratorFilters,
  PaginatedCollaborators,
} from '../domain/collaborator.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorMapper } from './mappers/collaborator.mapper';

@Injectable()
export class DrizzleCollaboratorRepository implements CollaboratorRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Collaborator | null> {
    const rows = await this.db
      .select()
      .from(collaborators)
      .where(eq(collaborators.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const [cltRow] = await this.db
      .select()
      .from(collaboratorCltData)
      .where(eq(collaboratorCltData.collaboratorId, id))
      .limit(1);

    const [pjRow] = await this.db
      .select()
      .from(collaboratorPjData)
      .where(eq(collaboratorPjData.collaboratorId, id))
      .limit(1);

    return CollaboratorMapper.toDomain(row, cltRow ?? null, pjRow ?? null);
  }

  async findByIds(ids: string[]): Promise<Collaborator[]> {
    if (ids.length === 0) {
      return [];
    }
    const uniqueIds = [...new Set(ids)];
    const rows = await this.db
      .select()
      .from(collaborators)
      .where(inArray(collaborators.id, uniqueIds));

    if (rows.length === 0) {
      return [];
    }

    const cltRows = await this.db
      .select()
      .from(collaboratorCltData)
      .where(inArray(collaboratorCltData.collaboratorId, uniqueIds));
    const pjRows = await this.db
      .select()
      .from(collaboratorPjData)
      .where(inArray(collaboratorPjData.collaboratorId, uniqueIds));

    const cltByCollaboratorId = new Map(cltRows.map((r) => [r.collaboratorId, r]));
    const pjByCollaboratorId = new Map(pjRows.map((r) => [r.collaboratorId, r]));

    return rows.map((row) =>
      CollaboratorMapper.toDomain(
        row,
        cltByCollaboratorId.get(row.id) ?? null,
        pjByCollaboratorId.get(row.id) ?? null,
      ),
    );
  }

  async findByProfileId(profileId: string): Promise<Collaborator | null> {
    const rows = await this.db
      .select()
      .from(collaborators)
      .where(eq(collaborators.profileId, profileId))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const [cltRow] = await this.db
      .select()
      .from(collaboratorCltData)
      .where(eq(collaboratorCltData.collaboratorId, row.id))
      .limit(1);

    const [pjRow] = await this.db
      .select()
      .from(collaboratorPjData)
      .where(eq(collaboratorPjData.collaboratorId, row.id))
      .limit(1);

    return CollaboratorMapper.toDomain(row, cltRow ?? null, pjRow ?? null);
  }

  async findByCpfs(cpfs: string[]): Promise<Collaborator[]> {
    const uniqueCpfs = [...new Set(cpfs.filter((c) => c && String(c).trim().length > 0))];
    if (uniqueCpfs.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(collaborators)
      .where(inArray(collaborators.cpf, uniqueCpfs));

    if (rows.length === 0) {
      return [];
    }

    const ids = rows.map((r) => r.id);
    const cltRows = await this.db
      .select()
      .from(collaboratorCltData)
      .where(inArray(collaboratorCltData.collaboratorId, ids));
    const pjRows = await this.db
      .select()
      .from(collaboratorPjData)
      .where(inArray(collaboratorPjData.collaboratorId, ids));

    const cltByCollaboratorId = new Map(cltRows.map((r) => [r.collaboratorId, r]));
    const pjByCollaboratorId = new Map(pjRows.map((r) => [r.collaboratorId, r]));

    return rows.map((row) =>
      CollaboratorMapper.toDomain(
        row,
        cltByCollaboratorId.get(row.id) ?? null,
        pjByCollaboratorId.get(row.id) ?? null,
      ),
    );
  }

  async findCollaboratorsWithCpfNotNull(): Promise<Collaborator[]> {
    const rows = await this.db
      .select()
      .from(collaborators)
      .where(and(isNotNull(collaborators.cpf), ne(collaborators.cpf, '')));

    if (rows.length === 0) {
      return [];
    }

    const ids = rows.map((r) => r.id);
    const cltRows = await this.db
      .select()
      .from(collaboratorCltData)
      .where(inArray(collaboratorCltData.collaboratorId, ids));
    const pjRows = await this.db
      .select()
      .from(collaboratorPjData)
      .where(inArray(collaboratorPjData.collaboratorId, ids));

    const cltByCollaboratorId = new Map(cltRows.map((r) => [r.collaboratorId, r]));
    const pjByCollaboratorId = new Map(pjRows.map((r) => [r.collaboratorId, r]));

    return rows.map((row) =>
      CollaboratorMapper.toDomain(
        row,
        cltByCollaboratorId.get(row.id) ?? null,
        pjByCollaboratorId.get(row.id) ?? null,
      ),
    );
  }

  async findByFilters(filters: CollaboratorFilters): Promise<PaginatedCollaborators> {
    const conditions: SQL[] = [];

    if (filters.isActive !== undefined) {
      conditions.push(eq(collaborators.isActive, filters.isActive));
    }

    if (filters.employmentType) {
      conditions.push(eq(collaborators.employmentType, filters.employmentType));
    }

    if (filters.department) {
      conditions.push(eq(collaborators.department, filters.department));
    }

    if (filters.directorate) {
      conditions.push(eq(collaborators.directorate, filters.directorate));
    }

    if (filters.managerId) {
      conditions.push(eq(collaborators.managerId, filters.managerId));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(collaborators.fullName, `%${filters.search}%`),
          ilike(collaborators.corporateEmail, `%${filters.search}%`),
          ilike(collaborators.cpf, `%${filters.search}%`),
          ilike(collaborators.registrationNumber, `%${filters.search}%`),
        ) as SQL,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(collaborators)
      .where(whereClause);

    const total = Number(totalResult?.count ?? 0);

    const sortColumnMap = {
      fullName: collaborators.fullName,
      department: collaborators.department,
      employmentType: collaborators.employmentType,
      startDateOriginal: collaborators.startDateOriginal,
      createdAt: collaborators.createdAt,
    } as const;

    const sortColumn =
      filters.sortBy && filters.sortBy in sortColumnMap
        ? sortColumnMap[filters.sortBy as keyof typeof sortColumnMap]
        : collaborators.createdAt;

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const rows = await this.db
      .select()
      .from(collaborators)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(filters.pageSize)
      .offset(offset);

    const result = rows.map((row) => CollaboratorMapper.toDomain(row));

    return {
      collaborators: result,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Record<string, unknown>): Promise<Collaborator | null> {
    const cltFields = ['ctpsNumber', 'ctpsSeries', 'pisPasep', 'timesheetSystem', 'timesheetId'] as const;
    const pjFields = ['companyName', 'companyCnpj', 'companyCnae', 'monthlyNfAmount', 'nfDueDay'] as const;
    const profileOnlyFields = ['role'] as const;

    const mainData: Record<string, unknown> = {};
    const cltData: Record<string, unknown> = {};
    const pjData: Record<string, unknown> = {};
    let roleToUpdate: string | undefined;

    for (const [key, value] of Object.entries(data)) {
      if (key === 'role') {
        roleToUpdate = value as string;
      } else if (cltFields.includes(key as (typeof cltFields)[number])) {
        cltData[key] = value;
      } else if (pjFields.includes(key as (typeof pjFields)[number])) {
        pjData[key] = value;
      } else if (!profileOnlyFields.includes(key as (typeof profileOnlyFields)[number])) {
        mainData[key] = value;
      }
    }

    if (Object.keys(mainData).length > 0) {
      await this.db
        .update(collaborators)
        .set({ ...mainData, updatedAt: new Date() })
        .where(eq(collaborators.id, id));
    }

    if (Object.keys(cltData).length > 0) {
      const cltValues = {
        ctpsNumber: (cltData.ctpsNumber as string) ?? null,
        ctpsSeries: (cltData.ctpsSeries as string) ?? null,
        pisPasep: (cltData.pisPasep as string) ?? null,
        timesheetSystem: (cltData.timesheetSystem as string) ?? 'ponto_mais',
        timesheetId: (cltData.timesheetId as string) ?? null,
      };
      await this.db
        .insert(collaboratorCltData)
        .values({ collaboratorId: id, ...cltValues })
        .onConflictDoUpdate({
          target: collaboratorCltData.collaboratorId,
          set: { ...cltValues, updatedAt: new Date() },
        });
    }

    if (Object.keys(pjData).length > 0) {
      const pjValues = {
        companyName: (pjData.companyName as string) ?? null,
        companyCnpj: (pjData.companyCnpj as string) ?? null,
        companyCnae: (pjData.companyCnae as string) ?? null,
        monthlyNfAmount: pjData.monthlyNfAmount != null ? String(pjData.monthlyNfAmount) : null,
        nfDueDay: (pjData.nfDueDay as number) ?? 25,
      };
      await this.db
        .insert(collaboratorPjData)
        .values({ collaboratorId: id, ...pjValues })
        .onConflictDoUpdate({
          target: collaboratorPjData.collaboratorId,
          set: { ...pjValues, updatedAt: new Date() },
        });
    }

    if (roleToUpdate) {
      const [collabRow] = await this.db
        .select({ profileId: collaborators.profileId })
        .from(collaborators)
        .where(eq(collaborators.id, id))
        .limit(1);

      if (collabRow?.profileId) {
        await this.db
          .update(profiles)
          .set({ role: roleToUpdate, updatedAt: new Date() })
          .where(eq(profiles.id, collabRow.profileId));
      }
    }

    return this.findById(id);
  }
}
