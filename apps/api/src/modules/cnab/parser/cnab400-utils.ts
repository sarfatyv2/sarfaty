/**
 * CNAB 400 common helpers for parsing fixed-width records.
 * All positions use 1-based indexing to match the spec documentation.
 */

export function substr(line: string, start: number, end: number): string {
  return line.substring(start - 1, end).trim();
}

export function parseDate(ddmmyy: string): string {
  if (!ddmmyy || ddmmyy.length < 6 || ddmmyy === '000000') return '';
  const dd = ddmmyy.substring(0, 2);
  const mm = ddmmyy.substring(2, 4);
  const yy = ddmmyy.substring(4, 6);
  const century = Number.parseInt(yy, 10) > 50 ? '19' : '20';
  return `${century}${yy}-${mm}-${dd}`;
}

export function parseCents(raw: string): number {
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) return 0;
  return value / 100;
}
