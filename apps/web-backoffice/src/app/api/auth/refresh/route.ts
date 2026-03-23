import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function POST(request: Request) {
  const refreshToken = request.headers.get('x-refresh-token')?.trim();

  if (!refreshToken) {
    return NextResponse.json({ error: { message: 'Session expired' } }, { status: 401 });
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent');

  const upstream = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userAgent ? { 'user-agent': userAgent } : {}),
      ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      'x-refresh-token': refreshToken,
    },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: { message: 'Session expired' } }, { status: 401 });
  }

  const json = (await upstream.json()) as {
    data: { accessToken: string; refreshToken: string; expiresAt: number };
  };

  const { accessToken, refreshToken: newRefresh } = json.data;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.json(json);
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, newRefresh, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
