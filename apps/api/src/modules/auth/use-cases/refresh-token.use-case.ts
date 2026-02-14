import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';
import { SessionExpiredException } from '../domain/exceptions/session-expired.exception';

@Injectable()
export class RefreshTokenUseCase {
  async execute(refreshToken: string) {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new SessionExpiredException();
    }

    return {
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }
}
