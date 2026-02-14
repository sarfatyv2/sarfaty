'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NewUserError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Erro ao carregar formulário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado.'}
          </p>
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
