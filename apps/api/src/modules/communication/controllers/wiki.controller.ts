import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createWikiCategorySchema,
  updateWikiCategorySchema,
  createWikiArticleSchema,
  updateWikiArticleSchema,
  listWikiArticlesQuerySchema,
  type CreateWikiCategoryDto,
  type UpdateWikiCategoryDto,
  type CreateWikiArticleDto,
  type UpdateWikiArticleDto,
  type ListWikiArticlesQueryDto,
} from '@nexus/validators';
import {
  WIKI_CATEGORY_REPOSITORY,
  WIKI_ARTICLE_REPOSITORY,
  type WikiCategoryRepository,
  type WikiArticleRepository,
} from '../domain/wiki.repository';
import { WikiArticle } from '../domain/wiki-article.entity';
import { WikiArticleNotFoundException } from '../domain/exceptions/wiki-article-not-found.exception';
import type { Role } from '@nexus/types';

const EDITOR_ROLES: Role[] = ['admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer'];
const ALL_AUTHENTICATED: Role[] = [
  'admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer',
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'approver', 'backoffice', 'risk_manager',
  'recovery', 'litigation', 'employee', 'hr', 'dp',
];

@ApiTags('Communication — Wiki')
@ApiBearerAuth()
@Controller('wiki')
@UseGuards(RolesGuard)
export class WikiController {
  constructor(
    @Inject(WIKI_CATEGORY_REPOSITORY)
    private readonly categoryRepository: WikiCategoryRepository,
    @Inject(WIKI_ARTICLE_REPOSITORY)
    private readonly articleRepository: WikiArticleRepository,
  ) {}

  // --- Categories ---

  @Post('categories')
  @Roles(...EDITOR_ROLES)
  @Auditable({ action: 'wiki_category.create', entity: 'wiki_category' })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body(new ZodValidationPipe(createWikiCategorySchema)) dto: CreateWikiCategoryDto,
  ) {
    const category = await this.categoryRepository.save({
      id: '',
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      parentId: dto.parentId ?? null,
      sortOrder: dto.sortOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { data: category };
  }

  @Get('categories')
  @Roles(...ALL_AUTHENTICATED)
  async listCategories() {
    const categories = await this.categoryRepository.findAll();
    return { data: categories };
  }

  @Patch('categories/:id')
  @Roles(...EDITOR_ROLES)
  async updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWikiCategorySchema)) dto: UpdateWikiCategoryDto,
  ) {
    const updated = await this.categoryRepository.update(id, dto);
    return { data: updated };
  }

  @Delete('categories/:id')
  @Roles(...EDITOR_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string) {
    await this.categoryRepository.delete(id);
  }

  // --- Articles ---

  @Post('articles')
  @Roles(...EDITOR_ROLES)
  @Auditable({ action: 'wiki_article.create', entity: 'wiki_article' })
  @HttpCode(HttpStatus.CREATED)
  async createArticle(
    @Body(new ZodValidationPipe(createWikiArticleSchema)) dto: CreateWikiArticleDto,
    @CurrentUser() user: { id: string },
  ) {
    const article = WikiArticle.create({
      categoryId: dto.categoryId,
      title: dto.title,
      slug: dto.slug,
      content: dto.content ?? null,
      authorId: user.id,
    });
    const saved = await this.articleRepository.save(article);
    return { data: saved.toPlainObject() };
  }

  @Get('articles')
  @Roles(...ALL_AUTHENTICATED)
  async listArticles(
    @Query(new ZodValidationPipe(listWikiArticlesQuerySchema)) query: ListWikiArticlesQueryDto,
    @CurrentUser() user: { id: string; user_metadata?: { role?: Role } },
  ) {
    const userRole = user?.user_metadata?.role;
    const isEditor = !!userRole && EDITOR_ROLES.includes(userRole);
    const result = await this.articleRepository.findByFilters({
      categoryId: query.categoryId,
      status: query.status ?? (isEditor ? undefined : 'published'),
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
    return {
      data: result.articles.map((a) => a.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('articles/:slug')
  @Roles(...ALL_AUTHENTICATED)
  async findArticleBySlug(@Param('slug') slug: string) {
    const article = await this.articleRepository.findBySlug(slug);
    if (!article) {
      throw new WikiArticleNotFoundException(slug);
    }
    return { data: article.toPlainObject() };
  }

  @Patch('articles/:id')
  @Roles(...EDITOR_ROLES)
  @Auditable({ action: 'wiki_article.update', entity: 'wiki_article' })
  async updateArticle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWikiArticleSchema)) dto: UpdateWikiArticleDto,
    @CurrentUser() user: { id: string },
  ) {
    const existing = await this.articleRepository.findById(id);
    if (!existing) {
      throw new WikiArticleNotFoundException(id);
    }

    const updateData: Record<string, unknown> = { ...dto, lastUpdatedBy: user.id };
    if (dto.status === 'published' && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await this.articleRepository.update(id, updateData);
    return { data: updated!.toPlainObject() };
  }

  @Delete('articles/:id')
  @Roles(...EDITOR_ROLES)
  @Auditable({ action: 'wiki_article.delete', entity: 'wiki_article' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticle(@Param('id') id: string) {
    await this.articleRepository.delete(id);
  }
}
