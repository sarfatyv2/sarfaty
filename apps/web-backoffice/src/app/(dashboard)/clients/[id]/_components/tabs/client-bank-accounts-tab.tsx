'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  Badge,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2, Landmark, Star } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { ClientBankAccount } from '@nexus/types';
import { StaggerChildren, StaggerItem } from '../motion-wrapper';

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
    return (
      <div className="space-y-3">
        {['sk-0', 'sk-1', 'sk-2'].map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Landmark size={15} className="text-primary" />
            Contas Bancárias
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground">({accounts.length})</span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={14} />
            Adicionar Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-12 text-center space-y-2">
            <Landmark size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhuma conta bancária cadastrada.</p>
            <p className="text-xs text-muted-foreground">Adicione uma conta para começar.</p>
          </div>
        ) : (
          <StaggerChildren className="divide-y rounded-xl border overflow-hidden" staggerDelay={0.04}>
            {accounts.map((a) => (
              <StaggerItem key={a.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Landmark size={13} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">
                          {a.bankName ?? a.bankCode ?? '—'}
                          {a.nickname && (
                            <span className="text-muted-foreground ml-1.5 text-xs font-normal">({a.nickname})</span>
                          )}
                        </p>
                        {a.isPrimary && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-transparent">
                            <Star size={8} className="mr-0.5" />
                            Principal
                          </Badge>
                        )}
                        {a.accountType && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {ACCOUNT_TYPE_OPTIONS.find((o) => o.value === a.accountType)?.label ?? a.accountType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {[
                          a.branch && `Ag. ${a.branch}`,
                          a.accountNumber && `CC ${a.accountNumber}`,
                          a.pixKey && `PIX: ${a.pixKey}`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                    >
                      {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
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
      </CardContent>
    </Card>
  );
}

