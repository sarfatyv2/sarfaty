import { Client, type ClientProps } from '../../domain/client.entity';
import type { ClientStatus } from '@nexus/types';
import type { clients } from '../../../../database/schema';

type ClientSelectRow = typeof clients.$inferSelect;

export class ClientMapper {
  static toDomain(row: ClientSelectRow): Client {
    const props: ClientProps = {
      id: row.id,
      companyName: row.companyName,
      cnpj: row.cnpj,
      tradeName: row.tradeName,
      segmentId: row.segmentId,
      phone: row.phone,
      email: row.email,
      addressStreet: row.addressStreet,
      addressNumber: row.addressNumber,
      addressComplement: row.addressComplement,
      addressNeighborhood: row.addressNeighborhood,
      addressCity: row.addressCity,
      addressState: row.addressState,
      addressZip: row.addressZip,
      creditProductId: row.creditProductId,
      requestedAmount: row.requestedAmount,
      approvedAmount: row.approvedAmount,
      hasGuarantees: row.hasGuarantees ?? false,
      isJudicialRecovery: row.isJudicialRecovery ?? false,
      workingCapitalNotes: row.workingCapitalNotes,
      status: row.status as ClientStatus,
      assignedTo: row.assignedTo,
      teamId: row.teamId,
      regionId: row.regionId,
      cnpjStatus: row.cnpjStatus,
      cnpjValidatedAt: row.cnpjValidatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      submittedAt: row.submittedAt,
      approvedAt: row.approvedAt,
      homologatedAt: row.homologatedAt,
    };
    return Client.reconstitute(props);
  }

  static toPersistence(client: Client): Record<string, unknown> {
    return {
      companyName: client.companyName,
      cnpj: client.cnpj,
      tradeName: client.tradeName,
      segmentId: client.segmentId,
      phone: client.phone,
      email: client.email,
      addressStreet: client.addressStreet,
      addressNumber: client.addressNumber,
      addressComplement: client.addressComplement,
      addressNeighborhood: client.addressNeighborhood,
      addressCity: client.addressCity,
      addressState: client.addressState,
      addressZip: client.addressZip,
      creditProductId: client.creditProductId,
      requestedAmount: client.requestedAmount,
      approvedAmount: client.approvedAmount,
      hasGuarantees: client.hasGuarantees,
      isJudicialRecovery: client.isJudicialRecovery,
      workingCapitalNotes: client.workingCapitalNotes,
      status: client.status,
      assignedTo: client.assignedTo,
      teamId: client.teamId,
      regionId: client.regionId,
      cnpjStatus: client.cnpjStatus,
      cnpjValidatedAt: client.cnpjValidatedAt,
    };
  }
}
