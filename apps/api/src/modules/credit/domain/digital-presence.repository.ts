import { type DigitalPresenceResult } from './digital-presence-result.entity';

export const DIGITAL_PRESENCE_REPOSITORY = 'DIGITAL_PRESENCE_REPOSITORY';

export interface DigitalPresenceRepository {
  save(result: DigitalPresenceResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<DigitalPresenceResult | null>;
}
