import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';
import { UserCreationFailedException } from '../domain/exceptions/user-creation-failed.exception';

@Injectable()
export class SupabaseAuthAdapter {
  async createAuthUser(
    email: string,
    password: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      throw new UserCreationFailedException(error.message);
    }

    return data.user.id;
  }

  async listAuthUsers(): Promise<Array<{ id: string; email: string; created_at: string }>> {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw new UserCreationFailedException(error.message);
    }

    return data.users.map((user) => ({
      id: user.id,
      email: user.email ?? '',
      created_at: user.created_at,
    }));
  }
}
