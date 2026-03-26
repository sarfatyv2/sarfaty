'use client';

import { useState } from 'react';
import { Card } from '@nexus/ui';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import type { UpminerEmpresaPjData } from './upminer.types';
import { formatCnpj } from './upminer.utils';
import { InfoField, CardHeaderSmall, SectionTab } from './upminer.ui';

type EmpresaPjTab = 'info' | 'enderecos' | 'telefones' | 'emails' | 'socios' | 'atividades' | 'simples';

export function EmpresaPjCard({ empresa }: Readonly<{ empresa: UpminerEmpresaPjData }>) {
  const [tab, setTab] = useState<EmpresaPjTab>('info');

  const tabs: { id: EmpresaPjTab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'enderecos', label: `Endereços (${empresa.enderecos.length})` },
    { id: 'telefones', label: `Telefones (${empresa.telefones.length})` },
    { id: 'emails', label: `Emails (${empresa.emails.length})` },
    { id: 'socios', label: `Sócios (${empresa.socios.length})` },
    { id: 'atividades', label: `Atividades (${empresa.atividadesSecundarias.length})` },
    { id: 'simples', label: 'Simples' },
  ];

  return (
    <Card>
      <CardHeaderSmall icon={<Building2 className="h-4 w-4" />} title="Empresa PJ Enriquecida" />
      <div className="px-4 pt-3 pb-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <SectionTab key={t.id} active={tab === t.id} label={t.label} onClick={() => setTab(t.id)} />
          ))}
        </div>

        {tab === 'info' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoField label="CNPJ" value={formatCnpj(empresa.cnpj)} />
            <InfoField label="Razão Social" value={empresa.razaoSocial} />
            <InfoField label="Nome Fantasia" value={empresa.nomeFantasia} />
            <InfoField label="Matriz" value={empresa.matriz} />
            <InfoField label="Abertura" value={empresa.dataAbertura} />
            <InfoField label="Situação" value={empresa.situacaoCadastral} />
            <InfoField label="Data Situação" value={empresa.dataSituacao} />
            <InfoField label="Natureza Jurídica" value={empresa.naturezaJuridicaDescricao} />
            <InfoField label="CNAE" value={empresa.cnaeDescricao} />
            <InfoField label="Capital Social" value={empresa.capitalSocial ? `R$ ${empresa.capitalSocial}` : null} />
            <InfoField label="Porte" value={empresa.porte} />
            <InfoField label="Tipo" value={empresa.tipo} />
            <InfoField label="Tipo Estabelecimento" value={empresa.tipoEstabelecimento} />
            <InfoField label="Faixa de Funcionários" value={empresa.faixaFuncionarios} />
            <InfoField label="Faturamento Anual Est." value={empresa.faturamentoAnualEstimado} />
            <InfoField label="Setor" value={empresa.setor} />
            <InfoField label="Optante Simples" value={empresa.optanteSimples} />
            <InfoField label="Motivo Situação" value={empresa.motivoSituacao} />
            <InfoField label="Data Consulta" value={empresa.dataConsulta} />
          </div>
        )}

        {tab === 'enderecos' && (
          empresa.enderecos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum endereço.</p>
          ) : (
            <div className="space-y-3">
              {empresa.enderecos.map((e) => (
                <div
                  key={`${e.cep ?? 'no-cep'}-${e.logradouro ?? 'no-log'}-${e.logradouroNumero ?? 'no-num'}`}
                  className="rounded-md border border-muted/60 p-3 text-sm space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {[e.logradouroTipo, e.logradouro, e.logradouroNumero].filter(Boolean).join(' ') || '—'}
                    {e.logradouroComplemento && (
                      <span className="text-muted-foreground">— {e.logradouroComplemento}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {[e.bairro, e.cidade, e.uf].filter(Boolean).join(', ')} {e.cep ? `— CEP ${e.cep}` : ''}
                  </p>
                  {e.latitude && e.longitude && (
                    <p className="text-xs text-muted-foreground">{e.latitude}, {e.longitude}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'telefones' && (
          empresa.telefones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum telefone.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3">Número</th>
                    <th className="pb-2 pr-3">DDD</th>
                    <th className="pb-2 pr-3">Tipo</th>
                    <th className="pb-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.telefones.map((t) => (
                    <tr key={t.telefoneComDdd ?? t.telefone ?? t.ddd ?? 'phone'} className="border-b border-muted/40 last:border-0">
                      <td className="py-1.5 pr-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {t.telefoneComDdd || t.telefone || '—'}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3">{t.ddd || '—'}</td>
                      <td className="py-1.5 pr-3">{t.descricao || '—'}</td>
                      <td className="py-1.5 text-xs text-muted-foreground">{t.dataLog || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'emails' && (
          empresa.emails.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum email.</p>
          ) : (
            <ul className="space-y-1.5">
              {empresa.emails.map((e) => (
                <li key={e.enderecoEmail ?? 'no-email'} className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {e.enderecoEmail || '—'}
                </li>
              ))}
            </ul>
          )
        )}

        {tab === 'socios' && (
          empresa.socios.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum sócio.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3">Nome</th>
                    <th className="pb-2 pr-3">Documento</th>
                    <th className="pb-2 pr-3">Qualificação</th>
                    <th className="pb-2 pr-3">%</th>
                    <th className="pb-2">Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.socios.map((s, i) => (
                    <tr key={`soc-${s.documentoSocio || i}`} className="border-b border-muted/40 last:border-0">
                      <td className="py-1.5 pr-3 font-medium">{s.nome || '—'}</td>
                      <td className="py-1.5 pr-3 font-mono text-xs">{s.documentoSocio || '—'}</td>
                      <td className="py-1.5 pr-3">{s.qualificacao || '—'}</td>
                      <td className="py-1.5 pr-3">{s.participacao || '—'}</td>
                      <td className="py-1.5 text-xs">{s.dataEntrada || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'atividades' && (
          empresa.atividadesSecundarias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade secundária.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3">Código</th>
                    <th className="pb-2">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.atividadesSecundarias.map((a, i) => (
                    <tr key={`ativ-${a.codigo ?? i}`} className="border-b border-muted/40 last:border-0">
                      <td className="py-1.5 pr-3 font-mono text-xs">{a.codigo || '—'}</td>
                      <td className="py-1.5">{a.descricao || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'simples' && (
          empresa.simplesNacional.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado do Simples Nacional.</p>
          ) : (
            <div className="space-y-3">
              {empresa.simplesNacional.map((s) => (
                <div
                  key={`${s.cnpj ?? 'no-cnpj'}-${s.dataConsulta ?? 'no-dt'}`}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-md border border-muted/60 p-3"
                >
                  <InfoField label="Status Simples" value={s.statusSimplesNacional} />
                  <InfoField label="Status SIMEI" value={s.statusSimei} />
                  <InfoField label="Data Simples" value={s.dataSimplesNacional} />
                  <InfoField label="Data SIMEI" value={s.dataSimei} />
                  <InfoField label="Data Consulta" value={s.dataConsulta} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Card>
  );
}
