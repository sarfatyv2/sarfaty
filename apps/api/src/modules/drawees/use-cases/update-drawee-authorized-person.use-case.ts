import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY, type DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';
import type { UpdateDraweeAuthorizedPersonDto } from '@nexus/validators';

@Injectable()
export class UpdateDraweeAuthorizedPersonUseCase {
  constructor(
    @Inject(DRAWEE_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: DraweeAuthorizedPersonRepository,
  ) {}

  async execute(id: string, dto: UpdateDraweeAuthorizedPersonDto) {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.cpf !== undefined) {
      updateData.cpf = dto.cpf ? dto.cpf.replaceAll(/\D/g, '') || null : null;
    }
    const updated = await this.personRepository.update(id, updateData);
    if (!updated) throw new NotFoundException(`Authorized person ${id} not found`);
    return updated.toPlainObject();
  }
}
