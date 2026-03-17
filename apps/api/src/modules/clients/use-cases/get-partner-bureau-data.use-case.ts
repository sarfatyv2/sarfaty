import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientAuthorizedPersons, vaduCompanyResults } from '../../../database/schema';

@Injectable()
export class GetPartnerBureauDataUseCase {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async execute(clientId: string, authorizedPersonId: string) {
    const [partner] = await this.db
      .select({
        id: clientAuthorizedPersons.id,
        personType: clientAuthorizedPersons.personType,
        cnpj: clientAuthorizedPersons.cnpj,
        fullName: clientAuthorizedPersons.fullName,
        linkedClientId: clientAuthorizedPersons.linkedClientId,
      })
      .from(clientAuthorizedPersons)
      .where(
        and(
          eq(clientAuthorizedPersons.id, authorizedPersonId),
          eq(clientAuthorizedPersons.clientId, clientId),
        ),
      )
      .limit(1)
      .execute();

    if (!partner) {
      throw new NotFoundException(`Authorized person ${authorizedPersonId} not found`);
    }

    if (partner.personType !== 'pj' || !partner.cnpj) {
      return {
        partner: {
          id: partner.id,
          fullName: partner.fullName,
          personType: partner.personType,
          cnpj: partner.cnpj,
          linkedClientId: partner.linkedClientId,
        },
        bureauData: null,
      };
    }

    const [latestVadu] = await this.db
      .select()
      .from(vaduCompanyResults)
      .where(
        and(
          eq(vaduCompanyResults.clientId, clientId),
          eq(vaduCompanyResults.cnpj, partner.cnpj),
        ),
      )
      .orderBy(desc(vaduCompanyResults.queriedAt))
      .limit(1)
      .execute();

    return {
      partner: {
        id: partner.id,
        fullName: partner.fullName,
        personType: partner.personType,
        cnpj: partner.cnpj,
        linkedClientId: partner.linkedClientId,
      },
      bureauData: latestVadu
        ? {
            companyName: latestVadu.companyName,
            tradeName: latestVadu.tradeName,
            revenueStatus: latestVadu.revenueStatus,
            revenueStatusDate: latestVadu.revenueStatusDate,
            specialStatus: latestVadu.specialStatus,
            capitalSocial: latestVadu.capitalSocial,
            legalNature: latestVadu.legalNature,
            isSimplesNacional: latestVadu.isSimplesNacional,
            companySize: latestVadu.companySize,
            environmentalScore: latestVadu.environmentalScore,
            environmentalLevel: latestVadu.environmentalLevel,
            queriedAt: latestVadu.queriedAt,
          }
        : null,
    };
  }
}
