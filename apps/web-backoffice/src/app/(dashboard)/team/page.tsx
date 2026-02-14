import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { Users } from 'lucide-react';

export const metadata: Metadata = { title: 'Minha Equipe | Sarfaty' };

export default function TeamPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <Users size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Minha Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visão dos comerciais da sua equipe, clientes atribuídos e performance individual.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
