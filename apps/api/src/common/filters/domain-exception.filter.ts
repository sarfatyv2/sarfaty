import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainException } from '@nexus/types';
import { correlationStorage } from '../middleware/correlation-id.middleware';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const correlationId = correlationStorage.getStore() ?? 'unknown';

    const body = {
      error: {
        code: exception.code,
        message: exception.message,
        statusCode: exception.httpStatus,
        correlationId,
        timestamp: new Date().toISOString(),
        ...(exception.metadata ? { metadata: exception.metadata } : {}),
      },
    };

    response.status(exception.httpStatus).send(body);
  }
}
