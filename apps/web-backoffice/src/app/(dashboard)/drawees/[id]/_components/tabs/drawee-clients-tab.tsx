'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nexus/ui';
import { Users, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { ReceivableStatusBadge } from '@/app/(dashboard)/cnab/receivables/_components/receivable-status-badge';

interface DraweeClientItem {
  clientId: string;
  companyName: string;
  cnpj: string | null;
  totalTitles: number;
  totalExposure: string;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
}

interface ReceivableItem {
  id: string;
  documentNumber: string | null;
  dueDate: string | null;
  faceValue: string | null;
  status: string;
}

interface DraweeClientsTabProps {
  draweeId: string;
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const d = cnpj.replaceAll(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatCurrency(value: string | null): string {
  if (!value || value === '0') return 'R$ 0,00';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function DraweeClientsTab({ draweeId }: Readonly<DraweeClientsTabProps>) {
  const [clients, setClients] = useState<DraweeClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [receivablesByClient, setReceivablesByClient] = useState<Record<string, ReceivableItem[]>>({});
  const [loadingReceivables, setLoadingReceivables] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback(async (clientId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });

    if (!receivablesByClient[clientId]) {
      setLoadingReceivables((prev) => new Set(prev).add(clientId));
      try {
        const res = await api.get<ReceivableItem[]>('/cnab/receivables', {
          clientId,
          draweeId,
          pageSize: 100,
        });
        const list = Array.isArray(res.data) ? res.data : [];
        setReceivablesByClient((prev) => ({ ...prev, [clientId]: list }));
      } catch {
        setReceivablesByClient((prev) => ({ ...prev, [clientId]: [] }));
      } finally {
        setLoadingReceivables((prev) => {
          const next = new Set(prev);
          next.delete(clientId);
          return next;
        });
      }
    }
  }, [draweeId, receivablesByClient]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<DraweeClientItem[]>(`/drawees/${draweeId}/clients`);
        if (!cancelled) setClients(res.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar clientes');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [draweeId]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={15} className="text-primary" />
            Clientes Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={15} className="text-primary" />
            Clientes Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users size={15} className="text-primary" />
          Clientes Vinculados
          <span className="text-sm font-normal text-muted-foreground">
            ({clients.length} {clients.length === 1 ? 'cliente' : 'clientes'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-12 text-center space-y-2">
            <Users size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum cliente vinculado.</p>
            <p className="text-xs text-muted-foreground">
              Os clientes que operam com este sacado aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-10 px-2 py-2" />
                  <th className="text-left py-2 font-medium">Cliente</th>
                  <th className="text-left py-2 font-medium">CNPJ</th>
                  <th className="text-right py-2 font-medium">Títulos</th>
                  <th className="text-right py-2 font-medium">Exposição</th>
                  <th className="text-left py-2 font-medium">Primeira op.</th>
                  <th className="text-left py-2 font-medium">Última op.</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const isExpanded = expanded.has(c.clientId);
                  const receivables = receivablesByClient[c.clientId] ?? [];
                  const isLoadingReceivables = loadingReceivables.has(c.clientId);
                  return (
                    <Fragment key={c.clientId}>
                      <tr
                        className="border-b last:border-0 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleExpand(c.clientId)}
                      >
                        <td className="w-10 px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.clientId)}
                            className="p-0 bg-transparent border-0 cursor-pointer"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight size={16} className="text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/clients/${c.clientId}`}
                            className="text-primary hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.companyName}
                          </Link>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatCnpj(c.cnpj)}</td>
                        <td className="py-3 text-right">{c.totalTitles}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(c.totalExposure)}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(c.firstOperationAt)}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(c.lastOperationAt)}</td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${c.clientId}-detail`} className="border-b last:border-0 bg-muted/20">
                          <td colSpan={7} className="p-0">
                            <div className="px-4 pb-4 pt-1">
                              <div className="rounded-md border bg-background overflow-hidden">
                                {isLoadingReceivables && (
                                  <div className="p-6 flex items-center justify-center">
                                    <Skeleton className="h-8 w-48" />
                                  </div>
                                )}
                                {!isLoadingReceivables && receivables.length === 0 && (
                                  <div className="p-6 text-center text-sm text-muted-foreground">
                                    Nenhuma duplicata encontrada.
                                  </div>
                                )}
                                {!isLoadingReceivables && receivables.length > 0 && (
                                  <>
                                    <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Duplicatas
                                      </span>
                                      <Link
                                        href={`/cnab/receivables?clientId=${c.clientId}&draweeId=${draweeId}`}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Ver todas
                                        <ExternalLink size={12} />
                                      </Link>
                                    </div>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="text-left py-2 px-4 font-medium">Documento</th>
                                          <th className="text-left py-2 px-4 font-medium">Vencimento</th>
                                          <th className="text-right py-2 px-4 font-medium">Valor</th>
                                          <th className="text-left py-2 px-4 font-medium">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {receivables.map((r) => (
                                          <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="py-2 px-4">
                                              <Link
                                                href={`/cnab/receivables?clientId=${c.clientId}&draweeId=${draweeId}`}
                                                className="text-primary hover:underline font-medium"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                {r.documentNumber || '—'}
                                              </Link>
                                            </td>
                                            <td className="py-2 px-4 text-muted-foreground">
                                              {formatDate(r.dueDate)}
                                            </td>
                                            <td className="py-2 px-4 text-right font-medium">
                                              {formatCurrency(r.faceValue)}
                                            </td>
                                            <td className="py-2 px-4">
                                              <ReceivableStatusBadge status={r.status} />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
