import { Injectable, type NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { IncomingMessage, ServerResponse } from 'node:http';

export const correlationStorage = new AsyncLocalStorage<string>();

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ?? uuidv4();
    res.setHeader('x-correlation-id', correlationId);
    correlationStorage.run(correlationId, next);
  }
}
