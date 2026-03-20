import { Injectable, Logger } from '@nestjs/common';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import type { UpminerPdfDownloadResponse, UpminerPdfRequestResponse } from '../bureaus/upminer/upminer.types';

@Injectable()
export class RequestUpminerPdfUseCase {
  private readonly logger = new Logger(RequestUpminerPdfUseCase.name);

  constructor(private readonly upminerAdapter: UpminerAdapter) {}

  async request(dossierId: number | string, notificationUrl?: string): Promise<UpminerPdfRequestResponse> {
    this.logger.log(`Requesting upMiner PDF for dossier ${dossierId}`);
    return this.upminerAdapter.requestDossierPdf(dossierId, notificationUrl ? { notification_url: notificationUrl } : {});
  }

  async getStatus(dossierId: number | string, processId: string): Promise<UpminerPdfDownloadResponse> {
    this.logger.log(`Checking upMiner PDF status for dossier ${dossierId}, processId ${processId}`);
    return this.upminerAdapter.getDossierPdf(dossierId, processId);
  }
}
