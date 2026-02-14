import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = { title: 'Pipeline | Sarfaty' };

export default function PipelinePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <BarChart3 size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Pipeline de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visualização do funil comercial com kanban e métricas de conversão.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
