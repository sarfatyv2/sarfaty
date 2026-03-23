'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Skeleton,
} from '@nexus/ui';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatCNPJ } from '@nexus/utils';
import { api } from '@/lib/api';
import { MaskedInput, CNPJ_MASK } from '@/components/masked-input';

interface BillingCompanyRow {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  isActive: boolean;
}

function digitsOnly(value: string): string {
  return value.replaceAll(/\D/g, '');
}

export default function BillingCompaniesPage() {
  const [rows, setRows] = useState<BillingCompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTradeName, setFormTradeName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<BillingCompanyRow[]>('/people/billing-companies', {
        ...(includeInactive ? { includeInactive: true } : {}),
      });
      setRows(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar empresas');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setFormName('');
    setFormTradeName('');
    setFormCnpj('');
    setFormActive(true);
    setDialogOpen(true);
  }

  function openEdit(row: BillingCompanyRow) {
    setEditingId(row.id);
    setFormName(row.name);
    setFormTradeName(row.tradeName ?? '');
    setFormCnpj(row.cnpj.length === 14 ? formatCNPJ(row.cnpj) : row.cnpj);
    setFormActive(row.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    const cnpjDigits = digitsOnly(formCnpj);
    if (cnpjDigits.length !== 14) {
      toast.error('CNPJ inválido');
      return;
    }
    if (!formName.trim()) {
      toast.error('Informe a razão social');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/people/billing-companies/${editingId}`, {
          name: formName.trim(),
          tradeName: formTradeName.trim() || null,
          cnpj: cnpjDigits,
          isActive: formActive,
        });
        toast.success('Empresa atualizada');
      } else {
        await api.post('/people/billing-companies', {
          name: formName.trim(),
          tradeName: formTradeName.trim() || null,
          cnpj: cnpjDigits,
          isActive: formActive,
        });
        toast.success('Empresa criada');
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/people/dp/invoices">
              <ArrowLeft size={16} className="mr-2" />
              Voltar às NFs
            </Link>
          </Button>
          <h1 className="text-3xl font-normal">Empresas faturadoras</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro das empresas do grupo para as quais colaboradores PJ emitem nota fiscal.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={includeInactive}
              onCheckedChange={(v) => setIncludeInactive(v)}
            />
            Mostrar inativas
          </label>
          <Button type="button" onClick={openCreate}>
            <Plus size={16} className="mr-2" />
            Nova empresa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão social</TableHead>
                  <TableHead>Nome fantasia</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.tradeName ?? '—'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {r.cnpj.length === 14 ? formatCNPJ(r.cnpj) : r.cnpj}
                    </TableCell>
                    <TableCell>
                      {r.isActive ? (
                        <Badge>Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(r)}
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar empresa faturadora' : 'Nova empresa faturadora'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bc-name">Razão social</Label>
              <Input
                id="bc-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-trade">Nome fantasia (opcional)</Label>
              <Input
                id="bc-trade"
                value={formTradeName}
                onChange={(e) => setFormTradeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-cnpj">CNPJ</Label>
              <MaskedInput
                id="bc-cnpj"
                mask={CNPJ_MASK}
                value={formCnpj}
                onAccept={(value) => setFormCnpj(value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="bc-active"
                checked={formActive}
                onCheckedChange={(v) => setFormActive(v)}
              />
              <Label htmlFor="bc-active">Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
