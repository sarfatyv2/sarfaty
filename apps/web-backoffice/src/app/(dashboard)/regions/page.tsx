import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'Regiões | Sarfaty' };

export default function RegionsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <Globe size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Regiões</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestão das regiões comerciais com equipes, metas e indicadores agregados.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
