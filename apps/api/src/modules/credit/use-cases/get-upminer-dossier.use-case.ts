import { Injectable, Logger } from '@nestjs/common';
import { UpminerAdapter } from '../bureaus/upminer/upminer.adapter';
import type { UpminerDossierDetailResponse } from '../bureaus/upminer/upminer.types';

export interface GetUpminerDossierInput {
  dossierId: number | string;
  sourceMethod?: string;
}

export interface GetUpminerDossierOutput {
  dossier: UpminerDossierDetailResponse;
  source?: unknown;
}

@Injectable()
export class GetUpminerDossierUseCase {
  private readonly logger = new Logger(GetUpminerDossierUseCase.name);

  constructor(private readonly upminerAdapter: UpminerAdapter) {}

  async execute(input: GetUpminerDossierInput): Promise<GetUpminerDossierOutput> {
    this.logger.log(`Fetching upMiner dossier ${input.dossierId}`);

    const dossier = await this.upminerAdapter.getDossier(input.dossierId);

    if (!input.sourceMethod) {
      return { dossier };
    }

    this.logger.log(`Fetching upMiner dossier ${input.dossierId} source: ${input.sourceMethod}`);
    const source = await this.upminerAdapter.getDossierSource(input.dossierId, input.sourceMethod);

    return { dossier, source };
  }
}
