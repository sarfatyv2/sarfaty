import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = { title: 'Mapa de Calor | Sarfaty' };

export default function HeatmapPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <MapPin size={24} className="text-muted-foreground" />
          <CardTitle className="text-lg">Mapa de Calor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Distribuição geográfica dos clientes por cidade e estado com visualização em mapa.
            Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
