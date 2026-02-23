import { Module } from '@nestjs/common';
import { IntranetController } from './controllers/intranet.controller';
import { WikiController } from './controllers/wiki.controller';
import { DrizzleAnnouncementRepository } from './infra/drizzle-announcement.repository';
import {
  DrizzleWikiCategoryRepository,
  DrizzleWikiArticleRepository,
} from './infra/drizzle-wiki.repository';
import { ANNOUNCEMENT_REPOSITORY } from './domain/announcement.repository';
import { WIKI_CATEGORY_REPOSITORY, WIKI_ARTICLE_REPOSITORY } from './domain/wiki.repository';

@Module({
  controllers: [IntranetController, WikiController],
  providers: [
    { provide: ANNOUNCEMENT_REPOSITORY, useClass: DrizzleAnnouncementRepository },
    { provide: WIKI_CATEGORY_REPOSITORY, useClass: DrizzleWikiCategoryRepository },
    { provide: WIKI_ARTICLE_REPOSITORY, useClass: DrizzleWikiArticleRepository },
  ],
})
export class CommunicationModule {}
