import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_BANK_ACCOUNT_REPOSITORY, type ClientBankAccountRepository } from '../domain/client-bank-account.repository';

@Injectable()
export class DeleteClientBankAccountUseCase {
  constructor(
    @Inject(CLIENT_BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: ClientBankAccountRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const account = await this.bankAccountRepository.findById(id);
    if (!account) throw new NotFoundException(`Bank account ${id} not found`);
    await this.bankAccountRepository.delete(id);
  }
}
