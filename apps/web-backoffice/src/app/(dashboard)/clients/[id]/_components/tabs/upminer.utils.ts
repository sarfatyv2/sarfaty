export const POLL_INTERVAL_MS = 5_000;
export const MAX_SYNC_POLL_ATTEMPTS = 72; // 6 minutes
export const PDF_POLL_INTERVAL_MS = 2_000;
export const MAX_PDF_POLL_ATTEMPTS = 30;

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return '—';
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

export function formatCurrency(moeda: string | null, valor: string | null): string {
  if (!valor) return '—';
  const v = Number.parseFloat(valor);
  if (Number.isNaN(v)) return valor;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda ?? 'BRL',
    minimumFractionDigits: 2,
  }).format(v);
}

export function boolLabel(v: boolean | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v ? 'Sim' : 'Não';
}
