import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { ClipboardList } from 'lucide-react';

export const metadata: Metadata = { title: 'Atividades | Sarfaty' };

export default function ActivitiesPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <ClipboardList size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Atividades Comerciais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Registro e acompanhamento de atividades comerciais (visitas, ligações, reuniões).
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
