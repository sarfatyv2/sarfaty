import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY, type RoleRepository } from '../domain/role.repository';
import { RoleConfigCache } from '../infra/role-config.cache';
import { FEATURE_CATALOG, MODULE_CATALOG, type RoleConfig, type SidebarSection } from '@nexus/types';

@Injectable()
export class GetMyPermissionsUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async execute(roleKey: string): Promise<RoleConfig> {
    const cached = this.cache.get(roleKey);
    if (cached !== null) {
      return this.buildRoleConfig(roleKey, cached);
    }

    const role = await this.roleRepository.findByKey(roleKey);
    if (!role) throw new NotFoundException(`Role "${roleKey}" not found`);

    this.cache.set(roleKey, role.features);
    return this.buildRoleConfig(roleKey, role.features, role.label, role.homeRoute);
  }

  private buildRoleConfig(
    roleKey: string,
    featureKeys: string[],
    label?: string,
    homeRoute?: string,
  ): RoleConfig {
    const featureSet = new Set(featureKeys);
    const isAdmin = featureKeys.includes('*');

    const activeFeatures = isAdmin
      ? FEATURE_CATALOG
      : FEATURE_CATALOG.filter((f) => featureSet.has(f.key));

    // Build sidebar sections
    const sidebarItems = activeFeatures.filter((f) => f.type === 'sidebar_item' && f.route && f.section);
    const sectionsMap = new Map<string, SidebarSection>();

    for (const item of sidebarItems) {
      const sectionKey = `${item.module}:${item.section}`;
      if (!sectionsMap.has(sectionKey)) {
        sectionsMap.set(sectionKey, { section: item.section!, items: [] });
      }
      sectionsMap.get(sectionKey)?.items.push({
        label: item.label,
        icon: item.icon ?? '',
        route: item.route!,
      });
    }

    // Sort modules to get consistent sidebar order
    const moduleOrder = new Map(MODULE_CATALOG.map((m, i) => [m.key, i]));
    const sidebar = Array.from(sectionsMap.values()).sort((a, b) => {
      const aItem = sidebarItems.find((i) => i.section === a.section);
      const bItem = sidebarItems.find((i) => i.section === b.section);
      const aOrder = aItem ? (moduleOrder.get(aItem.module) ?? 99) : 99;
      const bOrder = bItem ? (moduleOrder.get(bItem.module) ?? 99) : 99;
      return aOrder - bOrder;
    });

    const clientTabs = isAdmin
      ? ['*']
      : activeFeatures.filter((f) => f.type === 'client_tab').map((f) =>
          f.key.replaceAll('tab:', '').replaceAll('_', '-'),
        );

    const clientActions = isAdmin
      ? ['*']
      : activeFeatures.filter((f) => f.type === 'client_action').map((f) =>
          f.key.replaceAll('action:', ''),
        );

    const globalActions = isAdmin
      ? ['*']
      : activeFeatures.filter((f) => f.type === 'global_action').map((f) =>
          f.key.replaceAll('global:', ''),
        );

    const dashboardModules = activeFeatures
      .filter((f) => f.type === 'dashboard_module')
      .map((f) => f.key.replaceAll('dashboard:', '').replaceAll('_', '-'));

    const notifications = activeFeatures
      .filter((f) => f.type === 'notification')
      .map((f) => f.key.replaceAll('notification:', ''));

    return {
      label: label ?? roleKey,
      homeRoute: homeRoute ?? '/dashboard',
      sidebar,
      dashboardModules,
      clientTabs,
      clientActions,
      globalActions,
      notifications,
    };
  }
}
