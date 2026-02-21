import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_BANK_ACCOUNT_REPOSITORY, type ClientBankAccountRepository } from '../domain/client-bank-account.repository';
import type { UpdateClientBankAccountDto } from '@nexus/validators';

@Injectable()
export class UpdateClientBankAccountUseCase {
  constructor(
    @Inject(CLIENT_BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: ClientBankAccountRepository,
  ) {}

  async execute(id: string, dto: UpdateClientBankAccountDto) {
    const updated = await this.bankAccountRepository.update(id, dto as Record<string, unknown>);
    if (!updated) throw new NotFoundException(`Bank account ${id} not found`);
    return updated.toPlainObject();
  }
}
