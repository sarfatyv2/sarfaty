import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { cnaeSegmentMapping, segments } from '../../../database/schema';

export interface CnpjValidationResult {
  cnpj: string;
  status: string;
  companyName: string;
  tradeName: string | null;
  openingDate: string | null;
  legalNature: string | null;
  address: {
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  partners: Array<{ name: string; role: string }>;
  primaryActivity: { code: string; description: string } | null;
  suggestedSegment: {
    id: string;
    code: string;
    name: string;
    confidence: string;
  } | null;
  canProceed: boolean;
  reason: string | null;
}

@Injectable()
export class CnpjApiAdapter {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async validate(cnpj: string): Promise<CnpjValidationResult> {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return {
        cnpj: cleanCnpj,
        status: 'invalid',
        companyName: '',
        tradeName: null,
        openingDate: null,
        legalNature: null,
        address: { street: null, number: null, complement: null, neighborhood: null, city: null, state: null, zip: null },
        partners: [],
        primaryActivity: null,
        suggestedSegment: null,
        canProceed: false,
        reason: 'CNPJ deve ter 14 dígitos',
      };
    }

    let response: Response;
    try {
      response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
      );
    } catch {
      return {
        cnpj: cleanCnpj,
        status: 'error',
        companyName: '',
        tradeName: null,
        openingDate: null,
        legalNature: null,
        address: { street: null, number: null, complement: null, neighborhood: null, city: null, state: null, zip: null },
        partners: [],
        primaryActivity: null,
        suggestedSegment: null,
        canProceed: false,
        reason: 'Não foi possível consultar o CNPJ. Tente novamente.',
      };
    }

    if (!response.ok) {
      return {
        cnpj: cleanCnpj,
        status: 'not_found',
        companyName: '',
        tradeName: null,
        openingDate: null,
        legalNature: null,
        address: { street: null, number: null, complement: null, neighborhood: null, city: null, state: null, zip: null },
        partners: [],
        primaryActivity: null,
        suggestedSegment: null,
        canProceed: false,
        reason: 'CNPJ não encontrado na Receita Federal',
      };
    }

    const data = (await response.json()) as {
      cnpj: string;
      situacao_cadastral: number;
      descricao_situacao_cadastral: string;
      razao_social: string;
      nome_fantasia: string;
      data_inicio_atividade: string;
      natureza_juridica: string;
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
      qsa: Array<{ nome_socio: string; qualificacao_socio: string }>;
      cnae_fiscal: number;
      cnae_fiscal_descricao: string;
    };

    const canProceed = data.situacao_cadastral === 2; // 2 = Ativa

    const suggestedSegment = await this.findSegmentByCnae(
      data.cnae_fiscal?.toString() ?? '',
    );

    return {
      cnpj: data.cnpj,
      status: data.descricao_situacao_cadastral?.toLowerCase() ?? 'unknown',
      companyName: data.razao_social,
      tradeName: data.nome_fantasia || null,
      openingDate: data.data_inicio_atividade || null,
      legalNature: data.natureza_juridica || null,
      address: {
        street: data.logradouro || null,
        number: data.numero || null,
        complement: data.complemento || null,
        neighborhood: data.bairro || null,
        city: data.municipio || null,
        state: data.uf || null,
        zip: data.cep || null,
      },
      partners: (data.qsa ?? []).map((q) => ({
        name: q.nome_socio,
        role: q.qualificacao_socio,
      })),
      primaryActivity: data.cnae_fiscal
        ? { code: data.cnae_fiscal.toString(), description: data.cnae_fiscal_descricao || '' }
        : null,
      suggestedSegment,
      canProceed,
      reason: canProceed ? null : `CNPJ ${data.descricao_situacao_cadastral}`,
    };
  }

  private async findSegmentByCnae(
    cnaeCode: string,
  ): Promise<{ id: string; code: string; name: string; confidence: string } | null> {
    if (!cnaeCode) return null;

    // Try exact code match first
    const cnaeGroup = cnaeCode.substring(0, 2);

    const [mapping] = await this.db
      .select({
        segmentId: cnaeSegmentMapping.segmentId,
        confidence: cnaeSegmentMapping.confidence,
      })
      .from(cnaeSegmentMapping)
      .where(eq(cnaeSegmentMapping.cnaeGroup, cnaeGroup))
      .limit(1);

    if (!mapping) return null;

    const [segment] = await this.db
      .select({ id: segments.id, code: segments.code, name: segments.name })
      .from(segments)
      .where(eq(segments.id, mapping.segmentId))
      .limit(1);

    if (!segment) return null;

    return {
      id: segment.id,
      code: segment.code,
      name: segment.name,
      confidence: mapping.confidence ?? 'medium',
    };
  }
}
