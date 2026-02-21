import { ClientBankAccount, type ClientBankAccountProps } from '../../domain/client-bank-account.entity';
import type { clientBankAccounts } from '../../../../database/schema';

type Row = typeof clientBankAccounts.$inferSelect;

export class ClientBankAccountMapper {
  static toDomain(row: Row): ClientBankAccount {
    const props: ClientBankAccountProps = {
      id: row.id,
      clientId: row.clientId,
      bankCode: row.bankCode,
      bankName: row.bankName,
      branch: row.branch,
      accountNumber: row.accountNumber,
      accountType: row.accountType,
      pixKey: row.pixKey,
      nickname: row.nickname,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      status: row.status ?? 'active',
      isPrimary: row.isPrimary ?? false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ClientBankAccount.reconstitute(props);
  }

  static toPersistence(account: ClientBankAccount): Record<string, unknown> {
    return {
      clientId: account.clientId,
      bankCode: account.bankCode,
      bankName: account.bankName,
      branch: account.branch,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      pixKey: account.pixKey,
      nickname: account.nickname,
      openedAt: account.openedAt,
      closedAt: account.closedAt,
      status: account.status,
      isPrimary: account.isPrimary,
    };
  }
}
