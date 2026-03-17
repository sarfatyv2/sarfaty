import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTIONS_KEY } from '../decorators/require-actions.decorator';
import { ROLE_REPOSITORY, type RoleRepository } from '../../modules/roles/domain/role.repository';
import { RoleConfigCache } from '../../modules/roles/infra/role-config.cache';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredActions = this.reflector.getAllAndOverride<string[]>(ACTIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredActions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.user_metadata?.role as string | undefined;

    if (!userRole) {
      throw new ForbiddenException('No role assigned');
    }

    const features = await this.resolveFeatures(userRole);

    // Wildcard means admin – full access
    if (features.includes('*')) return true;

    const hasPermission = requiredActions.every((action) => {
      // action can be in clientActions (action:*) or globalActions (global:*)
      return (
        features.includes(`action:${action}`) ||
        features.includes(`global:${action}`)
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }

  private async resolveFeatures(roleKey: string): Promise<string[]> {
    const cached = this.cache.get(roleKey);
    if (cached !== null) return cached;

    const role = await this.roleRepository.findByKey(roleKey);
    if (!role) return [];

    this.cache.set(roleKey, role.features);
    return role.features;
  }
}
