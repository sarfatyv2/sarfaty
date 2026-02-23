import { Module } from '@nestjs/common';
import { ActionReminderScheduler } from './infra/action-reminder.scheduler';
import { CommitteesController } from './controllers/committees.controller';
import { MeetingsController } from './controllers/meetings.controller';
import { ActionsController } from './controllers/actions.controller';
import { CreateCommitteeUseCase } from './use-cases/create-committee.use-case';
import { ListCommitteesUseCase } from './use-cases/list-committees.use-case';
import { GetCommitteeUseCase } from './use-cases/get-committee.use-case';
import { UpdateCommitteeUseCase } from './use-cases/update-committee.use-case';
import { InviteMemberUseCase } from './use-cases/invite-member.use-case';
import { CreateMeetingUseCase } from './use-cases/create-meeting.use-case';
import { UpsertMinuteUseCase } from './use-cases/upsert-minute.use-case';
import { PublishMinuteUseCase } from './use-cases/publish-minute.use-case';
import { CreateActionItemUseCase } from './use-cases/create-action-item.use-case';
import { UpdateActionItemUseCase } from './use-cases/update-action-item.use-case';
import { ListActionItemsUseCase } from './use-cases/list-action-items.use-case';
import { AddActionUpdateUseCase } from './use-cases/add-action-update.use-case';
import { DrizzleCommitteeRepository } from './infra/drizzle-committee.repository';
import { DrizzleMeetingRepository, DrizzleMinuteRepository } from './infra/drizzle-meeting.repository';
import { DrizzleActionItemRepository, DrizzleActionUpdateRepository } from './infra/drizzle-action-item.repository';
import { DrizzleCommitteeMemberRepository } from './infra/drizzle-committee-member.repository';
import { COMMITTEE_REPOSITORY } from './domain/committee.repository';
import { COMMITTEE_MEMBER_REPOSITORY } from './domain/committee-member.repository';
import { MEETING_REPOSITORY, MINUTE_REPOSITORY } from './domain/meeting.repository';
import { ACTION_ITEM_REPOSITORY, ACTION_UPDATE_REPOSITORY } from './domain/action-item.repository';

@Module({
  controllers: [CommitteesController, MeetingsController, ActionsController],
  providers: [
    // Use cases — committees
    CreateCommitteeUseCase,
    ListCommitteesUseCase,
    GetCommitteeUseCase,
    UpdateCommitteeUseCase,
    InviteMemberUseCase,
    // Use cases — meetings & minutes
    CreateMeetingUseCase,
    UpsertMinuteUseCase,
    PublishMinuteUseCase,
    // Use cases — action items
    CreateActionItemUseCase,
    UpdateActionItemUseCase,
    ListActionItemsUseCase,
    AddActionUpdateUseCase,
    // Scheduler
    ActionReminderScheduler,
    // Repositories
    { provide: COMMITTEE_REPOSITORY, useClass: DrizzleCommitteeRepository },
    { provide: COMMITTEE_MEMBER_REPOSITORY, useClass: DrizzleCommitteeMemberRepository },
    { provide: MEETING_REPOSITORY, useClass: DrizzleMeetingRepository },
    { provide: MINUTE_REPOSITORY, useClass: DrizzleMinuteRepository },
    { provide: ACTION_ITEM_REPOSITORY, useClass: DrizzleActionItemRepository },
    { provide: ACTION_UPDATE_REPOSITORY, useClass: DrizzleActionUpdateRepository },
  ],
  exports: [ACTION_ITEM_REPOSITORY, ACTION_UPDATE_REPOSITORY],
})
export class GovernanceModule {}
