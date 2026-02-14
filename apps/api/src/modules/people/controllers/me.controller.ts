import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { updateCollaboratorSelfSchema, type UpdateCollaboratorSelfDto } from '../dto/update-collaborator.dto';
import { GetMyProfileUseCase } from '../use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from '../use-cases/update-my-profile.use-case';
import { ListDependentsUseCase } from '../use-cases/list-dependents.use-case';

@ApiTags('People - My Profile')
@ApiBearerAuth()
@Controller('people/me')
export class MeController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly listDependentsUseCase: ListDependentsUseCase,
  ) {}

  @Get()
  async getMyProfile(
    @CurrentUser() user: { id: string },
  ) {
    const collaborator = await this.getMyProfileUseCase.execute(user.id);
    return { data: collaborator.toPlainObject() };
  }

  @Patch()
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(updateCollaboratorSelfSchema)) dto: UpdateCollaboratorSelfDto,
  ) {
    const collaborator = await this.updateMyProfileUseCase.execute(user.id, dto);
    return { data: collaborator.toPlainObject() };
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
