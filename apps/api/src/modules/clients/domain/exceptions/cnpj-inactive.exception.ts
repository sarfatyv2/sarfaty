import { DomainException } from '@nexus/types';

export class CnpjInactiveException extends DomainException {
  readonly code = 'CNPJ_INACTIVE';
  readonly httpStatus = 422;

  constructor(cnpj: string, status: string) {
    super(`CNPJ ${cnpj} is not active. Status: ${status}`);
  }
}
