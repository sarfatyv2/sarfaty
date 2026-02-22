'use client';

import { useState, useCallback } from 'react';
import { Button, Badge } from '@nexus/ui';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { DOCUMENT_CATEGORY_LABELS } from '@nexus/utils';
import type { DocumentChecklistItem, CanSubmitResult } from '@nexus/types';
import type { CreateCommercialReportDto } from '@nexus/validators';
import { CommercialReportDialog } from './commercial-report-dialog';

function getStatusBadgeVariant(status: string): 'default' | 'destructive' | 'secondary' {
  if (status === 'valid') return 'default';
  if (status === 'invalid') return 'destructive';
  return 'secondary';
}

interface DocumentChecklistProps {
  clientId: string;
  checklist: DocumentChecklistItem[];
  canSubmitResult: CanSubmitResult;
  onRefresh: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function getDocumentStatusIcon(status: string) {
  switch (status) {
    case 'uploaded':
      return <FileText size={16} className="text-blue-500" />;
    case 'validating':
      return <Loader2 size={16} className="animate-spin text-yellow-500" />;
    case 'valid':
      return <CheckCircle2 size={16} className="text-green-600" />;
    case 'invalid':
      return <XCircle size={16} className="text-destructive" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
  }
}

function getDocumentStatusLabel(status: string): string {
  switch (status) {
    case 'missing': return 'Pendente';
    case 'uploaded': return 'Enviado';
    case 'validating': return 'Validando';
    case 'valid': return 'Válido';
    case 'invalid': return 'Inválido';
    default: return status;
  }
}

function DocumentUploadItem({
  item,
  clientId,
  onRefresh,
  onInterceptReport,
  isParsing,
}: {
  item: DocumentChecklistItem;
  clientId: string;
  onRefresh: () => void;
  onInterceptReport?: (file: File, item: DocumentChecklistItem) => void;
  isParsing?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isWorking = uploading || isParsing;

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (item.documentType === 'visit_report' && onInterceptReport) {
      onInterceptReport(file, item);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', item.documentType);
      formData.append('documentCategory', item.category);
      formData.append('documentLabel', item.documentLabel);
      if (item.guaranteeId) {
        formData.append('clientGuaranteeId', item.guaranteeId);
      }

      await api.postFormData(`/clients/${clientId}/documents`, formData);
      onRefresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao enviar documento');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [clientId, item, onRefresh]);

  const handleDelete = useCallback(async () => {
    if (!item.documentId) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/clients/${clientId}/documents/${item.documentId}`);
      onRefresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao remover documento');
    } finally {
      setDeleting(false);
    }
  }, [clientId, item.documentId, onRefresh]);

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg border bg-card">
      {getDocumentStatusIcon(item.status)}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{item.documentLabel}</span>
          {item.isRequired && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Obrigatório
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
        {item.fileName && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.fileName}</p>
        )}
        {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant={getStatusBadgeVariant(item.status)}
          className="text-[10px]"
        >
          {getDocumentStatusLabel(item.status)}
        </Badge>

        {item.status === 'missing' && (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
              onChange={handleUpload}
              disabled={isWorking}
            />
            <Button type="button" variant="outline" size="sm" asChild disabled={isWorking}>
              <span>
                {isWorking ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Enviar
              </span>
            </Button>
          </label>
        )}

        {(item.status === 'uploaded' || item.status === 'invalid') && item.documentId && (
          <div className="flex items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                onChange={handleUpload}
                disabled={isWorking}
              />
              <Button type="button" variant="outline" size="sm" asChild disabled={isWorking}>
                <span>
                  {isWorking ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Reenviar
                </span>
              </Button>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentChecklist({
  clientId,
  checklist,
  canSubmitResult,
  onRefresh,
  onSubmit,
  submitting,
}: DocumentChecklistProps) {
  const [parsingReport, setParsingReport] = useState(false);
  const [parsedReportData, setParsedReportData] = useState<Partial<CreateCommercialReportDto> | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportItem, setReportItem] = useState<DocumentChecklistItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleInterceptReport = async (file: File, item: DocumentChecklistItem) => {
    setParsingReport(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.postFormData<Partial<CreateCommercialReportDto>>(
        `/clients/${clientId}/commercial-reports/parse`,
        formData
      );
      setParsedReportData(res.data);
      setReportFile(file);
      setReportItem(item);
      setDialogOpen(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao ler a planilha. Verifique o formato.';
      toast.error(message);
    } finally {
      setParsingReport(false);
    }
  };

  const handleConfirmReport = async (data: CreateCommercialReportDto) => {
    if (!reportFile || !reportItem) return;
    
    try {
      // 1. Salva os dados estruturados do relatório comercial
      await api.post(`/clients/${clientId}/commercial-reports`, data);
      
      // 2. Faz o upload físico do documento
      const formData = new FormData();
      formData.append('file', reportFile);
      formData.append('documentType', reportItem.documentType);
      formData.append('documentCategory', reportItem.category);
      formData.append('documentLabel', reportItem.documentLabel);
      if (reportItem.guaranteeId) {
        formData.append('clientGuaranteeId', reportItem.guaranteeId);
      }
      
      await api.postFormData(`/clients/${clientId}/documents`, formData);
      
      setDialogOpen(false);
      onRefresh();
      toast.success('Relatório comercial salvo com sucesso!');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar relatório comercial';
      toast.error(message);
    }
  };

  const grouped = checklist.reduce<Record<string, DocumentChecklistItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const progressPercent =
    canSubmitResult.totalRequired > 0
      ? Math.round((canSubmitResult.totalUploaded / canSubmitResult.totalRequired) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {canSubmitResult.totalUploaded} de {canSubmitResult.totalRequired} documentos obrigatórios enviados
          </span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {DOCUMENT_CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <DocumentUploadItem
                key={`${item.documentType}-${item.guaranteeId ?? ''}`}
                item={item}
                clientId={clientId}
                onRefresh={onRefresh}
                onInterceptReport={handleInterceptReport}
                isParsing={item.documentType === 'visit_report' ? parsingReport : false}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        {canSubmitResult.missingDocuments.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Documentos pendentes: {canSubmitResult.missingDocuments.join(', ')}
          </p>
        )}
        <Button
          onClick={onSubmit}
          disabled={!canSubmitResult.canSubmit || submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar para Análise'
          )}
        </Button>
      </div>

      <CommercialReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmReport}
        parsedData={parsedReportData}
        fileName={reportFile?.name ?? ''}
      />
    </div>
  );
}
