import { UnprocessableEntityException } from '@nestjs/common';

export class UnsupportedBankException extends UnprocessableEntityException {
  constructor(bankCode: string) {
    super(`No parser available for bank code "${bankCode}"`);
  }
}
