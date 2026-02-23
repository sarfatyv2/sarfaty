import {
  Body,
  Controller,
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
  createMeetingSchema,
  updateMeetingSchema,
  listMeetingsQuerySchema,
  upsertMinuteSchema,
  type CreateMeetingDto,
  type UpdateMeetingDto,
  type ListMeetingsQueryDto,
  type UpsertMinuteDto,
} from '@nexus/validators';
import { CreateMeetingUseCase } from '../use-cases/create-meeting.use-case';
import { UpsertMinuteUseCase } from '../use-cases/upsert-minute.use-case';
import { PublishMinuteUseCase } from '../use-cases/publish-minute.use-case';
import { MEETING_REPOSITORY, MINUTE_REPOSITORY } from '../domain/meeting.repository';
import type { MeetingRepository, MinuteRepository } from '../domain/meeting.repository';
import type { Role } from '@nexus/types';
import { MeetingNotFoundException } from '../domain/exceptions/meeting-not-found.exception';

const MANAGE_ROLES: Role[] = ['admin', 'governance', 'legal', 'compliance_officer', 'backoffice'];
const READ_ROLES: Role[] = [...MANAGE_ROLES, 'sales_director', 'hr_admin', 'people_manager'];

@ApiTags('Governance — Meetings')
@ApiBearerAuth()
@Controller('governance/committees/:committeeId/meetings')
@UseGuards(RolesGuard)
export class MeetingsController {
  constructor(
    private readonly createMeetingUseCase: CreateMeetingUseCase,
    private readonly upsertMinuteUseCase: UpsertMinuteUseCase,
    private readonly publishMinuteUseCase: PublishMinuteUseCase,
    @Inject(MEETING_REPOSITORY)
    private readonly meetingRepository: MeetingRepository,
    @Inject(MINUTE_REPOSITORY)
    private readonly minuteRepository: MinuteRepository,
  ) {}

  @Post()
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'meeting.create', entity: 'meeting' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('committeeId') committeeId: string,
    @Body(new ZodValidationPipe(createMeetingSchema)) dto: CreateMeetingDto,
    @CurrentUser() user: { id: string },
  ) {
    const meeting = await this.createMeetingUseCase.execute(committeeId, dto, user.id);
    return { data: meeting.toPlainObject() };
  }

  @Get()
  @Roles(...READ_ROLES)
  async list(
    @Param('committeeId') committeeId: string,
    @Query(new ZodValidationPipe(listMeetingsQuerySchema)) query: ListMeetingsQueryDto,
  ) {
    const result = await this.meetingRepository.findByCommittee({
      committeeId,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
    return {
      data: result.meetings.map((m) => m.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get(':meetingId')
  @Roles(...READ_ROLES)
  async findOne(@Param('meetingId') meetingId: string) {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new MeetingNotFoundException(meetingId);
    }
    return { data: meeting.toPlainObject() };
  }

  @Patch(':meetingId')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'meeting.update', entity: 'meeting' })
  async update(
    @Param('meetingId') meetingId: string,
    @Body(new ZodValidationPipe(updateMeetingSchema)) dto: UpdateMeetingDto,
  ) {
    const updated = await this.meetingRepository.update(meetingId, dto);
    if (!updated) {
      throw new MeetingNotFoundException(meetingId);
    }
    return { data: updated.toPlainObject() };
  }

  @Get(':meetingId/minute')
  @Roles(...READ_ROLES)
  async getMinute(@Param('meetingId') meetingId: string) {
    const minute = await this.minuteRepository.findByMeetingId(meetingId);
    return { data: minute?.toPlainObject() ?? null };
  }

  @Post(':meetingId/minute')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'minute.upsert', entity: 'meeting_minute' })
  async upsertMinute(
    @Param('meetingId') meetingId: string,
    @Body(new ZodValidationPipe(upsertMinuteSchema)) dto: UpsertMinuteDto,
    @CurrentUser() user: { id: string },
  ) {
    const minute = await this.upsertMinuteUseCase.execute(meetingId, dto, user.id);
    return { data: minute.toPlainObject() };
  }

  @Post(':meetingId/minute/publish')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'minute.publish', entity: 'meeting_minute' })
  @HttpCode(HttpStatus.OK)
  async publishMinute(
    @Param('meetingId') meetingId: string,
    @CurrentUser() user: { id: string },
  ) {
    const minute = await this.publishMinuteUseCase.execute(meetingId, user.id);
    return { data: minute.toPlainObject() };
  }
}
