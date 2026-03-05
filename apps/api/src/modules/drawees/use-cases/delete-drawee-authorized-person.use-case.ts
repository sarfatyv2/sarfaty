import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY, type DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';

@Injectable()
export class DeleteDraweeAuthorizedPersonUseCase {
  constructor(
    @Inject(DRAWEE_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: DraweeAuthorizedPersonRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findById(id);
    if (!person) throw new NotFoundException(`Authorized person ${id} not found`);
    await this.personRepository.delete(id);
  }
}
