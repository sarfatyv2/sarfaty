import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { updateLessonProgressSchema, type UpdateLessonProgressDto } from '../dto/update-lesson-progress.dto';
import { submitQuizSchema, type SubmitQuizDto } from '../dto/submit-quiz.dto';
import { UpdateLessonProgressUseCase } from '../use-cases/update-lesson-progress.use-case';
import { SubmitQuizUseCase } from '../use-cases/submit-quiz.use-case';

@ApiTags('Learning - Progress')
@ApiBearerAuth()
@Controller('learning/enrollments')
@UseGuards(RolesGuard)
export class ProgressController {
  constructor(
    private readonly updateLessonProgressUseCase: UpdateLessonProgressUseCase,
    private readonly submitQuizUseCase: SubmitQuizUseCase,
  ) {}

  @Patch(':enrollmentId/lessons/:lessonId/progress')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Body(new ZodValidationPipe(updateLessonProgressSchema)) dto: UpdateLessonProgressDto,
  ) {
    const result = await this.updateLessonProgressUseCase.execute(
      enrollmentId,
      lessonId,
      dto.watchedPct,
    );
    return { data: result };
  }

  @Post(':enrollmentId/lessons/:lessonId/quiz')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  @HttpCode(HttpStatus.OK)
  async submitQuiz(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Body(new ZodValidationPipe(submitQuizSchema)) dto: SubmitQuizDto,
  ) {
    const result = await this.submitQuizUseCase.execute(enrollmentId, lessonId, dto);
    return { data: result };
  }
}
