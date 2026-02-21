import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';
import type { UpdateClientAuthorizedPersonDto } from '@nexus/validators';

@Injectable()
export class UpdateClientAuthorizedPersonUseCase {
  constructor(
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: ClientAuthorizedPersonRepository,
  ) {}

  async execute(id: string, dto: UpdateClientAuthorizedPersonDto) {
    const updated = await this.personRepository.update(id, dto as Record<string, unknown>);
    if (!updated) throw new NotFoundException(`Authorized person ${id} not found`);
    return updated.toPlainObject();
  }
}
