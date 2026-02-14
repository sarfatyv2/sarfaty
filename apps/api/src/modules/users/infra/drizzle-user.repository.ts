import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, or, count, asc, desc, and, type SQL } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { collaborators } from '../../../database/schema/collaborators';
import { collaboratorCltData } from '../../../database/schema/collaborator-clt-data';
import { collaboratorPjData } from '../../../database/schema/collaborator-pj-data';
import type { UserRepository, UserFilters, PaginatedUsers } from '../domain/user.repository';
import type { User } from '../domain/user.entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(user: User): Promise<void> {
    if (!user.hasCollaboratorData) return;

    const { collaborator, cltData, pjData } = UserMapper.toPersistence(user);

    await this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(collaborators)
        .values(collaborator)
        .returning({ id: collaborators.id });

      if (inserted === undefined) {
        throw new Error('Failed to insert collaborator');
      }

      const collaboratorId = inserted.id;

      if (cltData) {
        await tx.insert(collaboratorCltData).values({
          ...cltData,
          collaboratorId,
        });
      }

      if (pjData) {
        await tx.insert(collaboratorPjData).values({
          ...pjData,
          collaboratorId,
        });
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    const profileRows = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    const profileRow = profileRows[0];
    if (!profileRow) return null;

    const collabRows = await this.db
      .select()
      .from(collaborators)
      .where(eq(collaborators.profileId, id))
      .limit(1);

    return UserMapper.toDomain(profileRow, collabRows[0] ?? null);
  }

  async findByEmail(email: string): Promise<User | null> {
    const profileRows = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    const profileRow = profileRows[0];
    if (!profileRow) return null;

    const collabRows = await this.db
      .select()
      .from(collaborators)
      .where(eq(collaborators.profileId, profileRow.id))
      .limit(1);

    return UserMapper.toDomain(profileRow, collabRows[0] ?? null);
  }

  async findByFilters(filters: UserFilters): Promise<PaginatedUsers> {
    const conditions: SQL[] = [];

    if (filters.role) {
      conditions.push(eq(profiles.role, filters.role));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(profiles.isActive, filters.isActive));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(profiles.fullName, `%${filters.search}%`),
          ilike(profiles.email, `%${filters.search}%`),
        ) as SQL,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(profiles)
      .where(whereClause);

    const total = totalResult?.count ?? 0;

    const sortColumnMap = {
      fullName: profiles.fullName,
      email: profiles.email,
      role: profiles.role,
    } as const;

    const sortColumn = (filters.sortBy && filters.sortBy in sortColumnMap)
      ? sortColumnMap[filters.sortBy as keyof typeof sortColumnMap]
      : profiles.createdAt;

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    const offset = (filters.page - 1) * filters.pageSize;

    const profileRows = await this.db
      .select()
      .from(profiles)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(filters.pageSize)
      .offset(offset);

    const users = profileRows.map((profileRow) =>
      UserMapper.toDomain(profileRow),
    );

    return {
      users,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }
}
