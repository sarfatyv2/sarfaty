import type { Metadata } from 'next';
import { PipelineBoard } from './_components/pipeline-board';

export const metadata: Metadata = { title: 'Pipeline | Sarfaty' };

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o funil comercial e mova clientes entre etapas
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
