import { Injectable, Inject, Logger } from '@nestjs/common';
import { VaduAdapter } from '../bureaus/vadu/vadu.adapter';
import { VaduDraweeRepository, VADU_DRAWEE_REPOSITORY } from '../domain/vadu-drawee.repository';
import { VaduDraweeCompanyResult } from '../domain/vadu-drawee-company-result.entity';
import { VaduDraweePersonResult } from '../domain/vadu-drawee-person-result.entity';
import { EnrichDraweeFromBureauUseCase } from '../../drawees/use-cases/enrich-drawee-from-bureau.use-case';

export interface SyncVaduDraweeInput {
  draweeId: string;
  cnpj?: string;
  cpf?: string;
  personName?: string;
}

@Injectable()
export class SyncVaduDraweeUseCase {
  private readonly logger = new Logger(SyncVaduDraweeUseCase.name);

  constructor(
    private readonly vaduAdapter: VaduAdapter,
    @Inject(VADU_DRAWEE_REPOSITORY)
    private readonly vaduDraweeRepository: VaduDraweeRepository,
    private readonly enrichDraweeUseCase: EnrichDraweeFromBureauUseCase,
  ) {}

  async execute(input: SyncVaduDraweeInput): Promise<void> {
    this.logger.log(`Starting Vadu sync for drawee ${input.draweeId}`);

    const promises: Promise<void>[] = [];

    if (input.cnpj) {
      promises.push(this.syncCompany(input.draweeId, input.cnpj));
    }

    if (input.cpf) {
      promises.push(this.syncPerson(input.draweeId, input.cpf, input.personName ?? null));
    }

    await Promise.allSettled(promises);
    this.logger.log(`Completed Vadu sync for drawee ${input.draweeId}`);
  }

  private async syncCompany(draweeId: string, cnpj: string): Promise<void> {
    try {
      this.logger.debug(`Querying Vadu for drawee CNPJ ${cnpj}`);
      const rawData = await this.vaduAdapter.queryCnpj(cnpj);

      const domainEntity = VaduDraweeCompanyResult.create({
        draweeId,
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

      await this.vaduDraweeRepository.saveCompanyResult(domainEntity);
      this.logger.debug(`Successfully saved Vadu company result for drawee CNPJ ${cnpj}`);

      await this.enrichDraweeUseCase.execute({
        draweeId,
        source: 'vadu',
        data: {
          address: {
            street: rawData.Logradouro || null,
            number: rawData.NumeroLogradouro || null,
            complement: rawData.ComplementoEndereco || null,
            neighborhood: rawData.BairroEndereco || null,
            city: rawData.MunicipioEndereco || null,
            state: rawData.UfEndereco || null,
            zipCode: rawData.CepEnderecoFormatado || null,
          },
          contact: {
            phone: rawData.TelefonePrincipal || null,
            email: rawData.EmailPrincipal || null,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to sync drawee company CNPJ ${cnpj}: ${(error as Error).message}`);
    }
  }

  private async syncPerson(draweeId: string, cpf: string, personName: string | null): Promise<void> {
    try {
      this.logger.debug(`Querying Vadu for drawee CPF ${cpf}`);
      const rawData = await this.vaduAdapter.queryCpf(cpf);

      const domainEntity = VaduDraweePersonResult.create({
        draweeId,
        cpf,
        name: rawData.nome || personName,
        birthDate: rawData.dataDeNascimento ? new Date(rawData.dataDeNascimento) : null,
        motherName: rawData.nomeDaMae || null,
        rawData,
      });

      await this.vaduDraweeRepository.savePersonResult(domainEntity);
      this.logger.debug(`Successfully saved Vadu person result for drawee CPF ${cpf}`);
    } catch (error) {
      this.logger.error(`Failed to sync drawee person CPF ${cpf}: ${(error as Error).message}`);
    }
  }
}
