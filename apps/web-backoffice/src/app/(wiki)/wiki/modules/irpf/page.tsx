'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { FileSearch } from 'lucide-react';

export default function IrpfModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={FileSearch}
        name="Agente IA — IRPF dos Sócios"
        domain="Módulo · Inteligência Artificial"
        description="Pipeline de extração automatizada de dados das declarações de Imposto de Renda dos sócios. Utiliza Google Gemini para ler PDFs, classificar o tipo de documento, extrair dados estruturados e unificá-los em um registro canônico único por CPF e ano de exercício."
        color="amber"
        gradient="bg-gradient-to-br from-[hsl(38,65%,15%)] to-[hsl(28,55%,28%)]"
        roles={[
          'credit_analyst',
          'compliance_officer',
          'approver',
          'backoffice',
          'risk_manager',
          'legal',
          'admin',
        ]}
        flowSteps={[
          {
            label: 'Upload',
            desc: 'Comercial faz upload do PDF (declaração, recibo ou os dois) no checklist do cliente. O evento document.uploaded.irpf é emitido.',
          },
          {
            label: 'Classificação',
            desc: 'IrpfClassifierService lê a camada de texto do PDF e identifica se é uma Declaração, Recibo de Entrega ou os dois no mesmo arquivo.',
          },
          {
            label: 'Extração (Gemini)',
            desc: 'IrpfGeminiService envia o PDF em Base64 para o modelo gemini-3-1-pro com um prompt estruturado. O retorno é um JSON tipado via Zod.',
          },
          {
            label: 'Validação',
            desc: 'IrpfValidatorService valida o schema Zod e verifica consistência financeira: base tributável, saldo de imposto e inconsistências entre restituição e saldo.',
          },
          {
            label: 'Unificação',
            desc: 'IrpfUnifierService cria o registro canônico ou mescla os dados com um registro existente para o mesmo CPF + ano. Conflitos são registrados.',
          },
        ]}
        features={[
          'Extração automática ao fazer upload — sem ação manual do analista',
          'Classificação do tipo de PDF: declaração, recibo ou ambos',
          'Registro canônico único por (CPF + Ano de Exercício)',
          'Merge inteligente ao enviar declaração e recibo separados',
          'Detecção e registro de conflitos entre os dois documentos',
          'Idempotência via hash SHA-256 — mesmo arquivo não é reprocessado',
          'Validação de consistência financeira (base tributável, saldo de imposto)',
          'Indicador de confiança da extração: Alta, Média ou Baixa',
          'Suporte a PDFs escaneados via OCR do modelo Gemini',
          'Audit trail completo: tabela irpf_extraction_sources por documento',
          'Reprocessamento manual disponível para extrações com falha ou conflito',
          'Checklist dinâmico: 1 item por sócio por ano de exercício',
        ]}
        tables={[
          {
            name: 'irpf_extractions',
            description:
              'Registro canônico unificado. Chave única (cpf, exercise_year). Armazena totalizadores financeiros, dados pessoais, endereço e listas em JSONB.',
            keyColumns: ['id', 'client_id', 'cpf', 'exercise_year', 'extraction_status', 'needs_review', 'conflicts'],
          },
          {
            name: 'irpf_extraction_sources',
            description:
              'Audit trail. Relaciona cada extração canônica aos PDFs originais. Armazena file_hash para idempotência.',
            keyColumns: ['extraction_id', 'document_id', 'document_subtype', 'file_hash', 'ocr_applied'],
          },
        ]}
      />
    </PageWrapper>
  );
}
