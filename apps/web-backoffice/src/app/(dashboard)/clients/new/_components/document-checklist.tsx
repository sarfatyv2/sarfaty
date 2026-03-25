'use client';

import { useState, useCallback } from 'react';
import { Button, Badge } from '@nexus/ui';
import { Upload, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { DOCUMENT_CATEGORY_LABELS } from '@nexus/utils';
import type { DocumentChecklistItem, CanSubmitResult } from '@nexus/types';

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
  onSilentRefresh: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function getDocumentStatusIcon(status: string) {
  switch (status) {
    case 'uploaded':
      return <Loader2 size={16} className="animate-spin text-blue-500" />;
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
    case 'uploaded': return 'Processando';
    case 'validating': return 'Validando';
    case 'valid': return 'Válido';
    case 'invalid': return 'Inválido';
    default: return status;
  }
}

function getStatusBadgeClass(status: string): string {
  if (status === 'uploaded' || status === 'validating') {
    return 'animate-pulse';
  }
  return '';
}

// Document types grouped by year within a container (base category)
const YEAR_GROUPED_DOC_TYPES: Record<string, string> = {
  revenue: 'Faturamento',
  balance_sheet_dre: 'Balanços e DRE',
};

// Short labels for partner-scoped document types shown inside a partner container
const PARTNER_DOC_COMPACT_LABELS: Record<string, string> = {
  partner_id: 'CNH ou RG',
  partner_address_proof: 'Comprovante de Endereço',
};

function getPartnerItemLabel(item: DocumentChecklistItem): string {
  if (PARTNER_DOC_COMPACT_LABELS[item.documentType]) {
    return PARTNER_DOC_COMPACT_LABELS[item.documentType]!;
  }
  if (item.documentType === 'irpf' && item.referenceYear != null) {
    return `IRPF — ${item.referenceYear}`;
  }
  return item.documentLabel;
}

function DocumentUploadItem({
  item,
  clientId,
  onRefresh,
  onSilentRefresh,
  compact,
  compactLabel,
}: {
  item: DocumentChecklistItem;
  clientId: string;
  onRefresh: () => void;
  onSilentRefresh: () => void;
  compact?: boolean;
  compactLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      if (item.partnerName) {
        formData.append('partnerName', item.partnerName);
      }
      if (item.referenceYear != null) {
        formData.append('referenceYear', String(item.referenceYear));
      }

      await api.postFormData(`/clients/${clientId}/documents`, formData);
      // Silent refresh to avoid skeleton flash; polling will auto-update from here
      onSilentRefresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao enviar documento');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [clientId, item, onSilentRefresh]);

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

  const displayLabel = compactLabel ?? item.documentLabel;

  return (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-lg ${compact ? 'bg-muted/50' : 'border bg-card'}`}>
      {getDocumentStatusIcon(item.status)}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayLabel}</span>
          {!compact && item.isRequired && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Obrigatório
            </Badge>
          )}
        </div>
        {!compact && item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
        {item.fileName && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.fileName}</p>
        )}
        {item.status === 'invalid' && item.rejectionReason && (
          <p className="text-xs text-destructive mt-1">{item.rejectionReason}</p>
        )}
        {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant={getStatusBadgeVariant(item.status)}
          className={`text-[10px] ${getStatusBadgeClass(item.status)}`}
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
              disabled={uploading}
            />
            <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Enviar
              </span>
            </Button>
          </label>
        )}

        {item.status !== 'missing' && item.documentId && (
          <div className="flex items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
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

function DocumentGroupContainer({
  groupLabel,
  items,
  clientId,
  onRefresh,
  onSilentRefresh,
  getItemLabel,
}: {
  groupLabel: string;
  items: DocumentChecklistItem[];
  clientId: string;
  onRefresh: () => void;
  onSilentRefresh: () => void;
  getItemLabel?: (item: DocumentChecklistItem) => string;
}) {
  const uploaded = items.filter((i) => i.status !== 'missing').length;
  const allRequired = items.length > 0 && items.every((i) => i.isRequired);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{groupLabel}</span>
          {allRequired && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Obrigatório
            </Badge>
          )}
        </div>
        <Badge variant={uploaded === items.length ? 'default' : 'secondary'} className="text-[10px]">
          {uploaded} de {items.length} enviados
        </Badge>
      </div>
      <div className="p-2 space-y-1">
        {items.map((item) => (
          <DocumentUploadItem
            key={`${item.documentType}-${item.partnerCpf ?? ''}-${item.referenceYear ?? ''}`}
            item={item}
            clientId={clientId}
            onRefresh={onRefresh}
            onSilentRefresh={onSilentRefresh}
            compact
            compactLabel={getItemLabel ? getItemLabel(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function DocumentChecklist({
  clientId,
  checklist,
  canSubmitResult,
  onRefresh,
  onSilentRefresh,
  onSubmit,
  submitting,
}: DocumentChecklistProps) {
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

      {Object.entries(grouped).map(([category, items]) => {
        // 'partner' category: group all items by partner name (one container per partner)
        if (category === 'partner') {
          const partnerGroups = new Map<string, DocumentChecklistItem[]>();
          for (const item of items) {
            const key = item.partnerName ?? '__unknown__';
            const list = partnerGroups.get(key) ?? [];
            list.push(item);
            partnerGroups.set(key, list);
          }

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {DOCUMENT_CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="space-y-2">
                {Array.from(partnerGroups.entries()).map(([partnerName, partnerItems]) => (
                  <DocumentGroupContainer
                    key={partnerName}
                    groupLabel={partnerName}
                    items={partnerItems}
                    clientId={clientId}
                    onRefresh={onRefresh}
                    onSilentRefresh={onSilentRefresh}
                    getItemLabel={getPartnerItemLabel}
                  />
                ))}
              </div>
            </div>
          );
        }

        // All other categories: group by document type for year-expanded types
        const regularItems = items.filter((i) => !YEAR_GROUPED_DOC_TYPES[i.documentType]);
        const yearGroupedItems = items.filter((i) => !!YEAR_GROUPED_DOC_TYPES[i.documentType]);

        const yearGroups = new Map<string, DocumentChecklistItem[]>();
        for (const item of yearGroupedItems) {
          const list = yearGroups.get(item.documentType) ?? [];
          list.push(item);
          yearGroups.set(item.documentType, list);
        }

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {DOCUMENT_CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="space-y-2">
              {Array.from(yearGroups.entries()).map(([docType, groupItems]) => (
                <DocumentGroupContainer
                  key={docType}
                  groupLabel={YEAR_GROUPED_DOC_TYPES[docType]!}
                  items={groupItems}
                  clientId={clientId}
                  onRefresh={onRefresh}
                  onSilentRefresh={onSilentRefresh}
                  getItemLabel={(item) => item.referenceYear != null ? String(item.referenceYear) : item.documentLabel}
                />
              ))}
              {regularItems.map((item) => (
                <DocumentUploadItem
                  key={`${item.documentType}-${item.guaranteeId ?? ''}-${item.partnerCpf ?? ''}-${item.referenceYear ?? ''}`}
                  item={item}
                  clientId={clientId}
                  onRefresh={onRefresh}
                  onSilentRefresh={onSilentRefresh}
                />
              ))}
            </div>
          </div>
        );
      })}

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
    </div>
  );
}
