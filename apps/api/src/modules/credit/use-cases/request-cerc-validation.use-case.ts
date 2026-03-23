import { Injectable, Inject, Logger } from '@nestjs/common';
import { CercValidation } from '../domain/cerc-validation.entity';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import { CercAdapter } from '../bureaus/cerc/cerc.adapter';
import { env } from '../../../config/env';

interface RequestCercValidationInput {
  veiculoId?: string;
  numeroDuplicata: string;
  chaveNfe: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  cnpjOriginador: string;
  tipoDocumentoFiscal?: string;
  referenciaExterna?: string;
  planodeCobranca?: number;
  requestedBy?: string;
}

@Injectable()
export class RequestCercValidationUseCase {
  private readonly logger = new Logger(RequestCercValidationUseCase.name);

  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
    private readonly cercAdapter: CercAdapter,
  ) {}

  async execute(input: RequestCercValidationInput): Promise<CercValidation> {
    const veiculoId = input.veiculoId ?? env.CERC_VEICULO_ID;
    const planodeCobranca = input.planodeCobranca ?? 6;

    const entity = CercValidation.create({
      veiculoId,
      numeroDuplicata: input.numeroDuplicata,
      chaveNfe: input.chaveNfe,
      valor: input.valor,
      vencimento: input.vencimento,
      cnpjCedente: input.cnpjCedente,
      cnpjCpfPagador: input.cnpjCpfPagador,
      tipoPagador: input.tipoPagador,
      cnpjOriginador: input.cnpjOriginador,
      referenciaExterna: input.referenciaExterna ?? null,
      planodeCobranca,
      requestedBy: input.requestedBy ?? null,
    });

    await this.repository.save(entity);
    this.logger.log(`CercValidation created: ${entity.id}`);

    // Format: 12-digit zero-padded NF-e number + dash + installment number
    // e.g. NF-e 73742, parcela 001 → "000000073742-001"
    const nfeNumero = input.chaveNfe.slice(25, 34).replace(/^0+/, '');
    const identificadorNumero = `${nfeNumero.padStart(12, '0')}-${input.numeroDuplicata}`;

    const requestPayload: import('../bureaus/cerc/cerc.types').CercCriarLoteValidacoesRequest = {
      veiculo: { id: veiculoId },
      monitoramento: true,
      disponibilizacao_arquivo_retorno: true,
      aguardar_documentos: true,
      buscar_documentos: true,
      validacoes: [
        {
          recebivel: {
            tipo: 'duplicata_mercantil',
            identificador: { numero: identificadorNumero },
            vencimento: input.vencimento,
            valor: input.valor,
            documento_fiscal: {
              identificador: { numero: input.chaveNfe },
              tipo: input.tipoDocumentoFiscal ?? 'nfe',
            },
            partes: {
              originador: {
                documento: {
                  identificador: { numero: input.cnpjOriginador },
                  tipo: 'cnpj' as const,
                },
              },
              pagador: {
                documento: {
                  identificador: { numero: input.cnpjCpfPagador },
                  tipo: input.tipoPagador,
                },
              },
            },
          },
          cedente: {
            documento: {
              identificador: { numero: input.cnpjCedente },
              tipo: 'cnpj' as const,
            },
          },
          referencia_externa: input.referenciaExterna,
          plano_de_cobranca: planodeCobranca,
        },
      ],
    };

    try {
      const loteResult = await this.cercAdapter.criarLoteValidacoes(requestPayload);
      entity.markAsPolling(loteResult.lote_id, requestPayload);
      await this.repository.update(entity);
      this.logger.log(`CercValidation polling: ${entity.id}, lote: ${loteResult.lote_id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      entity.markAsError(message);
      await this.repository.update(entity);
      this.logger.error(`CercValidation error on create: ${entity.id} — ${message}`);
    }

    return entity;
  }
}
