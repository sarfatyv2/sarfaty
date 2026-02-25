import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, desc, asc, count, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { commWikiCategories, commWikiArticles } from '../../../database/schema';
import type {
  WikiCategoryRepository,
  WikiArticleRepository,
  WikiArticleFilters,
  PaginatedWikiArticles,
} from '../domain/wiki.repository';
import type { WikiCategory } from '@nexus/types';
import { WikiArticle } from '../domain/wiki-article.entity';
import { WikiArticleMapper } from './mappers/wiki-article.mapper';

@Injectable()
export class DrizzleWikiCategoryRepository implements WikiCategoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(category: WikiCategory): Promise<WikiCategory> {
    const [row] = await this.db
      .insert(commWikiCategories)
      .values({
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
      })
      .returning();
    return this.toWikiCategory(row!);
  }

  async findById(id: string): Promise<WikiCategory | null> {
    const [row] = await this.db
      .select()
      .from(commWikiCategories)
      .where(eq(commWikiCategories.id, id))
      .limit(1);
    return row ? this.toWikiCategory(row) : null;
  }

  async findBySlug(slug: string): Promise<WikiCategory | null> {
    const [row] = await this.db
      .select()
      .from(commWikiCategories)
      .where(eq(commWikiCategories.slug, slug))
      .limit(1);
    return row ? this.toWikiCategory(row) : null;
  }

  async findAll(): Promise<WikiCategory[]> {
    const rows = await this.db
      .select()
      .from(commWikiCategories)
      .orderBy(asc(commWikiCategories.sortOrder), asc(commWikiCategories.name));
    return rows.map((row) => this.toWikiCategory(row));
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<WikiCategory | null> {
    const [row] = await this.db
      .update(commWikiCategories)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof commWikiCategories.$inferInsert>)
      .where(eq(commWikiCategories.id, id))
      .returning();
    return row ? this.toWikiCategory(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(commWikiCategories)
      .where(eq(commWikiCategories.id, id))
      .returning({ id: commWikiCategories.id });
    return result.length > 0;
  }

  private toWikiCategory(row: typeof commWikiCategories.$inferSelect): WikiCategory {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class DrizzleWikiArticleRepository implements WikiArticleRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(article: WikiArticle): Promise<WikiArticle> {
    const data = WikiArticleMapper.toPersistence(article);
    const [row] = await this.db
      .insert(commWikiArticles)
      .values(data as typeof commWikiArticles.$inferInsert)
      .returning();
    return WikiArticleMapper.toDomain(row!);
  }

  async findById(id: string): Promise<WikiArticle | null> {
    const [row] = await this.db
      .select()
      .from(commWikiArticles)
      .where(eq(commWikiArticles.id, id))
      .limit(1);
    return row ? WikiArticleMapper.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<WikiArticle | null> {
    const [row] = await this.db
      .select()
      .from(commWikiArticles)
      .where(eq(commWikiArticles.slug, slug))
      .limit(1);
    return row ? WikiArticleMapper.toDomain(row) : null;
  }

  async findByFilters(filters: WikiArticleFilters): Promise<PaginatedWikiArticles> {
    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(commWikiArticles.categoryId, filters.categoryId));
    }
    if (filters.status) {
      conditions.push(eq(commWikiArticles.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(commWikiArticles.title, `%${filters.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(commWikiArticles)
        .where(whereClause)
        .orderBy(orderFn(commWikiArticles.updatedAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(commWikiArticles)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      articles: rows.map((row) => WikiArticleMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  private static readonly ARTICLE_UPDATE_COLUMNS = new Set([
    'categoryId', 'title', 'slug', 'content', 'youtubeVideoId', 'status',
    'authorId', 'lastUpdatedBy', 'publishedAt',
  ]);

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<WikiArticle | null> {
    const filtered: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && DrizzleWikiArticleRepository.ARTICLE_UPDATE_COLUMNS.has(key)) {
        filtered[key] = value;
      }
    }
    const [row] = await this.db
      .update(commWikiArticles)
      .set(filtered as Partial<typeof commWikiArticles.$inferInsert>)
      .where(eq(commWikiArticles.id, id))
      .returning();
    return row ? WikiArticleMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(commWikiArticles)
      .where(eq(commWikiArticles.id, id))
      .returning({ id: commWikiArticles.id });
    return result.length > 0;
  }
}
