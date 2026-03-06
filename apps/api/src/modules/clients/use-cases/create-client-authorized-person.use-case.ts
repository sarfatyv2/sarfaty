import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';
import { ClientAuthorizedPerson } from '../domain/client-authorized-person.entity';
import type { CreateClientAuthorizedPersonDto } from '@nexus/validators';

@Injectable()
export class CreateClientAuthorizedPersonUseCase {
  constructor(
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: ClientAuthorizedPersonRepository,
  ) {}

  async execute(clientId: string, dto: CreateClientAuthorizedPersonDto) {
    const person = ClientAuthorizedPerson.create({
      clientId,
      authorizationType: dto.authorizationType ?? null,
      fullName: dto.fullName,
      cpf: dto.cpf ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      source: 'manual',
      sourceQueriedAt: null,
      joinedAt: null,
      mandateEndAt: null,
      role: null,
      participationPercentage: null,
      capitalTotalValue: null,
      restrictionSign: null,
      isActive: dto.isActive,
    });
    const saved = await this.personRepository.save(person);
    return saved.toPlainObject();
  }
}
