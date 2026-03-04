import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'node:dns/promises';

export type EmailType = 'corporate' | 'free' | 'unknown';

export interface DigitalPresenceResult {
  domain: string | null;
  emailType: EmailType;
  hasDns: boolean;
  hasActiveSite: boolean;
  siteTitle: string | null;
  rawData: Record<string, unknown>;
}

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.com.br',
  'outlook.com', 'outlook.com.br',
  'live.com', 'live.com.br',
  'yahoo.com', 'yahoo.com.br',
  'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'r7.com',
]);

@Injectable()
export class DigitalPresenceAdapter {
  private readonly logger = new Logger(DigitalPresenceAdapter.name);
  private readonly httpTimeoutMs = 10_000;

  async check(email: string): Promise<DigitalPresenceResult> {
    const domain = this.extractDomain(email);
    if (!domain) {
      this.logger.warn(`Could not extract domain from email: ${email}`);
      return this.emptyResult();
    }

    const emailType = this.classifyEmail(domain);
    const hasDns = await this.checkDns(domain);
    const siteProbe = hasDns ? await this.probeSite(domain) : { active: false, title: null };

    return {
      domain,
      emailType,
      hasDns,
      hasActiveSite: siteProbe.active,
      siteTitle: siteProbe.title,
      rawData: {
        domain,
        emailType,
        hasDns,
        hasActiveSite: siteProbe.active,
        siteTitle: siteProbe.title,
      },
    };
  }

  private extractDomain(email: string): string | null {
    const atIndex = email.indexOf('@');
    if (atIndex < 0) return null;
    return email.slice(atIndex + 1).toLowerCase().trim();
  }

  private classifyEmail(domain: string): EmailType {
    if (FREE_EMAIL_DOMAINS.has(domain)) return 'free';
    return 'corporate';
  }

  private async checkDns(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolve(domain, 'A');
      return records.length > 0;
    } catch {
      try {
        const records = await dns.resolve(domain, 'CNAME');
        return records.length > 0;
      } catch {
        return false;
      }
    }
  }

  private async probeSite(domain: string): Promise<{ active: boolean; title: string | null }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.httpTimeoutMs);

    try {
      const response = await fetch(`https://${domain}`, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { active: false, title: null };
      }

      const html = await response.text();
      const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
      const titleExec = titleRegex.exec(html);
      const title = titleExec?.[1]?.trim().slice(0, 200) ?? null;

      return { active: true, title };
    } catch {
      clearTimeout(timeoutId);
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), this.httpTimeoutMs);
        const response = await fetch(`http://${domain}`, {
          method: 'GET',
          signal: controller2.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId2);

        if (!response.ok) return { active: false, title: null };

        const html = await response.text();
        const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const titleExec = titleRegex.exec(html);
        const title = titleExec?.[1]?.trim().slice(0, 200) ?? null;
        return { active: true, title };
      } catch {
        return { active: false, title: null };
      }
    }
  }

  private emptyResult(): DigitalPresenceResult {
    return {
      domain: null,
      emailType: 'unknown',
      hasDns: false,
      hasActiveSite: false,
      siteTitle: null,
      rawData: {},
    };
  }
}
