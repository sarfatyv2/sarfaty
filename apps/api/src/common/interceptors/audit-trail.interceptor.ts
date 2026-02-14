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
          entityId: resolvedEntityId as string | null,
          httpMethod,
          path,
          payload: request.body as unknown,
          metadata: {
            ip: request.ip as string | undefined,
            userAgent: request.headers?.['user-agent'] as string | undefined,
          },
        });
      }),
    );
  }
}
