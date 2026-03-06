export type AlertSeverity = 'warning' | 'high' | 'info';

export interface PartnerAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
}

export interface PartnerForAlerts {
  joinedAt?: string | null;
  mandateEndAt?: string | null;
  role?: string | null;
  participationPercentage?: string | null;
  restrictionSign?: string | null;
  authorizationType?: string | null;
}

const MS_PER_DAY = 86400 * 1000;
const DAYS_90 = 90;
const DAYS_365 = 365;
const DAYS_730 = 730;

function parseDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((date.getTime() - Date.now()) / MS_PER_DAY);
}

export function computePartnerAlerts(
  partner: PartnerForAlerts,
  foundedAt: string | null | undefined,
): PartnerAlert[] {
  const alerts: PartnerAlert[] = [];

  const joinedAtDate = parseDate(partner.joinedAt ?? null);
  const mandateEndDate = parseDate(partner.mandateEndAt ?? null);
  const foundationDate = parseDate(foundedAt ?? null);
  const participation = partner.participationPercentage
    ? Number(partner.participationPercentage)
    : null;

  const daysSinceJoined = daysSince(joinedAtDate);
  const daysUntilMandateEnd = daysUntil(mandateEndDate);
  const daysSinceFoundation = foundationDate ? daysSince(foundationDate) : null;

  if (partner.restrictionSign?.trim()) {
    alerts.push({
      id: 'restriction-sign',
      severity: 'high',
      message: 'Restrição cadastral no sócio',
    });
  }

  if (daysSinceJoined !== null && daysSinceJoined < DAYS_90) {
    alerts.push({
      id: 'recent-entry',
      severity: 'warning',
      message: 'Sócio entrou há menos de 3 meses',
    });
  }

  if (
    partner.authorizationType === 'administrator' &&
    mandateEndDate &&
    daysUntilMandateEnd !== null &&
    daysUntilMandateEnd >= 0 &&
    daysUntilMandateEnd <= DAYS_90
  ) {
    alerts.push({
      id: 'mandate-expiring',
      severity: 'info',
      message: 'Mandato expira em breve',
    });
  }

  if (
    participation !== null &&
    participation > 80 &&
    daysSinceFoundation !== null &&
    daysSinceFoundation < DAYS_730
  ) {
    alerts.push({
      id: 'high-concentration-young',
      severity: 'info',
      message: 'Alta participação em empresa recente',
    });
  }

  return alerts;
}

export function computeCompanyAlerts(foundedAt: string | null | undefined): PartnerAlert[] {
  const alerts: PartnerAlert[] = [];
  const foundationDate = parseDate(foundedAt ?? null);
  const daysSinceFoundation = foundationDate ? daysSince(foundationDate) : null;

  if (daysSinceFoundation !== null && daysSinceFoundation < DAYS_365) {
    alerts.push({
      id: 'company-less-than-year',
      severity: 'warning',
      message: 'Empresa com menos de 1 ano de atividade',
    });
  }

  return alerts;
}
