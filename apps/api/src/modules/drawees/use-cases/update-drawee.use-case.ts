import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../domain/drawee.repository';
import { DraweeNotFoundException } from '../domain/exceptions/drawee-not-found.exception';
import type { UpdateDraweeDto } from '@nexus/validators';

@Injectable()
export class UpdateDraweeUseCase {
  constructor(
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepository: DraweeRepository,
  ) {}

  async execute(id: string, dto: UpdateDraweeDto) {
    const drawee = await this.draweeRepository.findById(id);
    if (!drawee) throw new DraweeNotFoundException(id);

    const updated = await this.draweeRepository.update(id, dto as Record<string, unknown>);
    if (!updated) throw new DraweeNotFoundException(id);
    return updated;
  }
}
