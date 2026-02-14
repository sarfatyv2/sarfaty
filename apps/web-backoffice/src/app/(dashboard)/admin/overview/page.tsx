import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Visão Geral do Sistema</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Sarfaty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sprint 0 — Scaffold completo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Online</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os serviços operacionais
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Versão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0.1.0</p>
            <p className="text-sm text-muted-foreground mt-1">
              Módulos serão adicionados nos próximos sprints
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
