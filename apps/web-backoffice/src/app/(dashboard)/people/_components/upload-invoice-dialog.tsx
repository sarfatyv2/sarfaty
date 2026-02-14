'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@nexus/ui';
import { Loader2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

const uploadInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Número da NF é obrigatório'),
  invoiceAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido (use 0.00)'),
});

type UploadInvoiceFormData = z.infer<typeof uploadInvoiceSchema>;

interface PjInvoice {
  id: string;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  invoiceAmount: string;
  [key: string]: unknown;
}

interface UploadInvoiceDialogProps {
  invoice: PjInvoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function UploadInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: UploadInvoiceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UploadInvoiceFormData>({
    resolver: zodResolver(uploadInvoiceSchema) as never,
    defaultValues: {
      invoiceNumber: '',
      invoiceAmount: invoice.invoiceAmount ?? '',
    },
  });

  async function onSubmit(data: UploadInvoiceFormData) {
    if (!file) {
      toast.error('Selecione o arquivo PDF da nota fiscal');
      return;
    }

    if (!file.type.includes('pdf')) {
      toast.error('O arquivo deve ser PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceNumber', data.invoiceNumber);
      formData.append('invoiceAmount', data.invoiceAmount);

      await api.postFormData<{ data: PjInvoice }>(
        `/people/invoices/${invoice.id}/upload`,
        formData,
      );

      toast.success('Nota fiscal enviada com sucesso');
      reset();
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Erro ao enviar nota fiscal');
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      reset();
      setFile(null);
    }
    onOpenChange(newOpen);
  }

  const periodLabel = `${MONTH_NAMES[invoice.referenceMonth - 1]} ${invoice.referenceYear}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Nota Fiscal — {periodLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Arquivo PDF</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="invoice-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-2" />
                  {file ? file.name : 'Selecionar PDF'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Número da NF</Label>
              <Input
                id="invoiceNumber"
                {...register('invoiceNumber')}
                placeholder="Ex: 00001"
              />
              {errors.invoiceNumber && (
                <p className="text-xs text-destructive">
                  {errors.invoiceNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceAmount">Valor (R$)</Label>
              <Input
                id="invoiceAmount"
                {...register('invoiceAmount')}
                placeholder="0,00"
              />
              {errors.invoiceAmount && (
                <p className="text-xs text-destructive">
                  {errors.invoiceAmount.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
