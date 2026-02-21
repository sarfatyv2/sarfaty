import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../domain/drawee.repository';
import { DraweeNotFoundException } from '../domain/exceptions/drawee-not-found.exception';

@Injectable()
export class GetDraweeUseCase {
  constructor(
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepository: DraweeRepository,
  ) {}

  async execute(id: string) {
    const drawee = await this.draweeRepository.findById(id);
    if (!drawee) throw new DraweeNotFoundException(id);
    return drawee;
  }
}
