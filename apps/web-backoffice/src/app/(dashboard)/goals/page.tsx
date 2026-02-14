import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { Target } from 'lucide-react';

export const metadata: Metadata = { title: 'Metas | Sarfaty' };

export default function GoalsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <Target size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Acompanhamento de metas individuais, de equipe e regionais com progresso mensal.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
