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
import { Building2, Shield } from 'lucide-react';
import type { Drawee } from '@nexus/types';
import { FadeIn, AnimatedTabContent } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';
import { DraweeStatusBadge } from '../../_components/drawee-status-badge';
import { DraweePartnerSection } from './drawee-partner-section';
import { DraweeContactsTab } from './tabs/drawee-contacts-tab';
import { DraweeAddressesTab } from './tabs/drawee-addresses-tab';
import { DraweeBankAccountsTab } from './tabs/drawee-bank-accounts-tab';
import { DraweeClientsTab } from './tabs/drawee-clients-tab';
import { DraweeCreditAnalysisTab } from './tabs/drawee-credit-analysis-tab';

type DraweeDetailProps = Readonly<{
  drawee: Drawee;
}>;

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

function InfoField({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <p className="text-sm font-medium leading-snug">{value || '—'}</p>
    </div>
  );
}

export function DraweeDetail({ drawee }: DraweeDetailProps) {
  const [activeTab, setActiveTab] = useState('dados');

  return (
    <div className="space-y-8">
      <FadeIn yOffset={6}>
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-normal tracking-tight leading-tight">
              {drawee.companyName}
            </h1>
            {drawee.tradeName && (
              <p className="text-sm text-muted-foreground mt-0.5">{drawee.tradeName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 rounded-md px-2 py-0.5">
              {formatDocument(drawee)}
            </span>
            {drawee.isPep && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                PEP
              </Badge>
            )}
            {drawee.isOfacListed && (
              <Badge variant="destructive">OFAC</Badge>
            )}
            <DraweeStatusBadge status={drawee.status} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} yOffset={4}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1 rounded-lg h-auto flex-wrap gap-0.5">
            <TabsTrigger value="dados" className="rounded-md text-xs">
              Dados
            </TabsTrigger>
            <TabsTrigger value="clientes" className="rounded-md text-xs">
              Clientes
            </TabsTrigger>
            <TabsTrigger value="bureau" className="rounded-md text-xs">
              Bureau
            </TabsTrigger>
            <TabsTrigger value="contas" className="rounded-md text-xs">
              Contas Bancárias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-5">
            <AnimatedTabContent key="dados">
              <div className="space-y-6">
                <DraweePartnerSection draweeId={drawee.id} personType={drawee.personType} foundedAt={drawee.foundedAt ?? null} />

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 size={15} className="text-primary" />
                      Informações da Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <InfoField label="Documento" value={formatDocument(drawee)} />
                      <InfoField label="Razão Social / Nome" value={drawee.companyName} />
                      {drawee.legalName && (
                        <InfoField label="Nome Legal" value={drawee.legalName} />
                      )}
                      {drawee.tradeName && (
                        <InfoField label="Nome Fantasia" value={drawee.tradeName} />
                      )}
                      <InfoField
                        label="Tipo de Pessoa"
                        value={drawee.personType === 'company' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      />
                      <InfoField label="Status" value={drawee.status} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield size={15} className="text-primary" />
                      Compliance / Risco
                    </CardTitle>
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
                  <Card className="overflow-hidden border-destructive/30">
                    <CardHeader className="pb-4 bg-gradient-to-r from-destructive/5 to-transparent">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <Shield size={15} />
                        Bloqueio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InfoField label="Motivo do Bloqueio" value={drawee.blockReason} />
                    </CardContent>
                  </Card>
                )}

                <DraweeContactsTab draweeId={drawee.id} />

                <DraweeAddressesTab draweeId={drawee.id} />
              </div>
            </AnimatedTabContent>
          </TabsContent>

          <TabsContent value="clientes" className="mt-5">
            <AnimatedTabContent key="clientes">
              <DraweeClientsTab draweeId={drawee.id} />
            </AnimatedTabContent>
          </TabsContent>

          <TabsContent value="bureau" className="mt-5">
            <AnimatedTabContent key="bureau">
              <DraweeCreditAnalysisTab draweeId={drawee.id} />
            </AnimatedTabContent>
          </TabsContent>

          <TabsContent value="contas" className="mt-5">
            <AnimatedTabContent key="contas">
              <DraweeBankAccountsTab draweeId={drawee.id} />
            </AnimatedTabContent>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
