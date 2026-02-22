import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async execute(userId: string) {
    const result = await this.db.execute<{
      id: string;
      full_name: string;
      email: string;
      role: string;
      avatar_url: string | null;
    }>(
      // raw query since schema may not be defined yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { sql: 'SELECT id, full_name, email, role, avatar_url FROM profiles WHERE id = $1', params: [userId] } as any,
    );

    const profile = result[0];

    return {
      data: profile
        ? {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email,
            role: profile.role,
            avatarUrl: profile.avatar_url,
          }
        : null,
    };
  }
}
