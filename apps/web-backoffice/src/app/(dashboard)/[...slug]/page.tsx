import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = '/' + slug.join('/');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg">Módulo em construção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A rota <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{path}</code> será
            implementada nos próximos sprints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
