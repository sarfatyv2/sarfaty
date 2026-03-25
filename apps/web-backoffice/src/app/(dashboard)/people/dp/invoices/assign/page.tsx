'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  ScrollArea,
  Skeleton,
} from '@nexus/ui';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface BillingCompanyRow {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  isActive: boolean;
}

interface CollaboratorOption {
  id: string;
  fullName: string;
}

interface AssignmentGroup {
  localId: string;
  billingCompanyId: string;
  billingCompanyLabel: string;
  collaboratorIds: string[];
}

const MONTH_OPTIONS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function AssignPjInvoicesPage() {
  const [referenceMonth, setReferenceMonth] = useState<number>(new Date().getMonth() + 1);
  const [referenceYear, setReferenceYear] = useState<number>(CURRENT_YEAR);
  const [billingCompanies, setBillingCompanies] = useState<BillingCompanyRow[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [draftCompanyId, setDraftCompanyId] = useState<string>('');
  const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<AssignmentGroup[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const collaboratorNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of collaborators) {
      map.set(c.id, c.fullName);
    }
    return map;
  }, [collaborators]);

  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const PAGE_SIZE = 100;

      const bcRes = await api.get<BillingCompanyRow[]>('/people/billing-companies');
      setBillingCompanies(bcRes.data ?? []);

      const allCollaborators: Array<{ id: string; fullName: string }> = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await api.get<Array<{ id: string; fullName: string }>>(
          '/people/collaborators',
          { page, pageSize: PAGE_SIZE, employmentType: 'pj', isActive: true },
        );
        allCollaborators.push(...(res.data ?? []));
        totalPages = res.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);

      setCollaborators(allCollaborators.map((c) => ({ id: c.id, fullName: c.fullName })));
    } catch {
      toast.error('Erro ao carregar empresas e colaboradores');
      setBillingCompanies([]);
      setCollaborators([]);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  function toggleDraftCollaborator(id: string) {
    setDraftSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function addGroup() {
    if (!draftCompanyId) {
      toast.error('Selecione uma empresa faturadora');
      return;
    }
    if (draftSelected.size === 0) {
      toast.error('Selecione ao menos um colaborador');
      return;
    }
    const company = billingCompanies.find((b) => b.id === draftCompanyId);
    if (!company) {
      toast.error('Empresa inválida');
      return;
    }
    const label = company.tradeName?.trim() || company.name;
    const collaboratorIds = [...draftSelected];
    const alreadyInGroups = new Set(groups.flatMap((g) => g.collaboratorIds));
    const conflict = collaboratorIds.find((id) => alreadyInGroups.has(id));
    if (conflict) {
      toast.error(
        `Colaborador "${collaboratorNameById.get(conflict)}" já está em outro grupo`,
      );
      return;
    }
    setGroups((prev) => [
      ...prev,
      {
        localId: crypto.randomUUID(),
        billingCompanyId: company.id,
        billingCompanyLabel: label,
        collaboratorIds,
      },
    ]);
    setDraftSelected(new Set());
    setDraftCompanyId('');
  }

  function removeGroup(localId: string) {
    setGroups((prev) => prev.filter((g) => g.localId !== localId));
  }

  async function handleSubmit() {
    if (groups.length === 0) {
      toast.error('Adicione ao menos um grupo');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{
        assigned: number;
        emailsSent: number;
        emailsSkippedNoAddress: number;
      }>('/people/invoices/assign-companies', {
        referenceMonth,
        referenceYear,
        assignments: groups.map((g) => ({
          billingCompanyId: g.billingCompanyId,
          collaboratorIds: g.collaboratorIds,
        })),
      });
      const data = res.data;
      const assigned = data?.assigned ?? 0;
      const emailsSent = data?.emailsSent ?? 0;
      const skipped = data?.emailsSkippedNoAddress ?? 0;
      toast.success(
        `Atribuídas ${assigned} NF(s). E-mails enviados: ${emailsSent}` +
          (skipped > 0 ? `. Sem e-mail: ${skipped}` : ''),
      );
      setGroups([]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao atribuir';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMeta) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
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
          <h1 className="text-3xl font-normal">Atribuir NFs PJ por empresa</h1>
          <p className="text-sm text-muted-foreground">
            Defina o tomador da nota por colaborador e período; o sistema grava na NF e envia e-mail
            (SendGrid).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Período de referência</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Mês</span>
            <Select
              value={String(referenceMonth)}
              onValueChange={(v) => setReferenceMonth(Number(v))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Ano</span>
            <Select
              value={String(referenceYear)}
              onValueChange={(v) => setReferenceYear(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-md">
            <span className="text-sm font-medium">Empresa faturadora (tomador)</span>
            <Select value={draftCompanyId} onValueChange={setDraftCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {billingCompanies.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.tradeName?.trim() || b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Colaboradores PJ</span>
            <ScrollArea className="h-56 rounded-md border p-3">
              <div className="space-y-2 pr-3">
                {collaborators.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer text-sm py-1"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary"
                      checked={draftSelected.has(c.id)}
                      onChange={() => toggleDraftCollaborator(c.id)}
                    />
                    {c.fullName}
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Button type="button" variant="secondary" onClick={addGroup}>
            <Plus size={16} className="mr-2" />
            Adicionar grupo à lista
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo — enviar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum grupo adicionado.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Colaboradores</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g.localId}>
                      <TableCell className="font-medium">{g.billingCompanyLabel}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {g.collaboratorIds.map((id) => (
                            <Badge key={id} variant="secondary">
                              {collaboratorNameById.get(id) ?? id}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGroup(g.localId)}
                          aria-label="Remover grupo"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || groups.length === 0}
          >
            <Send size={16} className="mr-2" />
            {submitting ? 'Enviando…' : 'Gravar e enviar e-mails'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
