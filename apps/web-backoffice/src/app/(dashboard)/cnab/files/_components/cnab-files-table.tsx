'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Button,
} from '@nexus/ui';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Briefcase, FileText } from 'lucide-react';

interface CnabFile {
  id: string;
  originalFilename: string;
  bankCode: string;
  bankName: string | null;
  fileType?: string;
  serviceCode?: string | null;
  cedentCode?: string | null;
  cedentName: string | null;
  sequentialNumber?: number | null;
  remittanceDate: string | null;
  totalRecords: number | null;
  totalAmount: string | null;
  status: string;
  createdAt: string | null;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CnabFilesTableProps {
  files: CnabFile[];
  pagination: Pagination;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  uploaded: { label: 'Enviado', variant: 'outline' },
  processing: { label: 'Processando', variant: 'secondary' },
  processed: { label: 'Processado', variant: 'default' },
  error: { label: 'Erro', variant: 'destructive' },
  partially_processed: { label: 'Parcial', variant: 'secondary' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatCurrency(value: string | null): string {
  if (!value || value === '0') return '—';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CnabFilesTable({ files, pagination }: CnabFilesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Nenhum arquivo CNAB encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Cedente</TableHead>
              <TableHead>Data Remessa</TableHead>
              <TableHead className="text-right">Títulos</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((f) => {
              const statusConfig = STATUS_CONFIG[f.status] ?? { label: f.status, variant: 'outline' as const };
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{f.originalFilename}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</p>
                    {(f.serviceCode || f.sequentialNumber != null) && (
                      <p className="text-xs text-muted-foreground" title="CNAB: serviço e sequencial">
                        {[f.serviceCode && `Serv. ${f.serviceCode}`, f.sequentialNumber != null && `Seq. ${f.sequentialNumber}`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {f.fileType === 'return' ? 'Retorno' : 'Remessa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{f.bankName ?? f.bankCode}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{f.cedentName ?? '—'}</p>
                      {f.cedentCode && (
                        <p className="text-xs text-muted-foreground">({f.cedentCode})</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(f.remittanceDate)}</TableCell>
                  <TableCell className="text-sm text-right">{f.totalRecords ?? '—'}</TableCell>
                  <TableCell className="text-sm text-right">{formatCurrency(f.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/cnab/operations/file/${f.id}`}>
                        <Button variant="ghost" size="sm" title="Avaliar operação">
                          <Briefcase size={14} />
                        </Button>
                      </Link>
                      <Link href={`/cnab/receivables?cnabFileId=${f.id}`}>
                        <Button variant="ghost" size="sm" title="Ver duplicatas">
                          <FileText size={14} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} arquivos)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
