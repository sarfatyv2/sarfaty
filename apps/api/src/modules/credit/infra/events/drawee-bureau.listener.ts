import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { DraweeCreatedEvent } from '../../../drawees/domain/events/drawee-created.event';
import { SyncVaduDraweeUseCase } from '../../use-cases/sync-vadu-drawee.use-case';
import { RequestSerasaReportDraweeUseCase } from '../../use-cases/request-serasa-report-drawee.use-case';
import { SyncComplianceChecksDraweeUseCase } from '../../use-cases/sync-compliance-checks-drawee.use-case';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { drawees, draweeAddresses, draweeContacts } from '../../../../database/schema';

@Injectable()
export class DraweeBureauListener {
  private readonly logger = new Logger(DraweeBureauListener.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly syncVaduDraweeUseCase: SyncVaduDraweeUseCase,
    private readonly requestSerasaReportDraweeUseCase: RequestSerasaReportDraweeUseCase,
    private readonly syncComplianceChecksDraweeUseCase: SyncComplianceChecksDraweeUseCase,
  ) {}

  @OnEvent(DraweeCreatedEvent.EVENT_NAME, { async: true })
  async handleDraweeCreated(event: DraweeCreatedEvent): Promise<void> {
    this.logger.log(`Handling bureau sync for drawee ${event.draweeId}`);

    try {
      const draweeRows = await this.db
        .select({
          cnpj: drawees.cnpj,
          cpf: drawees.cpf,
          companyName: drawees.companyName,
          tradeName: drawees.tradeName,
        })
        .from(drawees)
        .where(eq(drawees.id, event.draweeId))
        .execute();

      const drawee = draweeRows[0];
      if (!drawee) {
        this.logger.warn(`Drawee ${event.draweeId} not found when running bureau integration`);
        return;
      }

      const addressRows = await this.db
        .select({
          zipCode: draweeAddresses.zipCode,
          street: draweeAddresses.street,
          city: draweeAddresses.city,
          state: draweeAddresses.state,
        })
        .from(draweeAddresses)
        .where(and(eq(draweeAddresses.draweeId, event.draweeId), eq(draweeAddresses.isPrimary, true)))
        .limit(1)
        .execute();

      const contactRows = await this.db
        .select({ email: draweeContacts.email })
        .from(draweeContacts)
        .where(and(eq(draweeContacts.draweeId, event.draweeId), eq(draweeContacts.isPrimary, true)))
        .limit(1)
        .execute();

      const primaryAddress = addressRows[0];
      const primaryContact = contactRows[0];

      const results = await Promise.allSettled([
        this.syncVaduDraweeUseCase.execute({
          draweeId: event.draweeId,
          cnpj: drawee.cnpj || undefined,
          cpf: drawee.cpf || undefined,
          personName: drawee.companyName || undefined,
        }),
        drawee.cnpj ? this.requestSerasaReportDraweeUseCase.execute(event.draweeId) : Promise.resolve(null),
        this.syncComplianceChecksDraweeUseCase.execute({
          draweeId: event.draweeId,
          cnpj: drawee.cnpj || undefined,
          companyName: drawee.companyName || undefined,
          tradeName: drawee.tradeName || undefined,
          cep: primaryAddress?.zipCode || undefined,
          registeredStreet: primaryAddress?.street || undefined,
          registeredCity: primaryAddress?.city || undefined,
          registeredState: primaryAddress?.state || undefined,
          email: primaryContact?.email || undefined,
          persons: drawee.cpf ? [{ cpf: drawee.cpf, name: drawee.companyName || '' }] : undefined,
        }),
      ]);

      for (const [idx, result] of results.entries()) {
        if (result.status === 'rejected') {
          const source = idx === 0 ? 'Vadu' : idx === 1 ? 'Serasa' : 'Compliance';
          this.logger.error(`${source} integration failed for drawee ${event.draweeId}: ${result.reason}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error executing bureau integration for drawee ${event.draweeId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
