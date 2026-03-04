import { ClientAuthorizedPerson, type ClientAuthorizedPersonProps } from '../../domain/client-authorized-person.entity';
import type { clientAuthorizedPersons } from '../../../../database/schema';

type Row = typeof clientAuthorizedPersons.$inferSelect;

export class ClientAuthorizedPersonMapper {
  static toDomain(row: Row): ClientAuthorizedPerson {
    const props: ClientAuthorizedPersonProps = {
      id: row.id,
      clientId: row.clientId,
      authorizationType: row.authorizationType,
      fullName: row.fullName,
      cpf: row.cpf,
      phone: row.phone,
      email: row.email,
      source: row.source,
      sourceQueriedAt: row.sourceQueriedAt,
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
      cpf: person.cpf,
      phone: person.phone,
      email: person.email,
      source: person.source,
      sourceQueriedAt: person.sourceQueriedAt,
      isActive: person.isActive,
    };
  }
}
