import { Inject, Injectable } from '@nestjs/common';
import { VaduRepository, VADU_REPOSITORY } from '../domain/vadu.repository';

export interface VaduResultsOutput {
  company: any | null;
  persons: any[];
}

@Injectable()
export class GetVaduResultsUseCase {
  constructor(
    @Inject(VADU_REPOSITORY)
    private readonly vaduRepository: VaduRepository,
  ) {}

  async execute(clientId: string): Promise<VaduResultsOutput> {
    const [companyResult, personResults] = await Promise.all([
      this.vaduRepository.getLatestCompanyResult(clientId),
      this.vaduRepository.getLatestPersonResults(clientId),
    ]);

    return {
      company: companyResult ? {
        id: companyResult.id,
        cnpj: companyResult.cnpj,
        companyName: companyResult.companyName,
        tradeName: companyResult.tradeName,
        revenueStatus: companyResult.revenueStatus,
        revenueStatusDate: companyResult.revenueStatusDate,
        specialStatus: companyResult.specialStatus,
        capitalSocial: companyResult.capitalSocial,
        legalNature: companyResult.legalNature,
        isSimplesNacional: companyResult.isSimplesNacional,
        companySize: companyResult.companySize,
        environmentalScore: companyResult.environmentalScore,
        environmentalLevel: companyResult.environmentalLevel,
        rawData: companyResult.rawData,
        queriedAt: companyResult.queriedAt,
      } : null,
      persons: personResults.map(p => ({
        id: p.id,
        authorizedPersonId: p.authorizedPersonId,
        cpf: p.cpf,
        name: p.name,
        birthDate: p.birthDate,
        motherName: p.motherName,
        rawData: p.rawData,
        queriedAt: p.queriedAt,
      })),
    };
  }
}
