import { DomainException } from '@nexus/types';

export class CnpjAlreadyExistsException extends DomainException {
  readonly code = 'CNPJ_ALREADY_EXISTS';
  readonly httpStatus = 409;

  constructor(cnpj: string) {
    super(`A client with CNPJ ${cnpj} already exists`);
  }
}
