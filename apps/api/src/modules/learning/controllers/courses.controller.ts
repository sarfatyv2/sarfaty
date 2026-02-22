import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createCourseSchema, type CreateCourseDto } from '../dto/create-course.dto';
import { updateCourseSchema, type UpdateCourseDto } from '../dto/update-course.dto';
import { listCoursesQuerySchema, type ListCoursesQueryDto } from '../dto/list-courses-query.dto';
import { createModuleSchema, type CreateModuleDto } from '../dto/create-module.dto';
import { createLessonSchema, type CreateLessonDto } from '../dto/create-lesson.dto';
import { updateLessonSchema, type UpdateLessonDto, updateModuleSchema, type UpdateModuleDto } from '@nexus/validators';
import { CreateCourseUseCase } from '../use-cases/create-course.use-case';
import { GetCourseUseCase } from '../use-cases/get-course.use-case';
import { ListCoursesUseCase } from '../use-cases/list-courses.use-case';
import { UpdateCourseUseCase } from '../use-cases/update-course.use-case';
import { PublishCourseUseCase } from '../use-cases/publish-course.use-case';
import { LearningStorageService } from '../infra/learning-storage.service';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { learningModules, learningLessons } from '../../../database/schema';
import { eq, asc } from 'drizzle-orm';
import type { Role, LessonMaterial } from '@nexus/types';

@ApiTags('Learning - Courses')
@ApiBearerAuth()
@Controller('learning/courses')
@UseGuards(RolesGuard)
export class CoursesController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly getCourseUseCase: GetCourseUseCase,
    private readonly listCoursesUseCase: ListCoursesUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly publishCourseUseCase: PublishCourseUseCase,
    private readonly storageService: LearningStorageService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  @Post()
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'course.create', entity: 'learning_course' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createCourseSchema)) dto: CreateCourseDto,
    @CurrentUser() user: { id: string },
  ) {
    const course = await this.createCourseUseCase.execute({
      dto,
      createdBy: user.id,
    });
    return { data: course.toPlainObject() };
  }

  @Get()
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async list(
    @Query(new ZodValidationPipe(listCoursesQuerySchema)) query: ListCoursesQueryDto,
    @CurrentUser() user: { user_metadata: { role: Role } },
  ) {
    const isAdmin = ['admin', 'hr', 'hr_admin'].includes(user.user_metadata.role);
    const targetRole = isAdmin ? undefined : user.user_metadata.role;

    // Non-admin users only see published courses
    if (!isAdmin && !query.status) {
      query.status = 'published';
    }

    const result = await this.listCoursesUseCase.execute(query, targetRole);
    return {
      data: result.courses.map((c) => c.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async findOne(@Param('id') id: string) {
    const result = await this.getCourseUseCase.execute(id);
    return {
      data: {
        ...result.course.toPlainObject(),
        modules: result.modules,
        totalLessons: result.totalLessons,
      },
    };
  }

  @Patch(':id')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'course.update', entity: 'learning_course' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCourseSchema)) dto: UpdateCourseDto,
  ) {
    const course = await this.updateCourseUseCase.execute(id, dto);
    return { data: course.toPlainObject() };
  }

  @Post(':id/publish')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'course.publish', entity: 'learning_course' })
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    const course = await this.publishCourseUseCase.execute(id);
    return { data: course.toPlainObject() };
  }

  // --- Module management (inline for simplicity) ---

  @Post(':courseId/modules')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'module.create', entity: 'learning_module' })
  @HttpCode(HttpStatus.CREATED)
  async createModule(
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(createModuleSchema)) dto: CreateModuleDto,
  ) {
    const rows = await this.db
      .insert(learningModules)
      .values({
        courseId,
        title: dto.title,
        sortOrder: dto.sortOrder,
      })
      .returning();
    return { data: rows[0] };
  }

  @Get(':courseId/modules')
  @Roles(
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation',
    'employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin',
  )
  async listModules(@Param('courseId') courseId: string) {
    const rows = await this.db
      .select()
      .from(learningModules)
      .where(eq(learningModules.courseId, courseId))
      .orderBy(asc(learningModules.sortOrder));
    return { data: rows };
  }

  @Patch(':courseId/modules/:moduleId')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'module.update', entity: 'learning_module' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body(new ZodValidationPipe(updateModuleSchema)) dto: UpdateModuleDto,
  ) {
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    const [row] = await this.db
      .update(learningModules)
      .set(data as Partial<typeof learningModules.$inferInsert>)
      .where(eq(learningModules.id, moduleId))
      .returning();
    return { data: row };
  }

  @Delete(':courseId/modules/:moduleId')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'module.delete', entity: 'learning_module' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModule(@Param('moduleId') moduleId: string) {
    await this.db
      .delete(learningModules)
      .where(eq(learningModules.id, moduleId));
  }

  // --- Lesson management ---

  @Post(':courseId/modules/:moduleId/lessons')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'lesson.create', entity: 'learning_lesson' })
  @HttpCode(HttpStatus.CREATED)
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body(new ZodValidationPipe(createLessonSchema)) dto: CreateLessonDto,
  ) {
    const rows = await this.db
      .insert(learningLessons)
      .values({
        moduleId,
        title: dto.title,
        description: dto.description ?? null,
        youtubeVideoId: dto.youtubeVideoId,
        durationSeconds: dto.durationSeconds,
        sortOrder: dto.sortOrder,
        materials: dto.materials ?? null,
        quiz: dto.quiz ?? null,
        minQuizScore: dto.minQuizScore,
      })
      .returning();
    return { data: rows[0] };
  }

  @Patch(':courseId/modules/:moduleId/lessons/:lessonId')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'lesson.update', entity: 'learning_lesson' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body(new ZodValidationPipe(updateLessonSchema)) dto: UpdateLessonDto,
  ) {
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.youtubeVideoId !== undefined) data.youtubeVideoId = dto.youtubeVideoId;
    if (dto.durationSeconds !== undefined) data.durationSeconds = dto.durationSeconds;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.materials !== undefined) data.materials = dto.materials;
    if (dto.quiz !== undefined) data.quiz = dto.quiz;
    if (dto.minQuizScore !== undefined) data.minQuizScore = dto.minQuizScore;

    const [row] = await this.db
      .update(learningLessons)
      .set(data as Partial<typeof learningLessons.$inferInsert>)
      .where(eq(learningLessons.id, lessonId))
      .returning();
    return { data: row };
  }

  @Delete(':courseId/modules/:moduleId/lessons/:lessonId')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'lesson.delete', entity: 'learning_lesson' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLesson(@Param('lessonId') lessonId: string) {
    await this.db
      .delete(learningLessons)
      .where(eq(learningLessons.id, lessonId));
  }

  // --- Material management ---

  @Post(':courseId/modules/:moduleId/lessons/:lessonId/materials')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'lesson.material.upload', entity: 'learning_lesson' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadMaterial(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ) {
    const uploadResult = await this.storageService.uploadMaterial(courseId, lessonId, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
    });

    // Read current lesson to get existing materials
    const [lesson] = await this.db
      .select({ materials: learningLessons.materials })
      .from(learningLessons)
      .where(eq(learningLessons.id, lessonId));

    const existingMaterials = (lesson?.materials as LessonMaterial[] | null) ?? [];
    const updatedMaterials: LessonMaterial[] = [
      ...existingMaterials,
      { name: file.originalname, storagePath: uploadResult.storagePath },
    ];

    const [updated] = await this.db
      .update(learningLessons)
      .set({ materials: updatedMaterials })
      .where(eq(learningLessons.id, lessonId))
      .returning();

    return { data: updated };
  }

  @Delete(':courseId/modules/:moduleId/lessons/:lessonId/materials/:materialIndex')
  @Roles('admin', 'hr', 'hr_admin')
  @Auditable({ action: 'lesson.material.delete', entity: 'learning_lesson' })
  @HttpCode(HttpStatus.OK)
  async deleteMaterial(
    @Param('lessonId') lessonId: string,
    @Param('materialIndex') materialIndex: string,
  ) {
    const [lesson] = await this.db
      .select({ materials: learningLessons.materials })
      .from(learningLessons)
      .where(eq(learningLessons.id, lessonId));

    const existingMaterials = (lesson?.materials as LessonMaterial[] | null) ?? [];
    const idx = Number.parseInt(materialIndex, 10);

    if (idx < 0 || idx >= existingMaterials.length) {
      return { data: null, error: 'Material not found' };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const materialToDelete = existingMaterials[idx]!;
    await this.storageService.deleteMaterial(materialToDelete.storagePath);

    const updatedMaterials = existingMaterials.filter((_, i) => i !== idx);

    const [updated] = await this.db
      .update(learningLessons)
      .set({ materials: updatedMaterials.length > 0 ? updatedMaterials : null })
      .where(eq(learningLessons.id, lessonId))
      .returning();

    return { data: updated };
  }
}
