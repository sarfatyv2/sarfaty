'use client';

import { useState, useRef } from 'react';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@nexus/ui';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CnabUploadResult } from './cnab-upload-result';

interface UploadResult {
  data: {
    id: string;
    status: string;
    originalFilename: string;
  };
  parsed: {
    totalParsed: number;
    errors: number;
  };
}

const BANKS = [
  { code: '237', name: 'Bradesco' },
  { code: '274', name: 'BMP Money Plus' },
];

export function CnabUploadForm({ clientId }: { readonly clientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? '');
  const [bankCode, setBankCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = selectedClientId && file && !uploading;

  async function handleUpload() {
    if (!file || !selectedClientId) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', selectedClientId);
      if (bankCode) formData.append('bankCode', bankCode);

      const response = await api.postFormData<UploadResult>('/cnab/upload', formData);
      const data = response as unknown as UploadResult;
      setResult(data);
      toast.success(`Arquivo processado: ${data.parsed.totalParsed} títulos`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar arquivo CNAB');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="cnab-client-id" className="text-sm font-medium">
            ID do Cliente (cedente)
          </label>
          <Input
            id="cnab-client-id"
            placeholder="UUID do cliente..."
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Informe o ID do cliente que está enviando o arquivo CNAB
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="cnab-bank-select" className="text-sm font-medium">
            Banco (opcional)
          </label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger id="cnab-bank-select" className="w-full">
              <SelectValue placeholder="Auto-detectar pelo arquivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detectar</SelectItem>
              {BANKS.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>
                  {bank.code} — {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label htmlFor="cnab-file-input" className="block space-y-2">
          <span className="text-sm font-medium">Arquivo CNAB</span>
          <span className="flex items-center gap-3 rounded-md border border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <FileUp size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1">
              {file ? (
                <span className="text-sm font-medium">{file.name}</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Clique para selecionar um arquivo .rem, .REM ou .txt
                </span>
              )}
            </span>
          </span>
          <input
            ref={fileInputRef}
            id="cnab-file-input"
            type="file"
            className="sr-only"
            accept=".rem,.REM,.ret,.txt"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
              setResult(null);
            }}
          />
        </label>

        <Button onClick={handleUpload} disabled={!canSubmit} className="w-full">
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload size={16} />
              Enviar e Processar
            </>
          )}
        </Button>
      </div>

      {result && (
        <CnabUploadResult
          fileId={result.data.id}
          totalParsed={result.parsed.totalParsed}
          errors={result.parsed.errors}
          status={result.data.status}
          originalFilename={result.data.originalFilename}
        />
      )}
    </div>
  );
}
