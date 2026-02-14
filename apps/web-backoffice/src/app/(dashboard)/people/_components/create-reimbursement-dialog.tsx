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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus/ui';
import { Loader2, Upload } from 'lucide-react';
import { REIMBURSEMENT_CATEGORIES, REIMBURSEMENT_CATEGORY_LABELS } from '@nexus/utils';
import { api } from '@/lib/api';

const createReimbursementSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  category: z.enum(REIMBURSEMENT_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Categoria é obrigatória' }),
  }),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido (use 0.00)'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD'),
});

type CreateReimbursementFormData = z.infer<typeof createReimbursementSchema>;

interface CreateReimbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateReimbursementDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateReimbursementDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateReimbursementFormData>({
    resolver: zodResolver(createReimbursementSchema) as never,
    defaultValues: {
      title: '',
      description: '',
      category: '',
      amount: '',
      expenseDate: new Date().toISOString().slice(0, 10),
    },
  });

  const categoryValue = watch('category');

  async function onSubmit(data: CreateReimbursementFormData) {
    try {
      const response = await api.post<{ data: { id: string } }>(
        '/people/reimbursements',
        {
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          amount: data.amount,
          expenseDate: data.expenseDate,
        },
      );

      const created = response as { data?: { id?: string } };
      const reimbursementId = created.data?.id;

      if (file && reimbursementId) {
        const formData = new FormData();
        formData.append('file', file);
        await api.postFormData(
          `/people/reimbursements/${reimbursementId}/upload`,
          formData,
        );
      }

      toast.success('Reembolso criado com sucesso');
      reset();
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Erro ao criar reembolso');
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      reset();
      setFile(null);
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Reembolso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ex: Uber para reunião com cliente"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Opcional"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={categoryValue}
                onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {REIMBURSEMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {REIMBURSEMENT_CATEGORY_LABELS[cat] ?? cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  {...register('amount')}
                  placeholder="0,00"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Data da despesa</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  {...register('expenseDate')}
                />
                {errors.expenseDate && (
                  <p className="text-xs text-destructive">{errors.expenseDate.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comprovante (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="receipt-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-2" />
                  {file ? file.name : 'Selecionar arquivo'}
                </Button>
              </div>
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
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
