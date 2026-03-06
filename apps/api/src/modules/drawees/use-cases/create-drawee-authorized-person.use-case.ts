import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY, type DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';
import { DraweeAuthorizedPerson } from '../domain/drawee-authorized-person.entity';
import type { CreateDraweeAuthorizedPersonDto } from '@nexus/validators';

@Injectable()
export class CreateDraweeAuthorizedPersonUseCase {
  constructor(
    @Inject(DRAWEE_AUTHORIZED_PERSON_REPOSITORY)
    private readonly personRepository: DraweeAuthorizedPersonRepository,
  ) {}

  async execute(draweeId: string, dto: CreateDraweeAuthorizedPersonDto) {
    const cleanCpf = dto.cpf ? dto.cpf.replaceAll(/\D/g, '') || null : null;
    const person = DraweeAuthorizedPerson.create({
      draweeId,
      authorizationType: dto.authorizationType ?? null,
      fullName: dto.fullName,
      cpf: cleanCpf,
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
