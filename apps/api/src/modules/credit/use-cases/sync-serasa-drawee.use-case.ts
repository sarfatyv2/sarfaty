import { Injectable, Logger } from '@nestjs/common';
import {
  EnrichDraweeFromBureauUseCase,
  type BureauPartnerData,
} from '../../drawees/use-cases/enrich-drawee-from-bureau.use-case';

@Injectable()
export class SyncSerasaDraweeUseCase {
  private readonly logger = new Logger(SyncSerasaDraweeUseCase.name);

  constructor(
    private readonly enrichDraweeUseCase: EnrichDraweeFromBureauUseCase,
  ) {}

  async execute(draweeId: string, rawResponse: unknown): Promise<void> {
    const resp = rawResponse as { reports?: Array<Record<string, unknown>>; optionalFeatures?: unknown };
    if (!resp?.reports?.[0]) {
      this.logger.warn(`No report data in Serasa response for drawee ${draweeId}`);
      return;
    }

    const report = resp.reports[0] as {
      identificationReport?: {
        address?: { addressLine?: string; zipCode?: string; district?: string; city?: string; state?: string };
        phone?: { phoneNumber?: string; areaCode?: string };
      };
    };
    const optional = (resp.optionalFeatures ?? (report as Record<string, unknown>).optionalFeatures) as Record<
      string,
      unknown
    > | undefined;
    const addr = report.identificationReport?.address;
    const phoneData = report.identificationReport?.phone;

    let contactPhone: string | null = null;
    if (phoneData?.phoneNumber) {
      contactPhone = phoneData.areaCode
        ? `(${phoneData.areaCode}) ${phoneData.phoneNumber}`
        : phoneData.phoneNumber;
    }

    let street: string | null = null;
    let number: string | null = null;
    if (addr?.addressLine) {
      const parsed = this.parseAddressLine(addr.addressLine);
      street = parsed.street;
      number = parsed.number;
    }
    const zipCode = addr?.zipCode ? this.formatZipCode(addr.zipCode) : null;
    const partners = this.extractPartners(optional ?? {});

    this.logger.log(
      `Enriching drawee ${draweeId} from Serasa: address=${!!addr}, contact=${!!contactPhone}, partners=${partners.length}`,
    );

    await this.enrichDraweeUseCase.execute({
      draweeId,
      source: 'serasa',
      data: {
        address: addr
          ? {
              street,
              number,
              complement: null,
              neighborhood: addr.district ?? null,
              city: addr.city ?? null,
              state: addr.state ?? null,
              zipCode,
            }
          : undefined,
        contact: contactPhone ? { phone: contactPhone, email: null } : undefined,
        partners: partners.length > 0 ? partners : undefined,
      },
    });
  }

  private extractPartners(optionalFeatures: Record<string, unknown>): BureauPartnerData[] {
    const qsa = optionalFeatures?.QSAReport as {
      partnerCompleteReport?: { partnersList?: Array<{ name?: string; documentType?: string; documentId?: string }> };
      directorCompleteReport?: { directorsList?: Array<{ name?: string; documentType?: string; documentId?: string }> };
    } | undefined;
    if (!qsa) return [];

    const partners: BureauPartnerData[] = [];

    const partnersList = qsa.partnerCompleteReport?.partnersList ?? [];
    for (const p of partnersList) {
      if (!p.name) continue;
      partners.push({
        fullName: p.name,
        cpf: p.documentType === 'CPF' ? p.documentId ?? null : null,
        authorizationType: 'partner',
        phone: null,
        email: null,
      });
    }

    const directorsList = qsa.directorCompleteReport?.directorsList ?? [];
    for (const d of directorsList) {
      if (!d.name) continue;
      const alreadyAdded = partners.some(
        (p) => p.cpf && d.documentId && p.cpf === d.documentId,
      );
      if (alreadyAdded) continue;
      partners.push({
        fullName: d.name,
        cpf: d.documentType === 'CPF' ? d.documentId ?? null : null,
        authorizationType: 'administrator',
        phone: null,
        email: null,
      });
    }

    return partners;
  }

  private parseAddressLine(line: string): { street: string | null; number: string | null } {
    if (!line) return { street: null, number: null };
    const match = line.match(/^(.+?)\s+(\d+[A-Za-z]?)$/);
    if (match?.[1] && match[2]) {
      return { street: match[1].trim(), number: match[2] };
    }
    return { street: line.trim(), number: null };
  }

  private formatZipCode(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const digits = String(raw).replaceAll(/\D/g, '');
    return digits.length < 8 ? digits.padStart(8, '0') : digits;
  }
}
