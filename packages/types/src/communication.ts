export const ANNOUNCEMENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export const WIKI_ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const;
export type WikiArticleStatus = (typeof WIKI_ARTICLE_STATUSES)[number];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string | null;
  targetRoles: string[];
  authorId: string;
  status: AnnouncementStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: WikiCategory[];
}

export interface WikiArticle {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  content: unknown;
  youtubeVideoId: string | null;
  status: WikiArticleStatus;
  authorId: string;
  lastUpdatedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    fullName: string;
    avatarUrl: string | null;
  };
  category?: WikiCategory;
}
