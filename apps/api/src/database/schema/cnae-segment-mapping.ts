import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { segments } from './segments';

export const cnaeSegmentMapping = pgTable('cnae_segment_mapping', {
  id: uuid('id').primaryKey().defaultRandom(),
  cnaeCode: text('cnae_code').notNull(),
  cnaeGroup: text('cnae_group').notNull(),
  segmentId: uuid('segment_id').notNull().references(() => segments.id),
  confidence: text('confidence').default('medium'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  codeIdx: index('idx_cnae_mapping_code').on(table.cnaeCode),
  groupIdx: index('idx_cnae_mapping_group').on(table.cnaeGroup),
}));
