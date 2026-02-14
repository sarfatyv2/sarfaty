import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { PeopleStorageService } from '../infra/people-storage.service';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly storageService: PeopleStorageService,
  ) {}

  async execute(
    profileId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<string> {
    const avatarUrl = await this.storageService.uploadAvatar(profileId, file);

    await this.db
      .update(profiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(profiles.id, profileId));

    return avatarUrl;
  }
}
