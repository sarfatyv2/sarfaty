'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nexus/ui';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

interface DraweeClientItem {
  clientId: string;
  companyName: string;
  cnpj: string | null;
  totalTitles: number;
  totalExposure: string;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
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

function formatCurrency(value: string): string {
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

export function DraweeClientsTab({ draweeId }: DraweeClientsTabProps) {
  const [clients, setClients] = useState<DraweeClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  <th className="text-left py-2 font-medium">Cliente</th>
                  <th className="text-left py-2 font-medium">CNPJ</th>
                  <th className="text-right py-2 font-medium">Títulos</th>
                  <th className="text-right py-2 font-medium">Exposição</th>
                  <th className="text-left py-2 font-medium">Primeira op.</th>
                  <th className="text-left py-2 font-medium">Última op.</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.clientId} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        href={`/clients/${c.clientId}`}
                        className="text-primary hover:underline font-medium"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
