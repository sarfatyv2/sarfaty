import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../domain/drawee.repository';
import { Drawee } from '../domain/drawee.entity';
import { CnpjAlreadyExistsException } from '../domain/exceptions/cnpj-already-exists.exception';
import type { CreateDraweeDto } from '@nexus/validators';

@Injectable()
export class CreateDraweeUseCase {
  constructor(
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepository: DraweeRepository,
  ) {}

  async execute(dto: CreateDraweeDto): Promise<Drawee> {
    if (dto.cnpj) {
      const existing = await this.draweeRepository.findByCnpj(dto.cnpj);
      if (existing) throw new CnpjAlreadyExistsException(dto.cnpj);
    }

    const drawee = Drawee.create({
      personType: dto.personType ?? 'company',
      companyName: dto.companyName,
      tradeName: dto.tradeName ?? null,
      legalName: dto.legalName ?? null,
      cnpj: dto.cnpj ?? null,
      cnpjRoot: null,
      cpf: dto.cpf ?? null,
      rg: dto.rg ?? null,
      birthDate: dto.birthDate ?? null,
      gender: dto.gender ?? null,
      rgDocumentId: null,
      cnhDocumentId: null,
      isPep: dto.isPep ?? false,
      isOfacListed: dto.isOfacListed ?? false,
      riskRating: null,
      creditScore: null,
      assignedTo: null,
      segmentId: dto.segmentId ?? null,
      economicGroupId: dto.economicGroupId ?? null,
      status: dto.status ?? 'active',
      blockedAt: null,
      blockReason: null,
      legacySgsId: null,
      legacyNfId: null,
    });

    return this.draweeRepository.save(drawee);
  }
}
