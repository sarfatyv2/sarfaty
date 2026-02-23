import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { listNotificationsQuerySchema, type ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { ListNotificationsUseCase } from '../use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from '../use-cases/get-unread-count.use-case';
import { MarkAsReadUseCase } from '../use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from '../use-cases/mark-all-as-read.use-case';
import { Roles } from '../../../common/decorators/roles.decorator';

const ALL_ROLES = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
  'legal', 'risk_manager', 'recovery', 'litigation',
  'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'governance', 'admin',
] as const;

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
  ) {}

  @Get()
  @Roles(...ALL_ROLES)
  async list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listNotificationsQuerySchema)) query: ListNotificationsQueryDto,
  ) {
    const result = await this.listNotificationsUseCase.execute(user.id, query);
    return {
      data: result.notifications.map((n) => n.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('unread-count')
  @Roles(...ALL_ROLES)
  async unreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.getUnreadCountUseCase.execute(user.id);
    return { data: { count } };
  }

  @Patch('read-all')
  @Roles(...ALL_ROLES)
  async markAllAsRead(@CurrentUser() user: { id: string }) {
    const updated = await this.markAllAsReadUseCase.execute(user.id);
    return { data: { updated } };
  }

  @Patch(':id/read')
  @Roles(...ALL_ROLES)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const success = await this.markAsReadUseCase.execute(id, user.id);
    return { data: { success } };
  }
}
