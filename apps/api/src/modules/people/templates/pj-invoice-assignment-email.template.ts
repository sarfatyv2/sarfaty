import { formatCNPJ } from '@nexus/utils';

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export interface PjInvoiceAssignmentEmailParams {
  collaboratorName: string;
  billingCompanyName: string;
  billingCompanyCnpjDigits: string;
  referenceMonth: number;
  referenceYear: number;
}

export function buildPjInvoiceAssignmentEmailHtml(
  params: PjInvoiceAssignmentEmailParams,
): string {
  const monthLabel = MONTH_NAMES_PT[params.referenceMonth - 1] ?? String(params.referenceMonth);
  const referenceMonthYear = `${monthLabel}/${params.referenceYear}`;
  const cnpjFormatted = formatCNPJ(params.billingCompanyCnpjDigits);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Olá, <strong>${escapeHtml(params.collaboratorName)}</strong>,</p>
  <p>Para o período de <strong>${escapeHtml(referenceMonthYear)}</strong>, emita sua nota fiscal com destino (tomador) para:</p>
  <ul>
    <li><strong>Razão social:</strong> ${escapeHtml(params.billingCompanyName)}</li>
    <li><strong>CNPJ:</strong> ${escapeHtml(cnpjFormatted)}</li>
  </ul>
  <p>Após emitir, envie o arquivo da NF pelo portal em <strong>People → Minhas Notas Fiscais</strong>.</p>
  <p>Atenciosamente,<br/>RH</p>
</body>
</html>
`.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPjInvoiceAssignmentEmailSubject(referenceMonth: number, referenceYear: number): string {
  const monthLabel = MONTH_NAMES_PT[referenceMonth - 1] ?? String(referenceMonth);
  return `Nota fiscal PJ — ${monthLabel}/${referenceYear} — empresa tomadora`;
}
