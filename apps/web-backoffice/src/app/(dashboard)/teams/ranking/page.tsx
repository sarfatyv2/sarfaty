import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { Trophy } from 'lucide-react';

export const metadata: Metadata = { title: 'Ranking de Equipes | Sarfaty' };

export default function TeamsRankingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <Trophy size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Ranking de Equipes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comparação de performance entre equipes da região.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
