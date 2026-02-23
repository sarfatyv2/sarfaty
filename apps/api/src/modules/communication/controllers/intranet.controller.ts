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
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
  type CreateAnnouncementDto,
  type UpdateAnnouncementDto,
  type ListAnnouncementsQueryDto,
} from '@nexus/validators';
import { ANNOUNCEMENT_REPOSITORY, type AnnouncementRepository } from '../domain/announcement.repository';
import { Announcement } from '../domain/announcement.entity';
import { AnnouncementNotFoundException } from '../domain/exceptions/announcement-not-found.exception';
import type { Role } from '@nexus/types';

const AUTHOR_ROLES: Role[] = ['admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer'];

@ApiTags('Communication — Intranet')
@ApiBearerAuth()
@Controller('intranet/announcements')
@UseGuards(RolesGuard)
export class IntranetController {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  @Post()
  @Roles(...AUTHOR_ROLES)
  @Auditable({ action: 'announcement.create', entity: 'announcement' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createAnnouncementSchema)) dto: CreateAnnouncementDto,
    @CurrentUser() user: { id: string },
  ) {
    const announcement = Announcement.create({
      title: dto.title,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl ?? null,
      targetRoles: dto.targetRoles,
      authorId: user.id,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    const saved = await this.announcementRepository.save(announcement);
    return { data: saved.toPlainObject() };
  }

  @Get()
  @Roles(
    'admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer',
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'approver', 'backoffice', 'risk_manager',
    'recovery', 'litigation', 'employee', 'hr', 'dp',
  )
  async list(
    @Query(new ZodValidationPipe(listAnnouncementsQuerySchema)) query: ListAnnouncementsQueryDto,
    @CurrentUser() user: { id: string; user_metadata: { role: Role } },
  ) {
    const result = await this.announcementRepository.findByFilters({
      status: query.status ?? 'published',
      search: query.search,
      targetRole: user.user_metadata.role,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
    return {
      data: result.announcements.map((a) => a.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('admin')
  @Roles(...AUTHOR_ROLES)
  async listAdmin(
    @Query(new ZodValidationPipe(listAnnouncementsQuerySchema)) query: ListAnnouncementsQueryDto,
  ) {
    const result = await this.announcementRepository.findByFilters({
      status: query.status,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
    return {
      data: result.announcements.map((a) => a.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @Roles(...AUTHOR_ROLES)
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new AnnouncementNotFoundException(id);
    }
    return { data: announcement.toPlainObject() };
  }

  @Patch(':id')
  @Roles(...AUTHOR_ROLES)
  @Auditable({ action: 'announcement.update', entity: 'announcement' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAnnouncementSchema)) dto: UpdateAnnouncementDto,
  ) {
    const existing = await this.announcementRepository.findById(id);
    if (!existing) {
      throw new AnnouncementNotFoundException(id);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.coverImageUrl !== undefined) updateData.coverImageUrl = dto.coverImageUrl;
    if (dto.targetRoles !== undefined) updateData.targetRoles = dto.targetRoles;
    if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await this.announcementRepository.update(id, updateData);
    return { data: updated!.toPlainObject() };
  }

  @Delete(':id')
  @Roles(...AUTHOR_ROLES)
  @Auditable({ action: 'announcement.delete', entity: 'announcement' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.announcementRepository.delete(id);
  }
}
