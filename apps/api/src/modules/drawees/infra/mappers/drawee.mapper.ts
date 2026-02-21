import { Drawee, type DraweeProps } from '../../domain/drawee.entity';
import type { PersonType } from '@nexus/types';
import type { drawees } from '../../../../database/schema';

type DraweeSelectRow = typeof drawees.$inferSelect;

export class DraweeMapper {
  static toDomain(row: DraweeSelectRow): Drawee {
    const props: DraweeProps = {
      id: row.id,
      personType: (row.personType ?? 'company') as PersonType,
      cpf: row.cpf,
      cnpj: row.cnpj,
      cnpjRoot: row.cnpjRoot,
      tradeName: row.tradeName,
      companyName: row.companyName,
      legalName: row.legalName,
      rg: row.rg,
      birthDate: row.birthDate,
      gender: row.gender,
      rgDocumentId: row.rgDocumentId,
      cnhDocumentId: row.cnhDocumentId,
      isPep: row.isPep ?? false,
      isOfacListed: row.isOfacListed ?? false,
      riskRating: row.riskRating,
      creditScore: row.creditScore,
      assignedTo: row.assignedTo,
      segmentId: row.segmentId,
      economicGroupId: row.economicGroupId,
      status: row.status ?? 'active',
      blockedAt: row.blockedAt,
      blockReason: row.blockReason,
      legacySgsId: row.legacySgsId,
      legacyNfId: row.legacyNfId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Drawee.reconstitute(props);
  }

  static toPersistence(drawee: Drawee): Record<string, unknown> {
    return {
      personType: drawee.personType,
      cpf: drawee.cpf,
      cnpj: drawee.cnpj,
      cnpjRoot: drawee.cnpjRoot,
      tradeName: drawee.tradeName,
      companyName: drawee.companyName,
      legalName: drawee.legalName,
      rg: drawee.rg,
      birthDate: drawee.birthDate,
      gender: drawee.gender,
      rgDocumentId: drawee.rgDocumentId,
      cnhDocumentId: drawee.cnhDocumentId,
      isPep: drawee.isPep,
      isOfacListed: drawee.isOfacListed,
      riskRating: drawee.riskRating,
      creditScore: drawee.creditScore,
      assignedTo: drawee.assignedTo,
      segmentId: drawee.segmentId,
      economicGroupId: drawee.economicGroupId,
      status: drawee.status,
      blockedAt: drawee.blockedAt,
      blockReason: drawee.blockReason,
      legacySgsId: drawee.legacySgsId,
      legacyNfId: drawee.legacyNfId,
    };
  }
}
