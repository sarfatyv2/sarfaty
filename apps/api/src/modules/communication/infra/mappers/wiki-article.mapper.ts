import { WikiArticle, type WikiArticleProps } from '../../domain/wiki-article.entity';
import type { WikiArticleStatus } from '@nexus/types';
import type { commWikiArticles } from '../../../../database/schema';

type WikiArticleRow = typeof commWikiArticles.$inferSelect;

export class WikiArticleMapper {
  static toDomain(row: WikiArticleRow): WikiArticle {
    const props: WikiArticleProps = {
      id: row.id,
      categoryId: row.categoryId,
      title: row.title,
      slug: row.slug,
      content: row.content,
      youtubeVideoId: row.youtubeVideoId ?? null,
      status: row.status as WikiArticleStatus,
      authorId: row.authorId,
      lastUpdatedBy: row.lastUpdatedBy,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return WikiArticle.reconstitute(props);
  }

  static toPersistence(article: WikiArticle): Record<string, unknown> {
    return {
      categoryId: article.categoryId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      youtubeVideoId: article.youtubeVideoId,
      status: article.status,
      authorId: article.authorId,
      lastUpdatedBy: article.lastUpdatedBy,
      publishedAt: article.publishedAt,
    };
  }
}
