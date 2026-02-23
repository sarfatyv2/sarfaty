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
  createCommitteeSchema,
  updateCommitteeSchema,
  listCommitteesQuerySchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  type CreateCommitteeDto,
  type UpdateCommitteeDto,
  type ListCommitteesQueryDto,
  type InviteMemberDto,
  type UpdateMemberRoleDto,
} from '@nexus/validators';
import { CreateCommitteeUseCase } from '../use-cases/create-committee.use-case';
import { ListCommitteesUseCase } from '../use-cases/list-committees.use-case';
import { GetCommitteeUseCase } from '../use-cases/get-committee.use-case';
import { UpdateCommitteeUseCase } from '../use-cases/update-committee.use-case';
import { InviteMemberUseCase } from '../use-cases/invite-member.use-case';
import { COMMITTEE_MEMBER_REPOSITORY } from '../domain/committee-member.repository';
import type { CommitteeMemberRepository } from '../domain/committee-member.repository';
import type { Role } from '@nexus/types';

const MANAGE_ROLES: Role[] = ['admin', 'governance', 'legal', 'compliance_officer', 'backoffice'];

@ApiTags('Governance — Committees')
@ApiBearerAuth()
@Controller('governance/committees')
@UseGuards(RolesGuard)
export class CommitteesController {
  constructor(
    private readonly createCommitteeUseCase: CreateCommitteeUseCase,
    private readonly listCommitteesUseCase: ListCommitteesUseCase,
    private readonly getCommitteeUseCase: GetCommitteeUseCase,
    private readonly updateCommitteeUseCase: UpdateCommitteeUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    @Inject(COMMITTEE_MEMBER_REPOSITORY)
    private readonly memberRepository: CommitteeMemberRepository,
  ) {}

  @Post()
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'committee.create', entity: 'committee' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createCommitteeSchema)) dto: CreateCommitteeDto,
    @CurrentUser() user: { id: string },
  ) {
    const committee = await this.createCommitteeUseCase.execute(dto, user.id);
    return { data: committee.toPlainObject() };
  }

  @Get()
  @Roles(...MANAGE_ROLES, 'sales_director', 'hr_admin', 'people_manager')
  async list(
    @Query(new ZodValidationPipe(listCommitteesQuerySchema)) query: ListCommitteesQueryDto,
  ) {
    const result = await this.listCommitteesUseCase.execute(query);
    return {
      data: result.committees.map((c) => c.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @Roles(...MANAGE_ROLES, 'sales_director', 'hr_admin', 'people_manager')
  async findOne(@Param('id') id: string) {
    const committee = await this.getCommitteeUseCase.execute(id);
    return { data: committee.toPlainObject() };
  }

  @Patch(':id')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'committee.update', entity: 'committee' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCommitteeSchema)) dto: UpdateCommitteeDto,
  ) {
    const committee = await this.updateCommitteeUseCase.execute(id, dto);
    return { data: committee.toPlainObject() };
  }

  @Get(':id/members')
  @Roles(...MANAGE_ROLES, 'sales_director', 'hr_admin', 'people_manager')
  async listMembers(@Param('id') id: string) {
    const members = await this.memberRepository.findByCommitteeId(id);
    return { data: members };
  }

  @Post(':id/members')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'committee.invite_member', entity: 'committee' })
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @Param('id') committeeId: string,
    @Body(new ZodValidationPipe(inviteMemberSchema)) dto: InviteMemberDto,
    @CurrentUser() user: { id: string },
  ) {
    const member = await this.inviteMemberUseCase.execute(committeeId, dto, user.id);
    return { data: member };
  }

  @Patch(':id/members/:memberId/role')
  @Roles(...MANAGE_ROLES)
  async updateMemberRole(
    @Param('memberId') memberId: string,
    @Body(new ZodValidationPipe(updateMemberRoleSchema)) dto: UpdateMemberRoleDto,
  ) {
    const member = await this.memberRepository.updateRole(memberId, dto.role);
    return { data: member };
  }

  @Delete(':id/members/:memberId')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'committee.remove_member', entity: 'committee' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(@Param('memberId') memberId: string) {
    await this.memberRepository.delete(memberId);
  }
}
