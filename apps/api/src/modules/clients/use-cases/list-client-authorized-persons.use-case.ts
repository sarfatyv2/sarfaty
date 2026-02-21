import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';

@Injectable()
export class ListClientAuthorizedPersonsUseCase {
  constructor(
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: ClientAuthorizedPersonRepository,
  ) {}

  async execute(clientId: string) {
    const persons = await this.personRepository.findAllByClientId(clientId);
    return persons.map((p) => p.toPlainObject());
  }
}
