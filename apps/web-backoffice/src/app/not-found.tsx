import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg">Página não encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Button asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
