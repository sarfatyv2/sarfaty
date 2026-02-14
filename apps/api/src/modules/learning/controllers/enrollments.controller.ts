import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { EnrollCollaboratorUseCase } from '../use-cases/enroll-collaborator.use-case';
import { ListMyEnrollmentsUseCase } from '../use-cases/list-my-enrollments.use-case';
import { ListAdminProgressUseCase } from '../use-cases/list-admin-progress.use-case';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository } from '../domain/enrollment.repository';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { collaborators } from '../../../database/schema';
import { eq } from 'drizzle-orm';

@ApiTags('Learning - Enrollments')
@ApiBearerAuth()
@Controller('learning')
@UseGuards(RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollCollaboratorUseCase: EnrollCollaboratorUseCase,
    private readonly listMyEnrollmentsUseCase: ListMyEnrollmentsUseCase,
    private readonly listAdminProgressUseCase: ListAdminProgressUseCase,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: EnrollmentRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  @Post('courses/:courseId/enroll')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  @Auditable({ action: 'enrollment.create', entity: 'learning_enrollment' })
  @HttpCode(HttpStatus.CREATED)
  async enroll(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    const collaboratorId = await this.resolveCollaboratorId(user.id);
    const enrollment = await this.enrollCollaboratorUseCase.execute(courseId, collaboratorId);
    return { data: enrollment.toPlainObject() };
  }

  @Get('my-enrollments')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async myEnrollments(@CurrentUser() user: { id: string }) {
    const collaboratorId = await this.resolveCollaboratorId(user.id);
    const enrollments = await this.listMyEnrollmentsUseCase.execute(collaboratorId);
    return {
      data: enrollments.map((e) => ({
        ...e.toPlainObject(),
        courseTitle: e.courseTitle,
        courseCategory: e.courseCategory,
        courseThumbnailUrl: e.courseThumbnailUrl,
        courseTotalDurationSeconds: e.courseTotalDurationSeconds,
      })),
    };
  }

  @Get('courses/:courseId/my-enrollment')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async myEnrollmentForCourse(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    const collaboratorId = await this.resolveCollaboratorId(user.id);
    const enrollment = await this.enrollmentRepo.findByCollaboratorAndCourse(collaboratorId, courseId);

    if (!enrollment) {
      return { data: null };
    }

    const completedLessonIds = await this.enrollmentRepo.findCompletedLessonIdsByEnrollment(
      enrollment.id,
    );

    return {
      data: {
        ...enrollment.toPlainObject(),
        completedLessonIds,
      },
    };
  }

  @Get('enrollments/:id')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async getEnrollment(@Param('id') enrollmentId: string) {
    return { data: { id: enrollmentId } };
  }

  @Get('admin/progress')
  @Roles('admin', 'hr', 'hr_admin')
  async adminProgress() {
    const summary = await this.listAdminProgressUseCase.getSummary();
    return { data: summary };
  }

  @Get('admin/progress/:courseId')
  @Roles('admin', 'hr', 'hr_admin')
  async adminCourseProgress(
    @Param('courseId') courseId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const enrollments = await this.listAdminProgressUseCase.getCourseDetail(courseId, {
      status: status || undefined,
      search: search || undefined,
    });
    return { data: enrollments };
  }

  private async resolveCollaboratorId(profileId: string): Promise<string> {
    const [collab] = await this.db
      .select({ id: collaborators.id })
      .from(collaborators)
      .where(eq(collaborators.profileId, profileId))
      .limit(1);

    if (!collab) {
      throw new Error('Collaborator not found for profile');
    }

    return collab.id;
  }
}
