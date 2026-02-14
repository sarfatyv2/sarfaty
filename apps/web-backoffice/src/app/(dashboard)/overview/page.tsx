import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bem-vindo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Plataforma Sarfaty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os módulos serão adicionados nos próximos sprints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
