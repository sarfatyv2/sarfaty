import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { isNotNull } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { PasswordService } from '../../auth/domain/password.service';
import { UserCreationFailedException } from '../domain/exceptions/user-creation-failed.exception';

@Injectable()
export class LocalAuthAdapter {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly passwordService: PasswordService,
  ) {}

  async createAuthUser(
    email: string,
    password: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const id = randomUUID();
    const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : '';
    const role = typeof metadata.role === 'string' ? metadata.role : 'employee';

    if (!fullName.trim()) {
      throw new UserCreationFailedException('full_name is required');
    }

    const passwordHash = await this.passwordService.hash(password);

    try {
      await this.db.insert(profiles).values({
        id,
        fullName,
        email,
        role,
        passwordHash,
        isActive: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new UserCreationFailedException(message);
    }

    return id;
  }

  async listAuthUsers(): Promise<Array<{ id: string; email: string; created_at: string }>> {
    const rows = await this.db
      .select({
        id: profiles.id,
        email: profiles.email,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(isNotNull(profiles.passwordHash));

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      created_at: row.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }
}
