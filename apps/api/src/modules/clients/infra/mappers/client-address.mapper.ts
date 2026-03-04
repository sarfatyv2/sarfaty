import { ClientAddress, type ClientAddressProps } from '../../domain/client-address.entity';
import type { clientAddresses } from '../../../../database/schema';

type Row = typeof clientAddresses.$inferSelect;

export class ClientAddressMapper {
  static toDomain(row: Row): ClientAddress {
    const props: ClientAddressProps = {
      id: row.id,
      clientId: row.clientId,
      useType: row.useType,
      street: row.street,
      number: row.number,
      withoutNumber: row.withoutNumber ?? false,
      complement: row.complement,
      neighborhood: row.neighborhood,
      zipCode: row.zipCode,
      city: row.city,
      state: row.state,
      source: row.source,
      sourceQueriedAt: row.sourceQueriedAt,
      isPrimary: row.isPrimary ?? false,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ClientAddress.reconstitute(props);
  }

  static toPersistence(address: ClientAddress): Record<string, unknown> {
    return {
      clientId: address.clientId,
      useType: address.useType,
      street: address.street,
      number: address.number,
      withoutNumber: address.withoutNumber,
      complement: address.complement,
      neighborhood: address.neighborhood,
      zipCode: address.zipCode,
      city: address.city,
      state: address.state,
      source: address.source,
      sourceQueriedAt: address.sourceQueriedAt,
      isPrimary: address.isPrimary,
      isActive: address.isActive,
    };
  }
}
