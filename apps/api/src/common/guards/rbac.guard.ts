import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTIONS_KEY } from '../decorators/require-actions.decorator';
import { canPerformAction } from '@nexus/utils';
import type { Role } from '@nexus/types';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredActions = this.reflector.getAllAndOverride<string[]>(ACTIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredActions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.user_metadata?.role as Role | undefined;

    if (!userRole) {
      throw new ForbiddenException('No role assigned');
    }

    const hasPermission = requiredActions.every((action) =>
      canPerformAction(userRole, action),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
