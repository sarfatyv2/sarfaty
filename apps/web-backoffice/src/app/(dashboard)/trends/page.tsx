import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { TrendingUp } from 'lucide-react';

export const metadata: Metadata = { title: 'Tendências | Sarfaty' };

export default function TrendsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <TrendingUp size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Análise de tendências com gráficos mês a mês e ano a ano de volume, conversão e receita.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
