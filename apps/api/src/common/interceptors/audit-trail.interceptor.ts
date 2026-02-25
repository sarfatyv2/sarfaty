import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { correlationStorage } from '../middleware/correlation-id.middleware';
import { AuditService } from '../services/audit.service';
import { AUDITABLE_KEY, type AuditableOptions } from '../decorators/auditable.decorator';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'api_key',
  'apikey',
  'secret',
  'secret_key',
]);

const MAX_STRING_LENGTH = 512;
const MAX_ARRAY_ITEMS = 20;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditOptions = this.reflector.get<AuditableOptions | undefined>(
      AUDITABLE_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id: string; user_metadata?: { role?: string } }
      | undefined;

    const idParam = auditOptions.idParam ?? 'id';
    const entityId: string | null =
      (request.params?.[idParam] as string | undefined) ?? null;

    const correlationId = correlationStorage.getStore() ?? 'unknown';
    const actorId = user?.id ?? 'anonymous';
    const actorRole = user?.user_metadata?.role ?? 'unknown';
    const httpMethod: string = request.method ?? 'UNKNOWN';
    const path: string = request.url ?? request.originalUrl ?? '';

    return next.handle().pipe(
      tap((responseData) => {
        const response = responseData as Record<string, unknown> | undefined;
        const nestedData = response?.data as Record<string, unknown> | undefined;
        const resolvedEntityId =
          entityId ??
          (nestedData?.id as string | undefined) ??
          (response?.id as string | undefined) ??
          null;

        this.auditService.record({
          correlationId,
          actorId,
          actorRole,
          action: auditOptions.action,
          entityType: auditOptions.entity,
          entityId: resolvedEntityId,
          httpMethod,
          path,
          payload: this.sanitizeAuditPayload(request.body as unknown),
          metadata: {
            ip: request.ip as string | undefined,
            userAgent: request.headers?.['user-agent'] as string | undefined,
          },
        });
      }),
    );
  }

  private sanitizeAuditPayload(value: unknown, seen = new Set<unknown>(), depth = 0): unknown {
    const MAX_DEPTH = 10;

    if (value === null || value === undefined) {
      return value;
    }

    if (Buffer.isBuffer(value)) {
      return `[BUFFER ${value.length}b]`;
    }

    if (typeof value === 'string') {
      return value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`
        : value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    // Stop at max depth or circular reference
    if (depth >= MAX_DEPTH || seen.has(value)) {
      return '[TRUNCATED]';
    }

    // Skip streams and file-like objects from multipart
    if (
      typeof (value as Record<string, unknown>)['pipe'] === 'function' ||
      typeof (value as Record<string, unknown>)['read'] === 'function' ||
      (value as Record<string, unknown>)['type'] === 'file'
    ) {
      const fileObj = value as Record<string, unknown>;
      return {
        type: 'file',
        filename: fileObj['filename'] ?? fileObj['originalname'],
        mimetype: fileObj['mimetype'],
        fieldname: fileObj['fieldname'],
      };
    }

    seen.add(value);

    if (Array.isArray(value)) {
      const result = value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => this.sanitizeAuditPayload(item, seen, depth + 1));
      seen.delete(value);
      return result;
    }

    const plainObject = value as Record<string, unknown>;
    const sanitizedObject: Record<string, unknown> = {};

    for (const [rawKey, rawValue] of Object.entries(plainObject)) {
      const normalizedKey = rawKey.toLowerCase();

      if (SENSITIVE_KEYS.has(normalizedKey)) {
        sanitizedObject[rawKey] = '[REDACTED]';
        continue;
      }

      sanitizedObject[rawKey] = this.sanitizeAuditPayload(rawValue, seen, depth + 1);
    }

    seen.delete(value);
    return sanitizedObject;
  }
}
