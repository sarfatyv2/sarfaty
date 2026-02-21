'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@nexus/ui';
import type { Drawee } from '@nexus/types';
import { DraweeStatusBadge } from '../../_components/drawee-status-badge';
import { DraweeContactsTab } from './tabs/drawee-contacts-tab';
import { DraweeAddressesTab } from './tabs/drawee-addresses-tab';
import { DraweeBankAccountsTab } from './tabs/drawee-bank-accounts-tab';

interface DraweeDetailProps {
  drawee: Drawee;
}

function formatDocument(drawee: Drawee): string {
  if (drawee.cnpj) {
    const d = drawee.cnpj.replaceAll(/\D/g, '');
    if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    return drawee.cnpj;
  }
  if (drawee.cpf) {
    const d = drawee.cpf.replaceAll(/\D/g, '');
    if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    return drawee.cpf;
  }
  return '—';
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  );
}

export function DraweeDetail({ drawee }: DraweeDetailProps) {
  const [activeTab, setActiveTab] = useState('dados');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{drawee.companyName}</h2>
          {drawee.tradeName && (
            <p className="text-sm text-muted-foreground">{drawee.tradeName}</p>
          )}
          <p className="text-sm text-muted-foreground">{formatDocument(drawee)}</p>
        </div>
        <div className="flex items-center gap-3">
          {drawee.isPep && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">PEP</Badge>
          )}
          {drawee.isOfacListed && (
            <Badge variant="destructive">OFAC</Badge>
          )}
          <DraweeStatusBadge status={drawee.status} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="enderecos">Endereços</TabsTrigger>
          <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <InfoField label="Documento" value={formatDocument(drawee)} />
                <InfoField label="Razão Social / Nome" value={drawee.companyName} />
                {drawee.legalName && <InfoField label="Nome Legal" value={drawee.legalName} />}
                {drawee.tradeName && <InfoField label="Nome Fantasia" value={drawee.tradeName} />}
                <InfoField
                  label="Tipo de Pessoa"
                  value={drawee.personType === 'company' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                />
                <InfoField label="Status" value={drawee.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance / Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <InfoField label="PEP" value={drawee.isPep ? 'Sim' : 'Não'} />
                <InfoField label="OFAC" value={drawee.isOfacListed ? 'Sim' : 'Não'} />
                <InfoField label="Rating de Risco" value={drawee.riskRating} />
                <InfoField
                  label="Score de Crédito"
                  value={drawee.creditScore === null ? null : String(drawee.creditScore)}
                />
              </div>
            </CardContent>
          </Card>

          {drawee.blockReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-destructive">Bloqueio</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoField label="Motivo do Bloqueio" value={drawee.blockReason} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contatos" className="mt-4">
          <DraweeContactsTab draweeId={drawee.id} />
        </TabsContent>

        <TabsContent value="enderecos" className="mt-4">
          <DraweeAddressesTab draweeId={drawee.id} />
        </TabsContent>

        <TabsContent value="contas" className="mt-4">
          <DraweeBankAccountsTab draweeId={drawee.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
