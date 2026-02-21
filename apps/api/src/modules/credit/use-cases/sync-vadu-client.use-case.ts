import { Injectable, Inject, Logger } from '@nestjs/common';
import { VaduAdapter } from '../bureaus/vadu/vadu.adapter';
import { VaduRepository, VADU_REPOSITORY } from '../domain/vadu.repository';
import { VaduCompanyResult } from '../domain/vadu-company-result.entity';
import { VaduPersonResult } from '../domain/vadu-person-result.entity';

export interface SyncVaduClientInput {
  clientId: string;
  cnpj?: string;
  authorizedPersons?: Array<{
    id: string;
    cpf: string;
  }>;
}

@Injectable()
export class SyncVaduClientUseCase {
  private readonly logger = new Logger(SyncVaduClientUseCase.name);

  constructor(
    private readonly vaduAdapter: VaduAdapter,
    @Inject(VADU_REPOSITORY)
    private readonly vaduRepository: VaduRepository,
  ) {}

  async execute(input: SyncVaduClientInput): Promise<void> {
    this.logger.log(`Starting Vadu sync for client ${input.clientId}`);

    const promises: Promise<void>[] = [];

    // 1. Sync Company (CNPJ)
    if (input.cnpj) {
      promises.push(this.syncCompany(input.clientId, input.cnpj));
    }

    // 2. Sync Persons (CPFs)
    if (input.authorizedPersons && input.authorizedPersons.length > 0) {
      for (const person of input.authorizedPersons) {
        if (person.cpf) {
          promises.push(this.syncPerson(input.clientId, person.id, person.cpf));
        }
      }
    }

    // Run all queries in parallel
    await Promise.allSettled(promises);
    
    this.logger.log(`Completed Vadu sync for client ${input.clientId}`);
  }

  private async syncCompany(clientId: string, cnpj: string): Promise<void> {
    try {
      this.logger.debug(`Querying Vadu for CNPJ ${cnpj}`);
      const rawData = await this.vaduAdapter.queryCnpj(cnpj);

      const domainEntity = VaduCompanyResult.create({
        clientId,
        cnpj,
        companyName: rawData.Nome || null,
        tradeName: rawData.NomeFantasia || null,
        revenueStatus: rawData.ReceitaSituacao || null,
        revenueStatusDate: rawData.ReceitaDataSituacao ? new Date(rawData.ReceitaDataSituacao) : null,
        specialStatus: rawData.ReceitaSituacaoEspecial || null,
        capitalSocial: rawData.ReceitaCapitalSocial ? Number(rawData.ReceitaCapitalSocial) : null,
        legalNature: rawData.ReceitaNaturezaJuridica || null,
        isSimplesNacional: rawData.SimplesNacional || false,
        companySize: rawData.Porte || null,
        environmentalScore: rawData.RecursoAmbiental?.score ? Number(rawData.RecursoAmbiental.score) : null,
        environmentalLevel: rawData.RecursoAmbiental?.nivel || null,
        rawData,
      });

      await this.vaduRepository.saveCompanyResult(domainEntity);
      this.logger.debug(`Successfully saved Vadu company result for CNPJ ${cnpj}`);
    } catch (error) {
      this.logger.error(`Failed to sync company CNPJ ${cnpj}: ${(error as Error).message}`);
    }
  }

  private async syncPerson(clientId: string, authorizedPersonId: string, cpf: string): Promise<void> {
    try {
      this.logger.debug(`Querying Vadu for CPF ${cpf}`);
      const rawData = await this.vaduAdapter.queryCpf(cpf);

      const domainEntity = VaduPersonResult.create({
        clientId,
        authorizedPersonId,
        cpf,
        name: rawData.nome || null,
        birthDate: rawData.dataDeNascimento ? new Date(rawData.dataDeNascimento) : null,
        motherName: rawData.nomeDaMae || null,
        rawData,
      });

      await this.vaduRepository.savePersonResult(domainEntity);
      this.logger.debug(`Successfully saved Vadu person result for CPF ${cpf}`);
    } catch (error) {
      this.logger.error(`Failed to sync person CPF ${cpf}: ${(error as Error).message}`);
    }
  }
}
