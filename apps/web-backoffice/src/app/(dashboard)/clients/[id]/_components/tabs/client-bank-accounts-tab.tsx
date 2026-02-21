'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Skeleton,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { ClientBankAccount } from '@nexus/types';

interface ClientBankAccountsTabProps {
  clientId: string;
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'payment', label: 'Pagamento' },
];

type FormData = {
  bankCode: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  pixKey: string;
  nickname: string;
  isPrimary: boolean;
};

const emptyForm: FormData = {
  bankCode: '', bankName: '', branch: '', accountNumber: '',
  accountType: '', pixKey: '', nickname: '', isPrimary: false,
};

export function ClientBankAccountsTab({ clientId }: ClientBankAccountsTabProps) {
  const [accounts, setAccounts] = useState<ClientBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ClientBankAccount[]>(`/clients/${clientId}/bank-accounts`);
      setAccounts(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(account: ClientBankAccount) {
    setEditingId(account.id);
    setForm({
      bankCode: account.bankCode ?? '',
      bankName: account.bankName ?? '',
      branch: account.branch ?? '',
      accountNumber: account.accountNumber ?? '',
      accountType: account.accountType ?? '',
      pixKey: account.pixKey ?? '',
      nickname: account.nickname ?? '',
      isPrimary: account.isPrimary,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        bankCode: form.bankCode || undefined,
        bankName: form.bankName || undefined,
        branch: form.branch || undefined,
        accountNumber: form.accountNumber || undefined,
        accountType: form.accountType || undefined,
        pixKey: form.pixKey || undefined,
        nickname: form.nickname || undefined,
        isPrimary: form.isPrimary,
      };
      if (editingId) {
        await api.patch(`/clients/${clientId}/bank-accounts/${editingId}`, body);
        toast.success('Conta atualizada');
      } else {
        await api.post(`/clients/${clientId}/bank-accounts`, body);
        toast.success('Conta adicionada');
      }
      setDialogOpen(false);
      loadAccounts();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar conta');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/clients/${clientId}/bank-accounts/${id}`);
      toast.success('Conta removida');
      loadAccounts();
    } catch {
      toast.error('Erro ao remover conta');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} />
          Adicionar Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conta bancária cadastrada.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {a.bankName ?? a.bankCode ?? '—'}
                  {a.nickname && <span className="text-muted-foreground ml-2 text-xs">({a.nickname})</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[`Ag. ${a.branch}`, `CC ${a.accountNumber}`, a.pixKey && `PIX: ${a.pixKey}`].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                >
                  {deleting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco (Código)</Label>
                <Input value={form.bankCode} onChange={(e) => setForm((p) => ({ ...p, bankCode: e.target.value }))} placeholder="001" />
              </div>
              <div className="space-y-2">
                <Label>Banco (Nome)</Label>
                <Input value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} placeholder="Banco do Brasil" />
              </div>
              <div className="space-y-2">
                <Label>Agência</Label>
                <Input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select value={form.accountType} onValueChange={(v) => setForm((p) => ({ ...p, accountType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input value={form.pixKey} onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Apelido</Label>
                <Input value={form.nickname} onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))} placeholder="Ex: Conta principal" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Conta Principal</Label>
              <Switch checked={form.isPrimary} onCheckedChange={(v) => setForm((p) => ({ ...p, isPrimary: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
