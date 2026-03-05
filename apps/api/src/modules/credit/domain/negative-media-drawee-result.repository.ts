import { type NegativeMediaDraweeResult } from './negative-media-drawee-result.entity';

export const NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY = Symbol('NEGATIVE_MEDIA_DRAWEE_RESULT_REPOSITORY');

export interface NegativeMediaDraweeResultRepository {
  save(result: NegativeMediaDraweeResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<NegativeMediaDraweeResult | null>;
  getAllByDraweeId(draweeId: string): Promise<NegativeMediaDraweeResult[]>;
}
