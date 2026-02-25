import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { supabaseAdmin } from '../../config/supabase';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    let supabaseUser: Record<string, unknown> | null = null;
    try {
      const result = await supabaseAdmin.auth.getUser(token);
      if (result.error || !result.data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      supabaseUser = result.data.user as unknown as Record<string, unknown>;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Authentication service unavailable');
    }

    const userId = supabaseUser.id as string;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const existingMetadata = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
    supabaseUser.user_metadata = {
      ...existingMetadata,
      role: profile?.role ?? existingMetadata.role,
    };

    request.user = supabaseUser;
    return true;
  }
}
