export function formatCpf(cpf: string): string {
  const digits = cpf.replaceAll(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replaceAll(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

export function formatCnpj(cnpj: string): string {
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

export function formatDocument(docId: string | null | undefined, docType?: string | null): string {
  if (!docId) return '';
  const digits = String(docId).replaceAll(/\D/g, '');
  if (docType === 'CPF' || digits.length === 11) return formatCpf(docId);
  if (docType === 'CNPJ' || docType === 'PJ' || digits.length === 14) return formatCnpj(docId);
  return docId;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function resolveDisplayValue(value?: string | null | boolean | number): string | number {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return value || '—';
}

export function getRevenueStatusType(status: string | null | undefined): 'success' | 'danger' | 'neutral' {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (s === 'ATIVA') return 'success';
  if (s === 'INATIVA' || s === 'BAIXADA' || s === 'SUSPENSA' || s === 'INAPTA') return 'danger';
  return 'neutral';
}

export function getEnvironmentalStatusType(level: string | null | undefined): 'success' | 'danger' | 'warning' | 'neutral' {
  if (!level) return 'neutral';
  const l = level.toLowerCase();
  if (l.includes('sem risco') || l.includes('baixo')) return 'success';
  if (l.includes('alto') || l.includes('crítico')) return 'danger';
  if (l.includes('médio')) return 'warning';
  return 'neutral';
}
