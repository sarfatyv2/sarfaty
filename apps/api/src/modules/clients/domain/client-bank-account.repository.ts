import type { ClientBankAccount } from './client-bank-account.entity';

export const CLIENT_BANK_ACCOUNT_REPOSITORY = Symbol('CLIENT_BANK_ACCOUNT_REPOSITORY');

export interface ClientBankAccountRepository {
  findAllByClientId(clientId: string): Promise<ClientBankAccount[]>;
  findById(id: string): Promise<ClientBankAccount | null>;
  save(bankAccount: ClientBankAccount): Promise<ClientBankAccount>;
  update(id: string, data: Record<string, unknown>): Promise<ClientBankAccount | null>;
  delete(id: string): Promise<void>;
}
