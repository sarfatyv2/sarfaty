import { Inject, Injectable } from '@nestjs/common';
import { eq, and, lte, gte, desc, asc, count, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { govActionItems, govActionUpdates } from '../../../database/schema';
import type {
  ActionItemRepository,
  ActionUpdateRepository,
  ActionItemFilters,
  PaginatedActionItems,
} from '../domain/action-item.repository';
import { ActionItem } from '../domain/action-item.entity';
import { ActionUpdate } from '../domain/action-update.entity';
import { ActionItemMapper } from './mappers/action-item.mapper';

@Injectable()
export class DrizzleActionItemRepository implements ActionItemRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(actionItem: ActionItem): Promise<ActionItem> {
    const data = ActionItemMapper.toPersistence(actionItem);
    const [row] = await this.db
      .insert(govActionItems)
      .values(data as typeof govActionItems.$inferInsert)
      .returning();
    return ActionItemMapper.toDomain(row!);
  }

  async findById(id: string): Promise<ActionItem | null> {
    const [row] = await this.db
      .select()
      .from(govActionItems)
      .where(eq(govActionItems.id, id))
      .limit(1);
    return row ? ActionItemMapper.toDomain(row) : null;
  }

  async findByFilters(filters: ActionItemFilters): Promise<PaginatedActionItems> {
    const conditions = [];

    if (filters.committeeId) {
      conditions.push(eq(govActionItems.committeeId, filters.committeeId));
    }
    if (filters.assigneeId) {
      conditions.push(eq(govActionItems.assigneeId, filters.assigneeId));
    }
    if (filters.status) {
      conditions.push(eq(govActionItems.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(govActionItems)
        .where(whereClause)
        .orderBy(orderFn(govActionItems.dueDate))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(govActionItems)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      actionItems: rows.map((row) => ActionItemMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async findOverdueByAssignee(assigneeId: string): Promise<ActionItem[]> {
    const rows = await this.db
      .select()
      .from(govActionItems)
      .where(
        and(
          eq(govActionItems.assigneeId, assigneeId),
          lte(govActionItems.dueDate, new Date()),
          sql`${govActionItems.status} != 'done'`,
        ),
      );
    return rows.map((row) => ActionItemMapper.toDomain(row));
  }

  async findDueSoon(withinDays: number): Promise<ActionItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + withinDays);

    const rows = await this.db
      .select()
      .from(govActionItems)
      .where(
        and(
          gte(govActionItems.dueDate, new Date()),
          lte(govActionItems.dueDate, futureDate),
          sql`${govActionItems.status} != 'done'`,
        ),
      );
    return rows.map((row) => ActionItemMapper.toDomain(row));
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<ActionItem | null> {
    const [row] = await this.db
      .update(govActionItems)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof govActionItems.$inferInsert>)
      .where(eq(govActionItems.id, id))
      .returning();
    return row ? ActionItemMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(govActionItems)
      .where(eq(govActionItems.id, id))
      .returning({ id: govActionItems.id });
    return result.length > 0;
  }
}

@Injectable()
export class DrizzleActionUpdateRepository implements ActionUpdateRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(update: ActionUpdate): Promise<ActionUpdate> {
    const [row] = await this.db
      .insert(govActionUpdates)
      .values({
        actionItemId: update.actionItemId,
        authorId: update.authorId,
        comment: update.comment,
        statusChange: update.statusChange,
      })
      .returning();

    return ActionUpdate.reconstitute({
      id: row!.id,
      actionItemId: row!.actionItemId,
      authorId: row!.authorId,
      comment: row!.comment,
      statusChange: row!.statusChange,
      createdAt: row!.createdAt,
    });
  }

  async findByActionItemId(actionItemId: string): Promise<ActionUpdate[]> {
    const rows = await this.db
      .select()
      .from(govActionUpdates)
      .where(eq(govActionUpdates.actionItemId, actionItemId))
      .orderBy(desc(govActionUpdates.createdAt));

    return rows.map((row) =>
      ActionUpdate.reconstitute({
        id: row.id,
        actionItemId: row.actionItemId,
        authorId: row.authorId,
        comment: row.comment,
        statusChange: row.statusChange,
        createdAt: row.createdAt,
      }),
    );
  }
}
