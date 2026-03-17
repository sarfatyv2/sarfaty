'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Button, Input, Label, Card, CardHeader, CardDescription, CardContent } from '@nexus/ui';
import { ROLE_PERMISSIONS, type Role } from '@nexus/types';
import { BookOpen } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email ou senha inválidos');
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role as Role | undefined;
    let homeRoute = role ? (ROLE_PERMISSIONS[role]?.homeRoute ?? '/dashboard') : '/dashboard';

    try {
      const token = data.session?.access_token;
      if (token) {
        const res = await fetch(`${API_BASE_URL}/my/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json() as { data: { homeRoute?: string } };
          homeRoute = json.data?.homeRoute ?? homeRoute;
        }
      }
    } catch {
      // use fallback
    }

    router.refresh();
    router.push(homeRoute);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center flex flex-col items-center gap-2">
        <Image src="/logo.svg" alt="Grupo Sarfaty" width={160} height={46} priority />
        <CardDescription>Acesse a plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-5 pt-4 border-t border-border">
          <Link
            href="/wiki"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <BookOpen size={14} />
            <span>Documentação da Plataforma</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center flex flex-col items-center gap-2">
        <Image src="/logo.svg" alt="Grupo Sarfaty" width={160} height={46} priority />
        <CardDescription>Acesse a plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-5 pt-4 border-t border-border">
          <Link
            href="/wiki"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <BookOpen size={14} />
            <span>Documentação da Plataforma</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
