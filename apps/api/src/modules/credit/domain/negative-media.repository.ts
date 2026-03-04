import { type NegativeMediaResult } from './negative-media-result.entity';

export const NEGATIVE_MEDIA_REPOSITORY = 'NEGATIVE_MEDIA_REPOSITORY';

export interface NegativeMediaRepository {
  save(result: NegativeMediaResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<NegativeMediaResult | null>;
}
