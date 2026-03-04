import type { ClientContact } from './client-contact.entity';

export const CLIENT_CONTACT_REPOSITORY = Symbol('CLIENT_CONTACT_REPOSITORY');

export interface ClientContactRepository {
  findAllByClientId(clientId: string): Promise<ClientContact[]>;
  findById(id: string): Promise<ClientContact | null>;
  findByClientAndSource(clientId: string, source: string): Promise<ClientContact | null>;
  save(contact: ClientContact): Promise<ClientContact>;
  update(id: string, data: Record<string, unknown>): Promise<ClientContact | null>;
  delete(id: string): Promise<void>;
}
