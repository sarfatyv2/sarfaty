import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { env } from '../../../../config/env';

export interface AllcheckAddress {
  street: string | null;
  number: string | null;
  complement: string | null;
  zipCode: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export interface AllcheckPhone {
  ddd: string | null;
  number: string | null;
  type: string | null;
  fullNumber: string | null;
}

export interface AllcheckPartner {
  name: string;
  cpf: string | null;
  qualification: string | null;
  status: string | null;
  joinedAt: Date | null;
}

export interface AllcheckCompanyData {
  name: string | null;
  tradeName: string | null;
  openingDate: Date | null;
  mainActivity: string | null;
  legalNature: string | null;
  registrationStatus: string | null;
  size: string | null;
  type: string | null;
}

export interface AllcheckVehicle {
  plate: string | null;
  renavam: string | null;
  brand: string | null;
  fuel: string | null;
  year: number | null;
  chassis: string | null;
  status: string | null;
}

export interface AllcheckConsultation {
  date: string | null;
  product: string | null;
  client: string | null;
  phone: string | null;
}

export interface AllcheckResult {
  consultationNumber: string | null;
  name: string | null;
  document: string | null;
  emails: string[];
  currentAddress: AllcheckAddress | null;
  addressHistory: AllcheckAddress[];
  phones: AllcheckPhone[];
  partners: AllcheckPartner[];
  companyData: AllcheckCompanyData | null;
  isPep: boolean;
  vehicles: AllcheckVehicle[];
  ccfOccurrences: number;
  consultationNetwork: AllcheckConsultation[];
  rawXml: string;
}

@Injectable()
export class AllcheckAdapter {
  private readonly logger = new Logger(AllcheckAdapter.name);
  private readonly baseUrl = 'https://integra.allcheck.info/allcheck_produtos/techEngine';
  private readonly requestTimeoutMs = 15_000;
  private readonly maxAttempts = 3;

  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true,
    isArray: (name) =>
      ['consta_email', 'consta_endereco', 'novo_telefone', 'novo_socios', 'empresas', 'novo_veiculo', 'novo_ccf', 'registro'].includes(name),
  });

  async query(document: string): Promise<AllcheckResult> {
    const cleanDocument = document.replaceAll(/\D/g, '');
    const userId = env.ALLCHECK_USER_ID;
    const userToken = env.ALLCHECK_USER_TOKEN;

    if (!userId || userId === 'dummy') throw new Error('ALLCHECK_USER_ID is not configured');
    if (!userToken || userToken === 'dummy') throw new Error('ALLCHECK_USER_TOKEN is not configured');

    const params = new URLSearchParams({
      sid: 'allcheck_produtos',
      command: 'usr',
      action: 'integracao',
      tipo: '3',
      idUser: userId,
      txtUsuario: userToken,
      produto: 'localizador',
      cnpj: cleanDocument,
    });

    this.logger.debug(`Querying Allcheck localizador for document: ${cleanDocument}`);

    const response = await this.fetchWithRetry(
      `${this.baseUrl}?${params.toString()}`,
      { method: 'GET' },
      'allcheck.query',
    );

    if (!response.ok) {
      this.logger.error(`Allcheck query failed: ${response.status} ${response.statusText}`);
      throw new Error(`Allcheck query failed with status ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const xml = new TextDecoder('iso-8859-1').decode(buffer);

    return this.parseResponse(xml);
  }

  private parseResponse(xml: string): AllcheckResult {
    const parsed = this.xmlParser.parse(xml) as Record<string, unknown>;
    const root = (parsed['consulta'] ?? {}) as Record<string, unknown>;

    const cadastral = this.getObj(root, 'banco_dadosCadastrais', 'dadosCadastrais');
    const emailBank = this.getArray(root, 'banco_email', 'consta_email');
    const addressBank = this.getArray(root, 'banco_endereco', 'consta_endereco');
    const historyBank = this.getArray(root, 'banco_historico_endereco', 'consta_endereco');
    const phoneBank = this.getArray(root, 'banco_telefone', 'novo_telefone');
    const partnersBank = this.getArray(root, 'banco_sociedades', 'novo_socios');
    const companiesBank = this.getArray(root, 'banco_empresas', 'empresas');
    const vehiclesBank = this.getArray(root, 'banco_veiculos', 'novo_veiculo');
    const ccfBank = this.getArray(root, 'banco_ccf', 'novo_ccf');
    const consultationsBank = this.getArrayDirect(root, 'redeVigiada', 'registro');

    const ppeBank = root['banco_ppe'];
    const isPep = ppeBank != null && typeof ppeBank === 'object' && Object.keys(ppeBank as object).length > 0;

    let ccfOccurrences = 0;
    for (const ccf of ccfBank) {
      const qty = (ccf as Record<string, unknown>)['quantidadeDeOcorrencias'];
      if (qty != null) ccfOccurrences += Number(qty) || 0;
    }

    return {
      consultationNumber: this.str(root['numeroConsulta']),
      name: this.str(cadastral?.['nome']),
      document: this.str(cadastral?.['numeroDocumento']),
      emails: emailBank
        .map((e) => this.str((e as Record<string, unknown>)['email']))
        .filter((e): e is string => e !== null),
      currentAddress: addressBank.length > 0 ? this.parseAddress(addressBank[0] as Record<string, unknown>) : null,
      addressHistory: historyBank.map((a) => this.parseAddress(a as Record<string, unknown>)),
      phones: phoneBank.map((p) => this.parsePhone(p as Record<string, unknown>)),
      partners: partnersBank.map((s) => this.parsePartner(s as Record<string, unknown>)),
      companyData: companiesBank.length > 0 ? this.parseCompany(companiesBank[0] as Record<string, unknown>) : null,
      isPep,
      vehicles: vehiclesBank.map((v) => this.parseVehicle(v as Record<string, unknown>)),
      ccfOccurrences,
      consultationNetwork: consultationsBank.map((c) => this.parseConsultation(c as Record<string, unknown>)),
      rawXml: xml,
    };
  }

  private parseAddress(a: Record<string, unknown>): AllcheckAddress {
    const raw = this.str(a['endereco']) ?? this.str(a['logradouro']);
    return {
      street: raw ? raw.trim() || null : null,
      number: this.str(a['numero']),
      complement: this.str(a['complemento']),
      zipCode: this.formatCep(this.str(a['cep'])),
      neighborhood: this.str(a['bairro']),
      city: this.str(a['cidade']),
      state: this.str(a['estado']),
    };
  }

  private parsePhone(p: Record<string, unknown>): AllcheckPhone {
    const ddd = this.str(p['ddd']);
    const number = this.str(p['telefone']);
    return {
      ddd,
      number,
      type: this.str(p['tipoTelefone']),
      fullNumber: ddd && number ? `(${ddd}) ${number}` : number,
    };
  }

  private parsePartner(s: Record<string, unknown>): AllcheckPartner {
    return {
      name: this.str(s['socio']) ?? '',
      cpf: this.str(s['cpf_socio']),
      qualification: this.str(s['qualificacao']),
      status: this.str(s['situacao_socio']),
      joinedAt: this.parseDate(this.str(s['data_ingresso'])),
    };
  }

  private parseCompany(e: Record<string, unknown>): AllcheckCompanyData {
    return {
      name: this.str(e['nome']),
      tradeName: this.str(e['fantasia']),
      openingDate: this.parseDate(this.str(e['data_abertura'])),
      mainActivity: this.str(e['atividade_comercial']) ?? this.str(e['cnae']),
      legalNature: this.str(e['natureza_juridica']),
      registrationStatus: this.str(e['situacao_cadastral']),
      size: this.str(e['porte']),
      type: this.str(e['tipo']),
    };
  }

  private parseVehicle(v: Record<string, unknown>): AllcheckVehicle {
    const yearRaw = v['ano_fabricacao'];
    return {
      plate: this.str(v['placa']),
      renavam: this.str(v['renavam']),
      brand: this.str(v['marca']),
      fuel: this.str(v['combustivel']),
      year: yearRaw != null ? Number(yearRaw) || null : null,
      chassis: this.str(v['chassis']),
      status: this.str(v['situacao']),
    };
  }

  private parseConsultation(c: Record<string, unknown>): AllcheckConsultation {
    return {
      date: this.str(c['dataConsulta']),
      product: this.str(c['produto']),
      client: this.str(c['cliente']),
      phone: this.str(c['telefone']),
    };
  }

  private parseDate(value: string | null): Date | null {
    if (!value) return null;
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const date = new Date(`${year}-${month}-${day}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatCep(value: string | null): string | null {
    if (!value) return null;
    const digits = value.replaceAll(/\D/g, '');
    return digits.length === 8 ? digits : digits.padStart(8, '0').slice(0, 8) || null;
  }

  private str(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const s = String(value).trim();
    return s === '' ? null : s;
  }

  private getObj(root: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
    let current: unknown = root;
    for (const key of keys) {
      if (current == null || typeof current !== 'object') return null;
      current = (current as Record<string, unknown>)[key];
    }
    return (current as Record<string, unknown>) ?? null;
  }

  private getArray(root: Record<string, unknown>, bankKey: string, itemKey: string): unknown[] {
    const bank = root[bankKey];
    if (!bank || typeof bank !== 'object') return [];
    const items = (bank as Record<string, unknown>)[itemKey];
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }

  private getArrayDirect(root: Record<string, unknown>, containerKey: string, itemKey: string): unknown[] {
    const container = root[containerKey];
    if (!container || typeof container !== 'object') return [];
    const items = (container as Record<string, unknown>)[itemKey];
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }

  private async fetchWithRetry(url: string, init: RequestInit, operation: string): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeoutId);

        const shouldRetry = response.status >= 500 || response.status === 429;
        if (!response.ok && shouldRetry && attempt < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attempt} failed with ${response.status}, retrying`);
          await this.delay(attempt * 300);
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (attempt < this.maxAttempts) {
          this.logger.warn(`${operation} attempt ${attempt} failed, retrying`);
          await this.delay(attempt * 300);
          continue;
        }
      }
    }

    throw new Error(`${operation} failed after ${this.maxAttempts} attempts: ${String(lastError)}`);
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
