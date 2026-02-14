import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { UsersRound } from 'lucide-react';

export const metadata: Metadata = { title: 'Equipes | Sarfaty' };

export default function TeamsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <UsersRound size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Equipes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestão de equipes comerciais da região, com membros e indicadores.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
