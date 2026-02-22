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
        description="Gestão completa dos devedores (sacados) PJ e PF que compõem as carteiras de crédito. Cada sacado pode pertencer a um ou mais grupos econômicos e ter produtos de crédito específicos habilitados."
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
          'Cadastro de sacados PJ e PF',
          'Múltiplos contatos por sacado (comercial, financeiro, jurídico)',
          'Múltiplos endereços (sede, filiais, entrega)',
          'Contas bancárias para liquidação',
          'Documentação com checklist de compliance',
          'Vinculação a grupos econômicos',
          'Configuração de produtos de crédito habilitados por sacado',
          'Visão consolidada de exposição por grupo econômico',
        ]}
        tables={[
          { name: 'drawees', description: 'Tabela principal de sacados PJ/PF.', keyColumns: ['id', 'cnpj', 'name', 'status', 'person_type'] },
          { name: 'drawee_contacts', description: 'Contatos vinculados ao sacado.', keyColumns: ['drawee_id', 'name', 'role', 'email', 'phone'] },
          { name: 'drawee_addresses', description: 'Endereços do sacado.', keyColumns: ['drawee_id', 'type', 'cep', 'street'] },
          { name: 'drawee_bank_accounts', description: 'Contas bancárias do sacado.', keyColumns: ['drawee_id', 'bank', 'agency', 'account'] },
          { name: 'drawee_documents', description: 'Documentos de compliance do sacado.', keyColumns: ['drawee_id', 'document_key', 'status', 'file_url'] },
          { name: 'drawee_groups', description: 'Vínculo do sacado com grupos econômicos.', keyColumns: ['drawee_id', 'group_id', 'role'] },
          { name: 'drawee_enabled_products', description: 'Produtos de crédito habilitados por sacado.', keyColumns: ['drawee_id', 'product_id', 'enabled_at', 'limit'] },
          { name: 'economic_groups', description: 'Grupos econômicos para análise consolidada.', keyColumns: ['id', 'name', 'lead_drawee_id'] },
        ]}
      />
    </PageWrapper>
  );
}
