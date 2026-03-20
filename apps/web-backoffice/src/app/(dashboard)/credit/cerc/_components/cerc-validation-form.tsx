'use client';

import { useState, useRef, useCallback } from 'react';
import { Loader2, Upload, X, FileImage, Sparkles } from 'lucide-react';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@nexus/ui';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CercValidationFormData {
  numeroDuplicata: string;
  chaveNfe: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  cnpjOriginador: string;
  referenciaExterna?: string;
}

interface NfeExtractedData {
  numeroDuplicata: string | null;
  chaveNfe: string | null;
  valor: number | null;
  vencimento: string | null;
  cnpjCedente: string | null;
  cnpjOriginador: string | null;
  cnpjCpfPagador: string | null;
  tipoPagador: 'cpf' | 'cnpj' | null;
}

interface CercValidationFormProps {
  isSubmitting: boolean;
  onSubmit: (data: CercValidationFormData) => void;
}

function stripNonDigits(value: string): string {
  return value.replaceAll(/\D/g, '');
}

const EMPTY_FIELDS = {
  numeroDuplicata: '',
  chaveNfe: '',
  valor: '',
  vencimento: '',
  cnpjCedente: '',
  cnpjCpfPagador: '',
  tipoPagador: 'cnpj' as 'cpf' | 'cnpj',
  cnpjOriginador: '',
  referenciaExterna: '',
};

export function CercValidationForm({ isSubmitting, onSubmit }: Readonly<CercValidationFormProps>) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState(EMPTY_FIELDS);

  const applyExtracted = useCallback((data: NfeExtractedData) => {
    setFields((prev) => ({
      ...prev,
      numeroDuplicata: data.numeroDuplicata ?? prev.numeroDuplicata,
      chaveNfe: data.chaveNfe ?? prev.chaveNfe,
      valor: data.valor != null ? String(data.valor) : prev.valor,
      vencimento: data.vencimento ?? prev.vencimento,
      cnpjCedente: data.cnpjCedente ?? prev.cnpjCedente,
      cnpjOriginador: data.cnpjOriginador ?? prev.cnpjOriginador,
      cnpjCpfPagador: data.cnpjCpfPagador ?? prev.cnpjCpfPagador,
      tipoPagador: data.tipoPagador ?? prev.tipoPagador,
    }));
  }, []);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageName(file.name);

      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);

      setIsExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const result = await api.postFormData<NfeExtractedData>('/credit/cerc/extract-nfe', formData);
        applyExtracted(result.data);
        toast.success('Dados extraídos da NF-e com sucesso');
      } catch {
        toast.error('Não foi possível extrair os dados. Preencha manualmente.');
      } finally {
        setIsExtracting(false);
      }
    },
    [applyExtracted],
  );

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleField = useCallback(
    (field: keyof typeof fields) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFields((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();

      const valorNum = Number(fields.valor.replace(',', '.'));
      if (Number.isNaN(valorNum) || valorNum <= 0) return;

      onSubmit({
        numeroDuplicata: fields.numeroDuplicata.trim(),
        chaveNfe: stripNonDigits(fields.chaveNfe),
        valor: valorNum,
        vencimento: fields.vencimento,
        cnpjCedente: stripNonDigits(fields.cnpjCedente),
        cnpjCpfPagador: stripNonDigits(fields.cnpjCpfPagador),
        tipoPagador: fields.tipoPagador,
        cnpjOriginador: stripNonDigits(fields.cnpjOriginador),
        referenciaExterna: fields.referenciaExterna.trim() || undefined,
      });
    },
    [fields, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload with OCR */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            Upload da Nota Fiscal
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Envie a imagem ou PDF da DANFE para preenchimento automático dos campos.
          </p>
        </CardHeader>
        <CardContent>
          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview da NF-e"
                  className="w-full max-h-64 object-contain"
                />
                {isExtracting && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                    <Loader2 size={22} className="animate-spin text-primary" />
                    <p className="text-xs font-medium">Extraindo dados com IA...</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileImage size={13} />
                <span className="truncate">{imageName}</span>
                {isExtracting && <Loader2 size={12} className="animate-spin ml-auto shrink-0" />}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
            >
              <Upload size={22} />
              <div className="text-center">
                <p className="text-sm font-medium">Clique para fazer upload</p>
                <p className="text-xs mt-0.5">PNG, JPG, PDF até 10MB</p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleImageChange}
          />
        </CardContent>
      </Card>

      {/* NF-e Data Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Dados da Duplicata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="numeroDuplicata" className="text-xs">
                Número da Duplicata <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numeroDuplicata"
                placeholder="Ex: 12811-2"
                value={fields.numeroDuplicata}
                onChange={handleField('numeroDuplicata')}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vencimento" className="text-xs">
                Vencimento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vencimento"
                type="date"
                value={fields.vencimento}
                onChange={handleField('vencimento')}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chaveNfe" className="text-xs">
              Chave NF-e (44 dígitos) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="chaveNfe"
              placeholder="31250300349443000788550270000128111547124236"
              value={fields.chaveNfe}
              onChange={handleField('chaveNfe')}
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valor" className="text-xs">
              Valor (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="358.40"
              value={fields.valor}
              onChange={handleField('valor')}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnpjCedente" className="text-xs">
              CNPJ Cedente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cnpjCedente"
              placeholder="13292092000172"
              value={fields.cnpjCedente}
              onChange={handleField('cnpjCedente')}
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnpjOriginador" className="text-xs">
              CNPJ Originador (Emitente da NF-e) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cnpjOriginador"
              placeholder="00349443000788"
              value={fields.cnpjOriginador}
              onChange={handleField('cnpjOriginador')}
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Pagador (Sacado) <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                value={fields.tipoPagador}
                onChange={handleField('tipoPagador')}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="cnpj">CNPJ</option>
                <option value="cpf">CPF</option>
              </select>
              <Input
                placeholder={fields.tipoPagador === 'cnpj' ? '44873461000100' : '44873461855'}
                value={fields.cnpjCpfPagador}
                onChange={handleField('cnpjCpfPagador')}
                maxLength={18}
                required
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referenciaExterna" className="text-xs">
              Referência Externa (opcional)
            </Label>
            <Input
              id="referenciaExterna"
              placeholder="Ex: Proposta #1234"
              value={fields.referenciaExterna}
              onChange={handleField('referenciaExterna')}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting || isExtracting}>
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin mr-2" />
            Validando...
          </>
        ) : (
          'Validar Duplicata'
        )}
      </Button>
    </form>
  );
}
