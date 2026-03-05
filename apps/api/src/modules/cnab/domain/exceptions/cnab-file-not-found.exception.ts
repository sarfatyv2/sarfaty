import { NotFoundException } from '@nestjs/common';

export class CnabFileNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`CNAB file with id "${id}" not found`);
  }
}
