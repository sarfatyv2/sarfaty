import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { SyncVaduClientUseCase } from '../../use-cases/sync-vadu-client.use-case';
import { SyncComplianceChecksUseCase } from '../../use-cases/sync-compliance-checks.use-case';
import { PartnerCompanyDetectedEvent } from '../../../notifications/domain/events/client-events';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import {
  clients,
  economicGroups,
  economicGroupMembers,
  economicGroupPersons,
} from '../../../../database/schema';

@Injectable()
export class PartnerCompanyListener {
  private readonly logger = new Logger(PartnerCompanyListener.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly syncVaduClientUseCase: SyncVaduClientUseCase,
    private readonly syncComplianceChecksUseCase: SyncComplianceChecksUseCase,
  ) {}

  @OnEvent(PartnerCompanyDetectedEvent.EVENT_NAME, { async: true })
  async handlePartnerCompanyDetected(event: PartnerCompanyDetectedEvent): Promise<void> {
    this.logger.log(
      `Handling partner company detected: CNPJ ${event.cnpj} for client ${event.clientId}`,
    );

    await Promise.allSettled([
      this.runBureauEnrichment(event),
      this.linkEconomicGroup(event),
    ]);
  }

  private async runBureauEnrichment(event: PartnerCompanyDetectedEvent): Promise<void> {
    try {
      await Promise.allSettled([
        this.syncVaduClientUseCase.execute({
          clientId: event.clientId,
          cnpj: event.cnpj,
          authorizedPersons: [],
        }),
        this.syncComplianceChecksUseCase.execute({
          clientId: event.clientId,
          cnpj: event.cnpj,
          companyName: event.companyName,
        }),
      ]);
    } catch (error) {
      this.logger.error(
        `Bureau enrichment failed for partner CNPJ ${event.cnpj}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  private async linkEconomicGroup(event: PartnerCompanyDetectedEvent): Promise<void> {
    try {
      const clientRows = await this.db
        .select({ economicGroupId: clients.economicGroupId, companyName: clients.companyName })
        .from(clients)
        .where(eq(clients.id, event.clientId))
        .limit(1)
        .execute();

      const client = clientRows[0];
      if (!client) return;

      let economicGroupId = client.economicGroupId;

      if (!economicGroupId) {
        const [group] = await this.db
          .insert(economicGroups)
          .values({
            name: client.companyName,
            type: 'client_group',
            status: 'active',
          })
          .returning({ id: economicGroups.id });

        economicGroupId = group?.id ?? null;
        if (!economicGroupId) return;

        await this.db
          .update(clients)
          .set({ economicGroupId })
          .where(eq(clients.id, event.clientId))
          .execute();

        await this.db
          .insert(economicGroupMembers)
          .values({
            economicGroupId,
            memberType: 'client',
            clientId: event.clientId,
            isHeadquarters: true,
          })
          .onConflictDoNothing()
          .execute();
      }

      // Check if a partner company person already exists for this CNPJ in the group
      const existingPerson = await this.db
        .select({ id: economicGroupPersons.id })
        .from(economicGroupPersons)
        .where(eq(economicGroupPersons.cpfCnpj, event.cnpj))
        .limit(1)
        .execute();

      if (existingPerson.length === 0) {
        await this.db
          .insert(economicGroupMembers)
          .values({
            economicGroupId,
            memberType: 'company',
            clientId: null,
          })
          .execute();

        await this.db
          .insert(economicGroupPersons)
          .values({
            economicGroupId,
            relationshipType: 'partner',
            fullName: event.companyName,
            cpfCnpj: event.cnpj,
            isActive: true,
          })
          .execute();

        this.logger.log(
          `Linked partner company CNPJ ${event.cnpj} to economic group ${economicGroupId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Economic group linking failed for partner CNPJ ${event.cnpj}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
