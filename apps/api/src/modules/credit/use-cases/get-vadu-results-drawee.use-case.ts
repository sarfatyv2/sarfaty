import { Inject, Injectable } from '@nestjs/common';
import { VaduDraweeRepository, VADU_DRAWEE_REPOSITORY } from '../domain/vadu-drawee.repository';

export interface VaduDraweeResultsOutput {
  company: {
    id: string;
    cnpj: string | null;
    companyName: string | null;
    tradeName: string | null;
    revenueStatus: string | null;
    revenueStatusDate: Date | null;
    specialStatus: string | null;
    capitalSocial: number | null;
    legalNature: string | null;
    isSimplesNacional: boolean | null;
    companySize: string | null;
    environmentalScore: number | null;
    environmentalLevel: string | null;
    rawData: unknown;
    queriedAt: Date;
  } | null;
  persons: Array<{
    id: string;
    cpf: string | null;
    name: string | null;
    birthDate: Date | null;
    motherName: string | null;
    rawData: unknown;
    queriedAt: Date;
  }>;
}

@Injectable()
export class GetVaduResultsDraweeUseCase {
  constructor(
    @Inject(VADU_DRAWEE_REPOSITORY)
    private readonly vaduDraweeRepository: VaduDraweeRepository,
  ) {}

  async execute(draweeId: string): Promise<VaduDraweeResultsOutput> {
    const [companyResult, personResults] = await Promise.all([
      this.vaduDraweeRepository.getLatestCompanyResult(draweeId),
      this.vaduDraweeRepository.getLatestPersonResults(draweeId),
    ]);

    return {
      company: companyResult
        ? {
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
          }
        : null,
      persons: personResults.map((p) => ({
        id: p.id,
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
