import { ClientAuthorizedPerson, type ClientAuthorizedPersonProps, type AuthorizedPersonType } from '../../domain/client-authorized-person.entity';
import type { clientAuthorizedPersons } from '../../../../database/schema';

type Row = typeof clientAuthorizedPersons.$inferSelect;

export class ClientAuthorizedPersonMapper {
  static toDomain(row: Row): ClientAuthorizedPerson {
    const props: ClientAuthorizedPersonProps = {
      id: row.id,
      clientId: row.clientId,
      authorizationType: row.authorizationType,
      fullName: row.fullName,
      personType: (row.personType as AuthorizedPersonType) ?? 'pf',
      cpf: row.cpf,
      cnpj: row.cnpj ?? null,
      linkedClientId: row.linkedClientId ?? null,
      phone: row.phone,
      email: row.email,
      source: row.source,
      sourceQueriedAt: row.sourceQueriedAt,
      joinedAt: row.joinedAt ?? null,
      mandateEndAt: row.mandateEndAt ?? null,
      role: row.role ?? null,
      participationPercentage: row.participationPercentage ?? null,
      capitalTotalValue: row.capitalTotalValue ?? null,
      restrictionSign: row.restrictionSign ?? null,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ClientAuthorizedPerson.reconstitute(props);
  }

  static toPersistence(person: ClientAuthorizedPerson): Record<string, unknown> {
    return {
      clientId: person.clientId,
      authorizationType: person.authorizationType,
      fullName: person.fullName,
      personType: person.personType,
      cpf: person.cpf,
      cnpj: person.cnpj,
      linkedClientId: person.linkedClientId,
      phone: person.phone,
      email: person.email,
      source: person.source,
      sourceQueriedAt: person.sourceQueriedAt,
      joinedAt: person.joinedAt,
      mandateEndAt: person.mandateEndAt,
      role: person.role,
      participationPercentage: person.participationPercentage,
      capitalTotalValue: person.capitalTotalValue,
      restrictionSign: person.restrictionSign,
      isActive: person.isActive,
    };
  }
}
