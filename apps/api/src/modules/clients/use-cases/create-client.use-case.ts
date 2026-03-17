import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import type { CreateClientDto } from '@nexus/validators';
import { Client } from '../domain/client.entity';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';
import { CnpjAlreadyExistsException } from '../domain/exceptions/cnpj-already-exists.exception';
import { ClientCreatedEvent } from '../../notifications/domain/events/client-events';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientAuthorizedPersons, economicGroupMembers } from '../../../database/schema';

export interface CreateClientInput {
  dto: CreateClientDto;
  assignedTo: string;
  teamId: string | null;
  regionId: string | null;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly authorizedPersonRepository: ClientAuthorizedPersonRepository,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: CreateClientInput): Promise<Client> {
    const cleanCnpj = input.dto.cnpj.replaceAll(/\D/g, '');

    const existingClient = await this.clientRepository.findByCnpj(cleanCnpj);
    if (existingClient) {
      throw new CnpjAlreadyExistsException(input.dto.cnpj);
    }

    const client = Client.create({
      companyName: input.dto.companyName,
      cnpj: cleanCnpj,
      tradeName: input.dto.tradeName ?? null,
      segmentId: input.dto.segmentId,
      phone: input.dto.phone,
      email: input.dto.email,
      addressStreet: input.dto.addressStreet ?? null,
      addressNumber: input.dto.addressNumber ?? null,
      addressComplement: input.dto.addressComplement ?? null,
      addressNeighborhood: input.dto.addressNeighborhood ?? null,
      addressCity: input.dto.addressCity ?? null,
      addressState: input.dto.addressState ?? null,
      addressZip: input.dto.addressZip ?? null,
      creditProductId: input.dto.creditProductId,
      requestedAmount: input.dto.requestedAmount?.toString() ?? null,
      hasGuarantees: false,
      isJudicialRecovery: false,
      workingCapitalNotes: null,
      assignedTo: input.assignedTo,
      teamId: input.teamId,
      regionId: input.regionId,
      cnpjStatus: null,
      cnpjValidatedAt: null,
      cnpjRoot: null,
      stateRegistration: null,
      cityRegistration: null,
      foundedAt: null,
      establishedAt: null,
      closedAt: null,
      closureReason: null,
      isPep: false,
      isPepRelated: false,
      isOfacListed: false,
      hasRiskProfession: false,
      hasRiskActivity: false,
      hasRiskCity: false,
      riskRating: null,
      revenueSituation: null,
      economicGroupId: null,
      legacySgsId: null,
      legacyNfId: null,
    });

    const saved = await this.clientRepository.save(client);

    // Retroactive linking: check if this CNPJ was already registered as a PJ partner of another client
    await this.retroactiveLinkPjPartner(saved.id, cleanCnpj);

    this.eventEmitter.emit(
      ClientCreatedEvent.EVENT_NAME,
      new ClientCreatedEvent(
        saved.id,
        saved.companyName,
        input.assignedTo,
        input.dto.companyName,
        input.teamId,
      ),
    );

    return saved;
  }

  private async retroactiveLinkPjPartner(newClientId: string, cnpj: string): Promise<void> {
    try {
      const pjPartners = await this.authorizedPersonRepository.findPjPartnersByCnpj(cnpj);
      if (pjPartners.length === 0) return;

      for (const partner of pjPartners) {
        await this.authorizedPersonRepository.update(partner.id, { linkedClientId: newClientId });

        // Update economic_group_members: find the 'company' member linked to the same economic group
        // as the parent client and set client_id to the new client
        const parentClientRows = await this.db
          .select({ economicGroupId: clientAuthorizedPersons.clientId })
          .from(clientAuthorizedPersons)
          .where(eq(clientAuthorizedPersons.id, partner.id))
          .limit(1)
          .execute();

        const parentClientId = parentClientRows[0]?.economicGroupId;
        if (!parentClientId) continue;

        await this.db
          .update(economicGroupMembers)
          .set({ clientId: newClientId })
          .where(
            and(
              eq(economicGroupMembers.memberType, 'company'),
              eq(economicGroupMembers.clientId, null as unknown as string),
            ),
          )
          .execute();
      }
    } catch (error) {
      // Non-blocking: log but don't fail the client creation
      console.error(`Retroactive PJ partner linking failed for CNPJ ${cnpj}: ${(error as Error).message}`);
    }
  }
}
