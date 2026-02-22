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

  private sanitizeAuditPayload(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`
        : value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => this.sanitizeAuditPayload(item));
    }

    const plainObject = value as Record<string, unknown>;
    const sanitizedObject: Record<string, unknown> = {};

    for (const [rawKey, rawValue] of Object.entries(plainObject)) {
      const normalizedKey = rawKey.toLowerCase();

      if (SENSITIVE_KEYS.has(normalizedKey)) {
        sanitizedObject[rawKey] = '[REDACTED]';
        continue;
      }

      sanitizedObject[rawKey] = this.sanitizeAuditPayload(rawValue);
    }

    return sanitizedObject;
  }
}
