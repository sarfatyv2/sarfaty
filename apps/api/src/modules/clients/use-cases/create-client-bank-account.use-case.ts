import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_BANK_ACCOUNT_REPOSITORY, type ClientBankAccountRepository } from '../domain/client-bank-account.repository';
import { ClientBankAccount } from '../domain/client-bank-account.entity';
import type { CreateClientBankAccountDto } from '@nexus/validators';

@Injectable()
export class CreateClientBankAccountUseCase {
  constructor(
    @Inject(CLIENT_BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: ClientBankAccountRepository,
  ) {}

  async execute(clientId: string, dto: CreateClientBankAccountDto) {
    const account = ClientBankAccount.create({
      clientId,
      bankCode: dto.bankCode ?? null,
      bankName: dto.bankName ?? null,
      branch: dto.branch ?? null,
      accountNumber: dto.accountNumber ?? null,
      accountType: dto.accountType ?? null,
      pixKey: dto.pixKey ?? null,
      nickname: dto.nickname ?? null,
      openedAt: dto.openedAt ?? null,
      closedAt: dto.closedAt ?? null,
      status: dto.status,
      isPrimary: dto.isPrimary,
    });
    const saved = await this.bankAccountRepository.save(account);
    return saved.toPlainObject();
  }
}
