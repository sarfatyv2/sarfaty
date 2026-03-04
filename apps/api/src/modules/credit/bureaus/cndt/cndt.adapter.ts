import { Injectable, Logger } from '@nestjs/common';

export type CndtStatus = 'NEGATIVE' | 'POSITIVE' | 'POSITIVE_WITH_EFFECTS' | 'UNAVAILABLE' | 'UNKNOWN';

export interface CndtResult {
  status: CndtStatus;
  certificateNumber: string | null;
  validUntil: string | null;
  reason: string | null;
  rawHtml: string;
}

/**
 * The TST CNDT portal (cndt-certidao.tst.jus.br) requires CAPTCHA (Google reCAPTCHA + custom)
 * for certificate issuance, which prevents fully automated queries.
 *
 * This adapter probes the portal availability and returns UNAVAILABLE when CAPTCHA is detected,
 * signaling that manual verification is required.
 */
@Injectable()
export class CndtAdapter {
  private readonly logger = new Logger(CndtAdapter.name);
  private readonly portalUrl = 'https://cndt-certidao.tst.jus.br/gerarCertidao.faces';
  private readonly requestTimeoutMs = 15_000;

  async queryByCnpj(cnpj: string): Promise<CndtResult> {
    const cleanCnpj = cnpj.replaceAll(/\D/g, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.debug(`Probing CNDT portal for CNPJ ${cleanCnpj}`);

      const response = await fetch(this.portalUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`CNDT portal returned ${response.status}`);
        return this.unavailable('Portal indisponível');
      }

      const html = await response.text();
      const hasCaptcha = html.includes('recaptcha') || html.includes('captcha') || html.includes('idCampoResposta');

      if (hasCaptcha) {
        this.logger.log('CNDT portal requires CAPTCHA — automated query not possible');
        return this.unavailable('Portal requer CAPTCHA — verificação manual necessária');
      }

      return this.parseResponse(html);
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`CNDT probe failed: ${(error as Error).message}`);
      return this.unavailable('Erro ao acessar o portal');
    }
  }

  private unavailable(reason: string): CndtResult {
    return { status: 'UNAVAILABLE', certificateNumber: null, validUntil: null, reason, rawHtml: '' };
  }

  private parseResponse(html: string): CndtResult {
    const lowerHtml = html.toLowerCase();

    let status: CndtStatus = 'UNKNOWN';
    if (lowerHtml.includes('certidão negativa') && !lowerHtml.includes('positiva')) {
      status = 'NEGATIVE';
    } else if (lowerHtml.includes('positiva com efeito de negativa') || lowerHtml.includes('positiva com efeitos de negativa')) {
      status = 'POSITIVE_WITH_EFFECTS';
    } else if (lowerHtml.includes('certidão positiva')) {
      status = 'POSITIVE';
    }

    const certMatch = /Certidão\s*(?:nº|número|n°)\s*[:\s]*([A-Z0-9\-/.]+)/i.exec(html);
    const certificateNumber = certMatch?.[1]?.trim() ?? null;

    const dateMatch = /[Vv]alidade[:\s]*(\d{2}\/\d{2}\/\d{4})/.exec(html);
    const validUntil = dateMatch?.[1] ?? null;

    return { status, certificateNumber, validUntil, reason: null, rawHtml: html };
  }
}
