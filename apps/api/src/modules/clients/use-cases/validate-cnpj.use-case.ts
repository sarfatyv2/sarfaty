import { Injectable } from '@nestjs/common';
import { CnpjApiAdapter, type CnpjValidationResult } from '../infra/cnpj-api.adapter';

@Injectable()
export class ValidateCnpjUseCase {
  constructor(private readonly cnpjApiAdapter: CnpjApiAdapter) {}

  async execute(cnpj: string): Promise<CnpjValidationResult> {
    return this.cnpjApiAdapter.validate(cnpj);
  }
}
