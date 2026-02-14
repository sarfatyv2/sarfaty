import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../../database/database.module';
import { auditLogs } from '../../database/schema/audit';

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'accessToken',
  'refreshToken',
  'authorization',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'cpf',
]);

export interface AuditEntry {
  correlationId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  httpMethod: string;
  path: string;
  payload?: unknown;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  record(entry: AuditEntry): void {
    const sanitizedPayload = entry.payload
      ? this.sanitize(entry.payload)
      : null;

    this.db
      .insert(auditLogs)
      .values({
        correlationId: entry.correlationId,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        httpMethod: entry.httpMethod,
        path: entry.path,
        payload: sanitizedPayload,
        metadata: entry.metadata ?? null,
      })
      .then(() => {
        this.logger.debug(`Audit recorded: ${entry.action} on ${entry.entityType}/${entry.entityId}`);
      })
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to record audit entry: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      });
  }

  private sanitize(payload: unknown): unknown {
    if (payload === null || payload === undefined) return payload;
    if (typeof payload !== 'object') return payload;

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitize(item));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitize(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
