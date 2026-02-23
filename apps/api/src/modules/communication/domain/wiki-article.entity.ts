import type { WikiArticleStatus } from '@nexus/types';

export interface WikiArticleProps {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  content: unknown;
  status: WikiArticleStatus;
  authorId: string;
  lastUpdatedBy: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WikiArticle {
  readonly id: string;
  readonly categoryId: string;
  readonly title: string;
  readonly slug: string;
  readonly content: unknown;
  readonly status: WikiArticleStatus;
  readonly authorId: string;
  readonly lastUpdatedBy: string | null;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: WikiArticleProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.title = props.title;
    this.slug = props.slug;
    this.content = props.content;
    this.status = props.status;
    this.authorId = props.authorId;
    this.lastUpdatedBy = props.lastUpdatedBy;
    this.publishedAt = props.publishedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<WikiArticleProps, 'id' | 'status' | 'publishedAt' | 'lastUpdatedBy' | 'createdAt' | 'updatedAt'>,
  ): WikiArticle {
    return new WikiArticle({
      ...props,
      id: '',
      status: 'draft',
      publishedAt: null,
      lastUpdatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: WikiArticleProps): WikiArticle {
    return new WikiArticle(props);
  }

  canPublish(): boolean {
    return this.status === 'draft';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      categoryId: this.categoryId,
      title: this.title,
      slug: this.slug,
      content: this.content,
      status: this.status,
      authorId: this.authorId,
      lastUpdatedBy: this.lastUpdatedBy,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
