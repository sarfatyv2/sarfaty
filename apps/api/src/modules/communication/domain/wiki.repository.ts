import type { PaginationMeta, WikiCategory } from '@nexus/types';
import type { WikiArticle } from './wiki-article.entity';

export const WIKI_CATEGORY_REPOSITORY = Symbol('WIKI_CATEGORY_REPOSITORY');
export const WIKI_ARTICLE_REPOSITORY = Symbol('WIKI_ARTICLE_REPOSITORY');

export interface WikiArticleFilters {
  categoryId?: string;
  status?: string;
  search?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedWikiArticles {
  articles: WikiArticle[];
  pagination: PaginationMeta;
}

export interface WikiCategoryRepository {
  save(category: WikiCategory): Promise<WikiCategory>;
  findById(id: string): Promise<WikiCategory | null>;
  findBySlug(slug: string): Promise<WikiCategory | null>;
  findAll(): Promise<WikiCategory[]>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<WikiCategory | null>;
  delete(id: string): Promise<boolean>;
}

export interface WikiArticleRepository {
  save(article: WikiArticle): Promise<WikiArticle>;
  findById(id: string): Promise<WikiArticle | null>;
  findBySlug(slug: string): Promise<WikiArticle | null>;
  findByFilters(filters: WikiArticleFilters): Promise<PaginatedWikiArticles>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<WikiArticle | null>;
  delete(id: string): Promise<boolean>;
}
