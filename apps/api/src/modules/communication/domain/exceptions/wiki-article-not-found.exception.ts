import { DomainException } from '@nexus/types';

export class WikiArticleNotFoundException extends DomainException {
  readonly code = 'WIKI_ARTICLE_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(idOrSlug: string) {
    super(`Wiki article not found: ${idOrSlug}`);
  }
}
