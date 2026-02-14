import { Injectable } from '@nestjs/common';
import { type LoginDto } from '@nexus/validators';
import { supabaseAdmin } from '../../../config/supabase';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';

@Injectable()
export class LoginUseCase {
  async execute(dto: LoginDto) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new InvalidCredentialsException();
    }

    return {
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role,
        },
      },
    };
  }
}
