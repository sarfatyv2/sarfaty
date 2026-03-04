import { Injectable, Logger } from '@nestjs/common';

export interface ViacepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable()
export class ViacepAdapter {
  private readonly logger = new Logger(ViacepAdapter.name);
  private readonly baseUrl = 'https://viacep.com.br/ws';
  private readonly requestTimeoutMs = 10_000;

  async queryCep(cep: string): Promise<ViacepResult | null> {
    const cleanCep = cep.replaceAll(/\D/g, '');
    if (cleanCep.length !== 8) {
      this.logger.warn(`Invalid CEP format: ${cep}`);
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug(`Querying ViaCEP for ${cleanCep}`);
      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`ViaCEP returned ${response.status}`);
        return null;
      }

      const data = await response.json() as ViacepResult;
      if (data.erro) {
        this.logger.debug(`CEP ${cleanCep} not found`);
        return null;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`ViaCEP query failed: ${(error as Error).message}`);
      return null;
    }
  }
}
