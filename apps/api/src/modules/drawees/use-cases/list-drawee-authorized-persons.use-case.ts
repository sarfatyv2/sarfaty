import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY, type DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';

@Injectable()
export class ListDraweeAuthorizedPersonsUseCase {
  constructor(
    @Inject(DRAWEE_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: DraweeAuthorizedPersonRepository,
  ) {}

  async execute(draweeId: string) {
    const persons = await this.personRepository.findAllByDraweeId(draweeId);
    return persons.map((p) => p.toPlainObject());
  }
}
