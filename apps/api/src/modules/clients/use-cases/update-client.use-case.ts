import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { UpdateClientDto } from '@nexus/validators';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientGuarantees } from '../../../database/schema';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import type { Client } from '../domain/client.entity';

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundException(id);
    }

    if (!client.canEdit()) {
      throw new Error(`Client cannot be edited in status '${client.status}'`);
    }

    const { guarantees, ...updateData } = dto;

    // Handle guarantees if provided
    if (guarantees !== undefined) {
      // Delete existing guarantees
      await this.db
        .delete(clientGuarantees)
        .where(eq(clientGuarantees.clientId, id));

      // Insert new guarantees
      if (guarantees.length > 0) {
        await this.db
          .insert(clientGuarantees)
          .values(
            guarantees.map((g) => ({
              clientId: id,
              guaranteeTypeId: g.guaranteeTypeId,
              description: g.description ?? null,
              estimatedValue: g.estimatedValue?.toString() ?? null,
            })),
          );
      }
    }

    const updated = await this.clientRepository.update(id, {
      ...updateData,
      requestedAmount: updateData.requestedAmount?.toString(),
    });

    if (!updated) {
      throw new ClientNotFoundException(id);
    }

    return updated;
  }
}
