import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';

@Injectable()
export class DeleteClientAuthorizedPersonUseCase {
  constructor(
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: ClientAuthorizedPersonRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findById(id);
    if (!person) throw new NotFoundException(`Authorized person ${id} not found`);
    await this.personRepository.delete(id);
  }
}
