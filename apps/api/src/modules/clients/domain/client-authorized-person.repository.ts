import type { ClientAuthorizedPerson } from './client-authorized-person.entity';

export const CLIENT_AUTHORIZED_PERSON_REPOSITORY = Symbol('CLIENT_AUTHORIZED_PERSON_REPOSITORY');

export interface ClientAuthorizedPersonRepository {
  findAllByClientId(clientId: string): Promise<ClientAuthorizedPerson[]>;
  findById(id: string): Promise<ClientAuthorizedPerson | null>;
  save(person: ClientAuthorizedPerson): Promise<ClientAuthorizedPerson>;
  update(id: string, data: Record<string, unknown>): Promise<ClientAuthorizedPerson | null>;
  delete(id: string): Promise<void>;
}
