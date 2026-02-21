import { ConflictException } from '@nestjs/common';

export class CnpjAlreadyExistsException extends ConflictException {
  constructor(cnpj: string) {
    super(`A drawee with CNPJ "${cnpj}" already exists`);
  }
}
