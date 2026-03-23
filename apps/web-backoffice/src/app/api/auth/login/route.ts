import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const upstream = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
  }

  const json = (await upstream.json()) as {
    data: { accessToken: string; refreshToken: string; expiresAt: number; user: unknown };
  };

  const { accessToken, refreshToken } = json.data;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.json(json);
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
