'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Skeleton } from '@nexus/ui';
import { MapPin, Phone, Mail, Users, Car, AlertTriangle, Eye, RefreshCw, Loader2, Building2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';
import { ExpandableHeader } from './client-credit-analysis-tab';

interface AllcheckAddress {
  street: string | null;
  number: string | null;
  complement: string | null;
  zipCode: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

interface AllcheckPhone {
  ddd: string | null;
  number: string | null;
  type: string | null;
  fullNumber: string | null;
}

interface AllcheckPartner {
  name: string;
  cpf: string | null;
  qualification: string | null;
  status: string | null;
  joinedAt: string | null;
}

interface AllcheckCompanyData {
  name: string | null;
  tradeName: string | null;
  openingDate: string | null;
  mainActivity: string | null;
  legalNature: string | null;
  registrationStatus: string | null;
  size: string | null;
  type: string | null;
}

interface AllcheckVehicle {
  plate: string | null;
  renavam: string | null;
  brand: string | null;
  fuel: string | null;
  year: number | null;
  chassis: string | null;
  status: string | null;
}

interface AllcheckConsultation {
  date: string | null;
  product: string | null;
  client: string | null;
  phone: string | null;
}

interface AllcheckData {
  id: string;
  document: string | null;
  name: string | null;
  emails: string[];
  currentAddress: AllcheckAddress | null;
  addressHistory: AllcheckAddress[];
  phones: AllcheckPhone[];
  partners: AllcheckPartner[];
  companyData: AllcheckCompanyData | null;
  isPep: boolean;
  vehicles: AllcheckVehicle[];
  ccfOccurrences: number;
  consultationNetwork: AllcheckConsultation[];
  queriedAt: string;
}

function formatCpf(cpf: string | null): string {
  if (!cpf) return '—';
  const digits = cpf.replaceAll(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replaceAll(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

function formatDocument(doc: string | null): string {
  if (!doc) return '—';
  const digits = doc.replaceAll(/\D/g, '');
  if (digits.length === 11) return formatCpf(doc);
  if (digits.length === 14) return formatCnpj(doc);
  return doc;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCep(cep: string | null): string {
  if (!cep) return '—';
  const digits = cep.replaceAll(/\D/g, '');
  if (digits.length !== 8) return cep;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function AddressDisplay({ address, label }: Readonly<{ address: AllcheckAddress; label?: string }>) {
  const line1 = [address.street, address.number].filter(Boolean).join(', ');
  const line2 = [address.complement, address.neighborhood].filter(Boolean).join(' — ');
  const line3 = [address.city, address.state].filter(Boolean).join('/');
  return (
    <div className="text-sm space-y-0.5">
      {label && <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>}
      {line1 && <p className="font-medium">{line1}</p>}
      {line2 && <p className="text-muted-foreground">{line2}</p>}
      <p className="text-muted-foreground">{line3} — CEP: {formatCep(address.zipCode)}</p>
    </div>
  );
}

function SectionTitle({ icon, title, count }: Readonly<{ icon: React.ReactNode; title: string; count?: number }>) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h4 className="text-sm font-semibold">{title}</h4>
      {count != null && count > 0 && (
        <Badge variant="outline" className="text-xs">{count}</Badge>
      )}
    </div>
  );
}

interface AllcheckSectionProps {
  entityId: string;
  entityType: 'client' | 'drawee';
}

export function AllcheckSection({ entityId, entityType }: Readonly<AllcheckSectionProps>) {
  const [data, setData] = useState<AllcheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addressHistoryOpen, setAddressHistoryOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);

  const basePath = entityType === 'client'
    ? `/clients/${entityId}/credit-analysis`
    : `/drawees/${entityId}/credit-analysis`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AllcheckData>(`${basePath}/allcheck`);
      setData(res.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post(`${basePath}/allcheck/sync`);
      toast.success('Consulta Allcheck realizada com sucesso.');
      await loadData();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao sincronizar Allcheck';
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }

  return (
    <Card className="overflow-hidden">
      <ExpandableHeader
        icon={<Search size={15} className="text-primary" />}
        title="Allcheck"
        subtitle="Localizador"
        badge={
          data?.isPep
            ? <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold px-2.5 py-0.5">PEP</Badge>
            : data
              ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5">Consultado</Badge>
              : undefined
        }
        isOpen={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      <ExpandableContent isOpen={expanded}>
        <div className="px-8 pb-8 space-y-6">
          {/* Sync button */}
          <div className="flex items-center justify-between">
            <div>
              {data && (
                <p className="text-xs text-muted-foreground">
                  Última consulta: {formatDate(data.queriedAt)}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              {syncing ? 'Sincronizando...' : 'Consultar Allcheck'}
            </Button>
          </div>

          {!data && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma consulta Allcheck realizada ainda.
            </p>
          )}

          {data && (
            <>
              {/* Company data */}
              {data.companyData && (
                <div>
                  <SectionTitle icon={<Building2 size={14} className="text-muted-foreground" />} title="Dados da Empresa" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Razão Social" value={data.companyData.name} />
                    <Field label="Nome Fantasia" value={data.companyData.tradeName} />
                    <Field label="Atividade Principal" value={data.companyData.mainActivity} />
                    <Field label="Natureza Jurídica" value={data.companyData.legalNature} />
                    <Field label="Situação Cadastral" value={data.companyData.registrationStatus} />
                    <Field label="Porte" value={data.companyData.size} />
                    <Field label="Tipo" value={data.companyData.type} />
                    <Field label="Data de Abertura" value={data.companyData.openingDate ? formatDate(data.companyData.openingDate) : '—'} />
                  </div>
                </div>
              )}

              {/* Flags */}
              <div className="flex flex-wrap gap-2">
                {data.isPep && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold px-2.5 py-0.5">
                    <AlertTriangle size={12} className="mr-1" /> Pessoa Politicamente Exposta (PEP)
                  </Badge>
                )}
                {data.ccfOccurrences > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold px-2.5 py-0.5">
                    <AlertTriangle size={12} className="mr-1" /> CCF: {data.ccfOccurrences} ocorrência(s)
                  </Badge>
                )}
                {data.ccfOccurrences === 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5">
                    CCF: Nada consta
                  </Badge>
                )}
              </div>

              {/* Current address */}
              {data.currentAddress && (
                <div>
                  <SectionTitle icon={<MapPin size={14} className="text-muted-foreground" />} title="Endereço Atual" />
                  <AddressDisplay address={data.currentAddress} />
                </div>
              )}

              {/* Address history */}
              {data.addressHistory.length > 0 && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-2 mb-2 text-sm font-semibold hover:text-primary transition-colors"
                    onClick={() => setAddressHistoryOpen((v) => !v)}
                  >
                    <MapPin size={14} className="text-muted-foreground" />
                    Histórico de Endereços
                    <Badge variant="outline" className="text-xs">{data.addressHistory.length}</Badge>
                  </button>
                  {addressHistoryOpen && (
                    <div className="space-y-3 pl-5 border-l-2 border-muted">
                      {data.addressHistory.map((addr, i) => (
                        <AddressDisplay key={`addr-${i}`} address={addr} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Phones */}
              {data.phones.length > 0 && (
                <div>
                  <SectionTitle icon={<Phone size={14} className="text-muted-foreground" />} title="Telefones" count={data.phones.length} />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {data.phones.map((phone, i) => (
                      <div key={`phone-${i}`} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-[10px] min-w-[36px] justify-center">
                          {phone.type === 'FIXO' ? 'FIXO' : 'CEL'}
                        </Badge>
                        <span>{phone.fullNumber ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails */}
              {data.emails.length > 0 && (
                <div>
                  <SectionTitle icon={<Mail size={14} className="text-muted-foreground" />} title="E-mails" count={data.emails.length} />
                  <div className="space-y-1">
                    {data.emails.map((email, i) => (
                      <p key={`email-${i}`} className="text-sm font-mono lowercase">{email}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Partners */}
              {data.partners.length > 0 && (
                <div>
                  <SectionTitle icon={<Users size={14} className="text-muted-foreground" />} title="Sócios" count={data.partners.length} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">Nome</th>
                          <th className="pb-2 pr-4 font-medium">CPF</th>
                          <th className="pb-2 pr-4 font-medium">Qualificação</th>
                          <th className="pb-2 pr-4 font-medium">Status</th>
                          <th className="pb-2 font-medium">Ingresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.partners.map((p, i) => (
                          <tr key={`partner-${i}`} className="border-b border-muted/50 last:border-0">
                            <td className="py-2 pr-4 font-medium">{p.name}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{formatCpf(p.cpf)}</td>
                            <td className="py-2 pr-4">{p.qualification ?? '—'}</td>
                            <td className="py-2 pr-4">
                              {p.status === 'ATIVO'
                                ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Ativo</Badge>
                                : <Badge variant="outline" className="text-[10px]">{p.status ?? '—'}</Badge>
                              }
                            </td>
                            <td className="py-2">{p.joinedAt ? formatDate(p.joinedAt) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {data.vehicles.length > 0 && (
                <div>
                  <SectionTitle icon={<Car size={14} className="text-muted-foreground" />} title="Veículos" count={data.vehicles.length} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">Placa</th>
                          <th className="pb-2 pr-4 font-medium">Marca/Modelo</th>
                          <th className="pb-2 pr-4 font-medium">Ano</th>
                          <th className="pb-2 pr-4 font-medium">Chassi</th>
                          <th className="pb-2 font-medium">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.vehicles.map((v, i) => (
                          <tr key={`vehicle-${i}`} className="border-b border-muted/50 last:border-0">
                            <td className="py-2 pr-4 font-mono font-medium">{v.plate ?? '—'}</td>
                            <td className="py-2 pr-4">{v.brand ?? '—'}</td>
                            <td className="py-2 pr-4">{v.year ?? '—'}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{v.chassis ?? '—'}</td>
                            <td className="py-2">
                              <Badge variant="outline" className="text-[10px]">{v.status ?? '—'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Consultation network */}
              {data.consultationNetwork.length > 0 && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-2 mb-2 text-sm font-semibold hover:text-primary transition-colors"
                    onClick={() => setNetworkOpen((v) => !v)}
                  >
                    <Eye size={14} className="text-muted-foreground" />
                    Rede Vigiada
                    <Badge variant="outline" className="text-xs">{data.consultationNetwork.length}</Badge>
                  </button>
                  {networkOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-xs text-muted-foreground">
                            <th className="pb-2 pr-4 font-medium">Data</th>
                            <th className="pb-2 pr-4 font-medium">Produto</th>
                            <th className="pb-2 pr-4 font-medium">Empresa</th>
                            <th className="pb-2 font-medium">Telefone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.consultationNetwork.map((c, i) => (
                            <tr key={`consult-${i}`} className="border-b border-muted/50 last:border-0">
                              <td className="py-2 pr-4">{c.date ?? '—'}</td>
                              <td className="py-2 pr-4">{c.product ?? '—'}</td>
                              <td className="py-2 pr-4">{c.client ?? '—'}</td>
                              <td className="py-2">{c.phone ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ExpandableContent>
    </Card>
  );
}

function Field({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium leading-none">{value ?? '—'}</p>
    </div>
  );
}
