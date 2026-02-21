import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_BANK_ACCOUNT_REPOSITORY, type ClientBankAccountRepository } from '../domain/client-bank-account.repository';

@Injectable()
export class ListClientBankAccountsUseCase {
  constructor(
    @Inject(CLIENT_BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: ClientBankAccountRepository,
  ) {}

  async execute(clientId: string) {
    const accounts = await this.bankAccountRepository.findAllByClientId(clientId);
    return accounts.map((a) => a.toPlainObject());
  }
}
