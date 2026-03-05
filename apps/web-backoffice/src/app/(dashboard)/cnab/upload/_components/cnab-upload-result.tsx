'use client';

import Link from 'next/link';
import { Button, Badge } from '@nexus/ui';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface CnabUploadResultProps {
  readonly fileId: string;
  readonly operationId?: string | null;
  readonly totalParsed: number;
  readonly errors: number;
  readonly status: string;
  readonly originalFilename: string;
}

function getResultTitle(status: string): string {
  if (status === 'processed') return 'Arquivo processado com sucesso';
  if (status === 'partially_processed') return 'Arquivo processado parcialmente';
  return 'Erro no processamento';
}

function getResultBadgeLabel(status: string): string {
  if (status === 'processed') return 'Processado';
  if (status === 'partially_processed') return 'Parcial';
  return 'Erro';
}

export function CnabUploadResult({ fileId, operationId, totalParsed, errors, status, originalFilename }: CnabUploadResultProps) {
  const isSuccess = status === 'processed';

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        )}
        <div>
          <h3 className="font-medium">{getResultTitle(status)}</h3>
          <p className="text-sm text-muted-foreground">{originalFilename}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="rounded-md bg-muted px-4 py-2">
          <p className="text-xs text-muted-foreground">Títulos parseados</p>
          <p className="text-2xl font-semibold">{totalParsed}</p>
        </div>
        {errors > 0 && (
          <div className="rounded-md bg-destructive/10 px-4 py-2">
            <p className="text-xs text-destructive">Erros</p>
            <p className="text-2xl font-semibold text-destructive">{errors}</p>
          </div>
        )}
        <div className="rounded-md bg-muted px-4 py-2">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge variant={isSuccess ? 'default' : 'destructive'} className="mt-1">
            {getResultBadgeLabel(status)}
          </Badge>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {operationId && (
          <Link href={`/cnab/operations/${operationId}`}>
            <Button variant="default" size="sm">
              <ExternalLink size={14} />
              Avaliar operação
            </Button>
          </Link>
        )}
        <Link href={`/cnab/receivables?cnabFileId=${fileId}`}>
          <Button variant={operationId ? 'outline' : 'default'} size="sm">
            <ExternalLink size={14} />
            Ver duplicatas deste arquivo
          </Button>
        </Link>
        <Link href="/cnab/files">
          <Button variant="outline" size="sm">
            Ver todos os arquivos
          </Button>
        </Link>
      </div>
    </div>
  );
}
