import { Module } from '@nestjs/common';
import { CoursesController } from './controllers/courses.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { ProgressController } from './controllers/progress.controller';
import { CreateCourseUseCase } from './use-cases/create-course.use-case';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case';
import { GetCourseUseCase } from './use-cases/get-course.use-case';
import { ListCoursesUseCase } from './use-cases/list-courses.use-case';
import { PublishCourseUseCase } from './use-cases/publish-course.use-case';
import { EnrollCollaboratorUseCase } from './use-cases/enroll-collaborator.use-case';
import { AutoEnrollMandatoryUseCase } from './use-cases/auto-enroll-mandatory.use-case';
import { ListMyEnrollmentsUseCase } from './use-cases/list-my-enrollments.use-case';
import { UpdateLessonProgressUseCase } from './use-cases/update-lesson-progress.use-case';
import { SubmitQuizUseCase } from './use-cases/submit-quiz.use-case';
import { ListAdminProgressUseCase } from './use-cases/list-admin-progress.use-case';
import { DrizzleCourseRepository } from './infra/drizzle-course.repository';
import { DrizzleEnrollmentRepository } from './infra/drizzle-enrollment.repository';
import { LearningStorageService } from './infra/learning-storage.service';
import { COURSE_REPOSITORY } from './domain/course.repository';
import { ENROLLMENT_REPOSITORY } from './domain/enrollment.repository';

@Module({
  controllers: [
    CoursesController,
    EnrollmentsController,
    ProgressController,
  ],
  providers: [
    // Use cases
    CreateCourseUseCase,
    UpdateCourseUseCase,
    GetCourseUseCase,
    ListCoursesUseCase,
    PublishCourseUseCase,
    EnrollCollaboratorUseCase,
    AutoEnrollMandatoryUseCase,
    ListMyEnrollmentsUseCase,
    UpdateLessonProgressUseCase,
    SubmitQuizUseCase,
    ListAdminProgressUseCase,
    // Infrastructure
    LearningStorageService,
    { provide: COURSE_REPOSITORY, useClass: DrizzleCourseRepository },
    { provide: ENROLLMENT_REPOSITORY, useClass: DrizzleEnrollmentRepository },
  ],
})
export class LearningModule {}
