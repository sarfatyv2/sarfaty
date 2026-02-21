import type { ClientAddress } from './client-address.entity';

export const CLIENT_ADDRESS_REPOSITORY = Symbol('CLIENT_ADDRESS_REPOSITORY');

export interface ClientAddressRepository {
  findAllByClientId(clientId: string): Promise<ClientAddress[]>;
  findById(id: string): Promise<ClientAddress | null>;
  save(address: ClientAddress): Promise<ClientAddress>;
  update(id: string, data: Record<string, unknown>): Promise<ClientAddress | null>;
  delete(id: string): Promise<void>;
}
