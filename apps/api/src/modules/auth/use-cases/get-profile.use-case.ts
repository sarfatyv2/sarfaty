import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async execute(userId: string) {
    const rows = await this.db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        role: profiles.role,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const profile = rows[0];

    return {
      data: profile
        ? {
            id: profile.id,
            fullName: profile.fullName,
            email: profile.email,
            role: profile.role,
            avatarUrl: profile.avatarUrl,
          }
        : null,
    };
  }
}
