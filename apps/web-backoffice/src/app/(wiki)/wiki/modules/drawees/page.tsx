'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Building2 } from 'lucide-react';

export default function DraweesModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Building2}
        name="Módulo de Sacados"
        domain="Módulo"
        description="Gestão dos devedores (sacados) PJ/PF, vínculos com clientes (via client_drawees), grupos econômicos, autorizados e camadas de compliance (PEP, sanções, PGFN etc.) com resultados persistidos para auditoria."
        color="sky"
        gradient="bg-gradient-to-br from-[hsl(200,55%,18%)] to-[hsl(200,45%,26%)]"
        roles={['backoffice', 'credit_analyst', 'risk_manager', 'sales_manager', 'sales_director', 'admin']}
        flowSteps={[
          { label: 'Cadastro', desc: 'Sacado criado com CNPJ/CPF, tipo (PJ/PF), nome e status inicial.' },
          { label: 'Grupo Econômico', desc: 'Sacado vinculado opcionalmente a um grupo econômico para análise consolidada de exposição.' },
          { label: 'Documentação', desc: 'Documentos obrigatórios inseridos e validados pela equipe de backoffice.' },
          { label: 'Produtos', desc: 'Produtos de crédito habilitados para o sacado (ex: desconto de recebíveis, fiança).' },
          { label: 'Ativo', desc: 'Sacado ativo e disponível para uso nas operações de crédito.' },
        ]}
        features={[
          'Cadastro de sacados PJ e PF (data de fundação e dados cadastrais quando aplicável)',
          'Múltiplos contatos, endereços e contas bancárias',
          'Pessoas autorizadas / relacionadas (drawee_authorized_persons)',
          'Documentação e checks de compliance com tabelas dedicadas por tipo de risco',
          'Consultas de bureau para sacado (Vadu drawee, Serasa drawee, CERC, etc.)',
          'Vinculação a grupos econômicos e produtos habilitados',
          'Exposição consolidada via client_drawees no módulo comercial',
        ]}
        tables={[
          { name: 'drawees', description: 'Tabela principal de sacados PJ/PF.', keyColumns: ['id', 'cnpj', 'name', 'status', 'person_type'] },
          { name: 'drawee_contacts', description: 'Contatos vinculados ao sacado.', keyColumns: ['drawee_id', 'name', 'role', 'email', 'phone'] },
          { name: 'drawee_addresses', description: 'Endereços do sacado.', keyColumns: ['drawee_id', 'type', 'cep', 'street'] },
          { name: 'drawee_bank_accounts', description: 'Contas bancárias do sacado.', keyColumns: ['drawee_id', 'bank', 'agency', 'account'] },
          { name: 'drawee_documents', description: 'Documentos de compliance do sacado.', keyColumns: ['drawee_id', 'document_key', 'status', 'file_url'] },
          { name: 'drawee_groups', description: 'Vínculo do sacado com grupos econômicos.', keyColumns: ['drawee_id', 'group_id', 'role'] },
          { name: 'drawee_enabled_products', description: 'Produtos de crédito habilitados por sacado.', keyColumns: ['drawee_id', 'product_id', 'enabled_at', 'limit'] },
          { name: 'economic_groups', description: 'Grupos econômicos para análise consolidada.', keyColumns: ['id', 'name', 'type', 'status'] },
          { name: 'drawee_authorized_persons', description: 'Autorizados e sócios relacionados ao sacado (enriquecimento manual ou bureau).', keyColumns: ['drawee_id', 'full_name', 'cpf', 'source', 'role'] },
          { name: 'pep_drawee_check_results', description: 'Resultados de checagem PEP para sacado.', keyColumns: ['drawee_id', 'cpf', 'has_match', 'queried_at'] },
          { name: 'sanctions_drawee_check_results', description: 'Checagens de sanções (lista restritiva) para sacado.', keyColumns: ['drawee_id', 'source', 'queried_at'] },
          { name: 'pgfn_drawee_check_results', description: 'Consultas PGFN / dívidas públicas relacionadas ao sacado.', keyColumns: ['drawee_id', 'cnpj', 'raw_data', 'queried_at'] },
        ]}
      />
    </PageWrapper>
  );
}
