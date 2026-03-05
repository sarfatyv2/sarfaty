'use client';

import { TableRow, TableCell } from '@nexus/ui';

interface ReceivableData {
  clientName?: string | null;
  draweeDoc: string | null;
  draweeDocType: string | null;
  draweeName: string | null;
  draweeAddress: string | null;
  draweeNeighborhood: string | null;
  draweeCity: string | null;
  draweeState: string | null;
  draweeZip: string | null;
  draweeEmail: string | null;
  ourNumber: string | null;
  portfolioCode: string | null;
  bankCode: string | null;
  branch: string | null;
  speciesCode: string | null;
  acceptance: string | null;
  instruction1: string | null;
  instruction2: string | null;
  interestPerDay: string | null;
  discountValue: string | null;
  discountDeadline: string | null;
  penaltyValue: string | null;
  iofValue: string | null;
  issueDate: string | null;
}

interface ReceivableExpandedRowProps {
  data: ReceivableData;
  colSpan: number;
}

function formatCurrency(value: string | null): string {
  if (!value || value === '0') return '—';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatDoc(doc: string | null, type: string | null): string {
  if (!doc) return '—';
  const d = doc.replaceAll(/\D/g, '');
  if (type === 'cnpj' && d.length === 14) {
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (type === 'cpf' && d.length === 11) {
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return doc;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

export function ReceivableExpandedRow({ data, colSpan }: ReceivableExpandedRowProps) {
  const address = [data.draweeAddress, data.draweeNeighborhood, data.draweeCity, data.draweeState]
    .filter(Boolean)
    .join(', ');

  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={colSpan} className="p-4">
        {data.clientName && (
          <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Cliente (cedente)</p>
            <p className="text-base font-semibold text-foreground">{data.clientName}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dados do Sacado */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Sacado</h4>
            <InfoItem label="Documento" value={formatDoc(data.draweeDoc, data.draweeDocType)} />
            <InfoItem label="Nome" value={data.draweeName ?? '—'} />
            <InfoItem label="Endereço" value={address || '—'} />
            <InfoItem label="CEP" value={data.draweeZip ?? '—'} />
            {data.draweeEmail && <InfoItem label="Email" value={data.draweeEmail} />}
          </div>

          {/* Dados Financeiros */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Financeiro</h4>
            <InfoItem label="Data de Emissão" value={formatDate(data.issueDate)} />
            <InfoItem label="Juros/Dia" value={formatCurrency(data.interestPerDay)} />
            <InfoItem label="Desconto" value={formatCurrency(data.discountValue)} />
            <InfoItem label="Prazo Desconto" value={formatDate(data.discountDeadline)} />
            <InfoItem label="Abatimento" value={formatCurrency(data.penaltyValue)} />
            <InfoItem label="IOF" value={formatCurrency(data.iofValue)} />
          </div>

          {/* Dados CNAB */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">CNAB</h4>
            <InfoItem label="Nosso Número" value={data.ourNumber ?? '—'} />
            <InfoItem label="Carteira" value={data.portfolioCode ?? '—'} />
            <InfoItem label="Banco Cobrador" value={data.bankCode ?? '—'} />
            <InfoItem label="Agência" value={data.branch ?? '—'} />
            <InfoItem label="Espécie" value={data.speciesCode ?? '—'} />
            <InfoItem label="Aceite" value={data.acceptance === 'S' ? 'Sim' : data.acceptance === 'N' ? 'Não' : '—'} />
            <InfoItem label="Instrução 1" value={data.instruction1 ?? '—'} />
            <InfoItem label="Instrução 2" value={data.instruction2 ?? '—'} />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
