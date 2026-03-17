import { Injectable, Logger } from '@nestjs/common';
import { EnrichClientFromBureauUseCase, type BureauPartnerData } from '../../clients/use-cases/enrich-client-from-bureau.use-case';

@Injectable()
export class SyncSerasaClientUseCase {
  private readonly logger = new Logger(SyncSerasaClientUseCase.name);

  constructor(
    private readonly enrichClientUseCase: EnrichClientFromBureauUseCase,
  ) {}

  async execute(clientId: string, rawResponse: any): Promise<void> {
    if (!rawResponse?.reports?.[0]) {
      this.logger.warn(`No report data in Serasa response for client ${clientId}`);
      return;
    }

    const report = rawResponse.reports[0];
    const optional = rawResponse.optionalFeatures ?? report.optionalFeatures ?? {};

    const address = this.extractAddress(report);
    const contact = this.extractContact(report);
    const partners = this.extractPartners(optional);

    this.logger.log(
      `Enriching client ${clientId} from Serasa: ` +
      `address=${address ? 'yes' : 'no'}, ` +
      `contact=${contact ? 'yes' : 'no'}, ` +
      `partners=${partners.length}`,
    );

    await this.enrichClientUseCase.execute({
      clientId,
      source: 'serasa',
      data: { address, contact, partners },
    });
  }

  private extractAddress(report: any) {
    const addr = report.identificationReport?.address;
    if (!addr) return undefined;

    const { street, number } = this.parseAddressLine(addr.addressLine || '');
    const zipCode = this.formatZipCode(addr.zipCode);

    return {
      street,
      number,
      complement: null as string | null,
      neighborhood: addr.district || null,
      city: addr.city || null,
      state: addr.state || null,
      zipCode,
    };
  }

  private extractContact(report: any) {
    const phone = report.identificationReport?.phone;
    if (!phone?.phoneNumber) return undefined;

    const formattedPhone = phone.areaCode
      ? `(${phone.areaCode}) ${phone.phoneNumber}`
      : phone.phoneNumber;

    return {
      phone: formattedPhone,
      email: null as string | null,
    };
  }

  private extractPartners(optionalFeatures: any): BureauPartnerData[] {
    const qsa = optionalFeatures?.QSAReport;
    if (!qsa) return [];

    const partners: BureauPartnerData[] = [];

    const partnersList = qsa.partnerCompleteReport?.partnersList ?? [];
    for (const p of partnersList) {
      if (!p.name) continue;
      partners.push(this.mapPartnerEntry(p));
    }

    const directorsList = qsa.directorCompleteReport?.directorsList ?? [];
    for (const d of directorsList) {
      if (!d.name) continue;
      const alreadyAdded = partners.some(
        (p) => p.cpf && d.documentId && p.cpf === d.documentId,
      );
      if (alreadyAdded) continue;
      partners.push(this.mapDirectorEntry(d));
    }

    return partners;
  }

  private mapPartnerEntry(p: any): BureauPartnerData {
    return {
      fullName: p.name,
      cpf: p.documentType === 'CPF' ? (p.documentId ?? null) : null,
      cnpj: p.documentType === 'CNPJ' ? (p.documentId ?? null) : null,
      authorizationType: 'partner',
      phone: null,
      email: null,
      joinedAt: this.parseDate(p.sinceDate),
      mandateEndAt: null,
      role: null,
      participationPercentage: this.parseNumeric(p.participationPercentage),
      capitalTotalValue: this.parseNumeric(p.capitalTotalValue),
      restrictionSign: p.restrictionSign ?? null,
    };
  }

  private mapDirectorEntry(d: any): BureauPartnerData {
    return {
      fullName: d.name,
      cpf: d.documentType === 'CPF' ? (d.documentId ?? null) : null,
      cnpj: d.documentType === 'CNPJ' ? (d.documentId ?? null) : null,
      authorizationType: 'administrator',
      phone: null,
      email: null,
      joinedAt: this.parseDate(d.mandateStart),
      mandateEndAt: this.parseDate(d.mandateEnd),
      role: d.role ?? null,
      participationPercentage: null,
      capitalTotalValue: null,
      restrictionSign: null,
    };
  }

  private parseDate(value: unknown): Date | null {
    if (value == null) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' && value.trim()) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  private parseNumeric(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      const str = value.trim();
      return str || null;
    }
    return null;
  }

  /**
   * Parses "R MARTINIANO DE CARVALHO 965" into { street, number }.
   * Splits on the last token that looks like a number.
   */
  private parseAddressLine(line: string): { street: string | null; number: string | null } {
    if (!line) return { street: null, number: null };

    const regex = /^(.+?)\s+(\d+[A-Za-z]?)$/;
    const match = regex.exec(line);
    if (match?.[1] && match[2]) {
      return { street: match[1].trim(), number: match[2] };
    }

    return { street: line.trim(), number: null };
  }

  private formatZipCode(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const digits = raw.replaceAll(/\D/g, '');
    if (digits.length < 8) return digits.padStart(8, '0');
    return digits;
  }
}
