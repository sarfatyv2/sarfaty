import { type DigitalPresenceDraweeResult } from './digital-presence-drawee-result.entity';

export const DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY = Symbol('DIGITAL_PRESENCE_DRAWEE_RESULT_REPOSITORY');

export interface DigitalPresenceDraweeResultRepository {
  save(result: DigitalPresenceDraweeResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<DigitalPresenceDraweeResult[]>;
}
