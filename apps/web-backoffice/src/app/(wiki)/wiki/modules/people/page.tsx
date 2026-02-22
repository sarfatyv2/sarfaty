'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Users } from 'lucide-react';

export default function PeopleModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Users}
        name="Módulo de Pessoas"
        domain="Módulo"
        description="RH + DP integrados na mesma plataforma. Gestão de colaboradores CLT e PJ, dependentes, documentação, histórico de remuneração, plano de saúde, reembolsos, notas fiscais PJ e avaliações de desempenho."
        color="rose"
        gradient="bg-gradient-to-br from-[hsl(350,50%,18%)] to-[hsl(350,40%,26%)]"
        roles={['employee', 'people_manager', 'hr', 'dp', 'hr_admin', 'admin']}
        flowSteps={[
          { label: 'Onboarding', desc: 'Colaborador cadastrado com perfil, tipo (CLT/PJ), dados específicos e tarefas de onboarding geradas automaticamente.' },
          { label: 'Documentação', desc: 'Documentos pessoais e trabalhistas inseridos e validados por RH/DP.' },
          { label: 'Self-service', desc: 'Colaborador pode atualizar perfil, abrir reembolsos, visualizar contra-cheque, solicitar férias.' },
          { label: 'NF PJ', desc: 'Colaboradores PJ submetem nota fiscal mensalmente. DP valida e aprova para pagamento.' },
          { label: 'Avaliação', desc: 'Ciclos periódicos de avaliação de desempenho criados por gestores e respondidos pelos colaboradores.' },
        ]}
        features={[
          'Suporte a CLT e PJ com dados específicos por tipo',
          'Histórico completo de remuneração e benefícios',
          'Dependentes com documentação para plano de saúde',
          'Fluxo de reembolsos: solicitação → aprovação → pagamento',
          'Notas fiscais PJ mensais com status de aprovação',
          'Tarefas de onboarding personalizadas por template',
          'Ciclos de avaliação de desempenho 360°',
          'Plano de saúde com histórico de entradas e saídas',
          'Self-service: colaborador acessa seus próprios dados',
          'Perfil vinculado opcionalmente a conta de acesso à plataforma',
        ]}
        tables={[
          { name: 'collaborators', description: 'Tabela principal de colaboradores com dados de RH.', keyColumns: ['id', 'profile_id', 'employment_type', 'department', 'manager_id'] },
          { name: 'collaborator_clt_data', description: 'Dados específicos de CLT (1:1 com collaborators).', keyColumns: ['collaborator_id', 'ctps', 'pis', 'base_salary', 'admission_date'] },
          { name: 'collaborator_pj_data', description: 'Dados específicos de PJ (1:1 com collaborators).', keyColumns: ['collaborator_id', 'cnpj', 'contract_value', 'payment_day'] },
          { name: 'collaborator_dependents', description: 'Dependentes para plano de saúde e IR.', keyColumns: ['collaborator_id', 'name', 'cpf', 'relationship', 'birth_date'] },
          { name: 'collaborator_documents', description: 'Documentos pessoais e trabalhistas.', keyColumns: ['collaborator_id', 'document_type', 'file_url', 'expires_at'] },
          { name: 'collaborator_compensation', description: 'Histórico de remuneração e alterações salariais.', keyColumns: ['collaborator_id', 'amount', 'effective_date', 'reason'] },
          { name: 'reimbursements', description: 'Solicitações de reembolso de despesas.', keyColumns: ['id', 'collaborator_id', 'amount', 'category', 'status'] },
          { name: 'pj_invoices', description: 'Notas fiscais mensais de colaboradores PJ.', keyColumns: ['id', 'collaborator_id', 'month', 'amount', 'nfe_url', 'status'] },
          { name: 'medical_plan_entries', description: 'Entradas/saídas no plano de saúde.', keyColumns: ['id', 'collaborator_id', 'action', 'effective_date'] },
          { name: 'onboarding_templates', description: 'Templates de tarefas de onboarding por tipo de vaga.', keyColumns: ['id', 'name', 'role_type', 'tasks_json'] },
          { name: 'onboarding_tasks', description: 'Tarefas de onboarding por colaborador.', keyColumns: ['id', 'collaborator_id', 'title', 'completed_at'] },
          { name: 'performance_review_cycles', description: 'Ciclos de avaliação com período e participantes.', keyColumns: ['id', 'title', 'start_date', 'end_date', 'status'] },
          { name: 'performance_reviews', description: 'Avaliações individuais dentro de um ciclo.', keyColumns: ['cycle_id', 'reviewer_id', 'reviewee_id', 'score', 'submitted_at'] },
        ]}
      />
    </PageWrapper>
  );
}
