import { NotFoundException } from '@nestjs/common';

export class DraweeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Drawee with id "${id}" not found`);
  }
}
