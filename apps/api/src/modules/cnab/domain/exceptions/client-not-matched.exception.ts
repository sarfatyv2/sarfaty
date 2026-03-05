import { UnprocessableEntityException } from '@nestjs/common';

export class ClientNotMatchedException extends UnprocessableEntityException {
  constructor(doc: string) {
    super(`No client found matching document "${doc}"`);
  }
}
