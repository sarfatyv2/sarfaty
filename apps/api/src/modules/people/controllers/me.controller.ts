import { BadRequestException, Controller, Get, Inject, Patch, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { updateCollaboratorSelfSchema, type UpdateCollaboratorSelfDto } from '../dto/update-collaborator.dto';
import { GetMyProfileUseCase } from '../use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from '../use-cases/update-my-profile.use-case';
import { ListDependentsUseCase } from '../use-cases/list-dependents.use-case';
import { UploadAvatarUseCase } from '../use-cases/upload-avatar.use-case';

@ApiTags('People - My Profile')
@ApiBearerAuth()
@Controller('people/me')
export class MeController {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly listDependentsUseCase: ListDependentsUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
  ) {}

  @Get()
  async getMyProfile(
    @CurrentUser() user: { id: string },
  ) {
    const collaborator = await this.getMyProfileUseCase.execute(user.id);

    const [profile] = await this.db
      .select({ avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return { data: { ...collaborator.toPlainObject(), avatarUrl: profile?.avatarUrl ?? null } };
  }

  @Patch()
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(updateCollaboratorSelfSchema)) dto: UpdateCollaboratorSelfDto,
  ) {
    const collaborator = await this.updateMyProfileUseCase.execute(user.id, dto);
    return { data: collaborator.toPlainObject() };
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @CurrentUser() user: { id: string },
    @Req() req: { body: Record<string, unknown> },
  ) {
    const body = req.body as Record<string, { toBuffer?: () => Promise<Buffer>; filename?: string; mimetype?: string }>;
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const filePart = body.file;
    if (!filePart?.toBuffer) {
      throw new BadRequestException('File is required');
    }

    const buffer = await filePart.toBuffer();
    const avatarUrl = await this.uploadAvatarUseCase.execute(user.id, {
      buffer,
      mimetype: filePart.mimetype ?? 'image/jpeg',
    });
    return { data: { avatarUrl } };
  }

  @Get('dependents')
  async getMyDependents(
    @CurrentUser() user: { id: string },
  ) {
    const profile = await this.getMyProfileUseCase.execute(user.id);
    const dependents = await this.listDependentsUseCase.execute(profile.id);
    return { data: dependents.map((d) => d.toPlainObject()) };
  }
}
