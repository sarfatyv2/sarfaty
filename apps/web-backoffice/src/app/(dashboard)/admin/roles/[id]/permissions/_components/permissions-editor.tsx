'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nexus/ui';
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ModuleCatalogEntry, FeatureCatalogEntry } from '@nexus/types';

interface RoleData {
  id: string;
  key: string;
  label: string;
  homeRoute: string;
  isSystem: boolean;
  features: string[];
}

interface PermissionsEditorProps {
  role: RoleData;
  modules: ModuleCatalogEntry[];
  features: FeatureCatalogEntry[];
}

const FEATURE_TYPE_LABELS: Record<string, string> = {
  sidebar_item: 'Sidebar',
  client_tab: 'Abas de Cliente',
  client_action: 'Ações de Cliente',
  global_action: 'Ações Globais',
  dashboard_module: 'Dashboard',
  notification: 'Notificações',
};

interface FeatureCheckboxProps {
  featureKey: string;
  label: string;
  checked: boolean;
  onChange: (key: string) => void;
}

function FeatureCheckbox({ featureKey, label, checked, onChange }: Readonly<FeatureCheckboxProps>) {
  return (
    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border accent-primary"
        checked={checked}
        onChange={() => onChange(featureKey)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function PermissionsEditor({ role, modules, features }: Readonly<PermissionsEditorProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFeatures, setSelectedFeatures] = useState(new Set(role.features));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0]?.key ?? '']));

  const toggleFeature = useCallback((featureKey: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(featureKey)) {
        next.delete(featureKey);
      } else {
        next.add(featureKey);
      }
      return next;
    });
  }, []);

  const toggleModule = useCallback((moduleKey: string, enable: boolean) => {
    const moduleFeatureKeys = features
      .filter((f) => f.module === moduleKey)
      .map((f) => f.key);

    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (enable) {
        for (const key of moduleFeatureKeys) next.add(key);
      } else {
        for (const key of moduleFeatureKeys) next.delete(key);
      }
      return next;
    });
  }, [features]);

  const isModuleEnabled = useCallback((moduleKey: string): boolean => {
    const moduleFeatures = features.filter((f) => f.module === moduleKey);
    if (moduleFeatures.length === 0) return false;
    return moduleFeatures.every((f) => selectedFeatures.has(f.key));
  }, [features, selectedFeatures]);

  const isModulePartial = useCallback((moduleKey: string): boolean => {
    const moduleFeatures = features.filter((f) => f.module === moduleKey);
    if (moduleFeatures.length === 0) return false;
    const enabledCount = moduleFeatures.filter((f) => selectedFeatures.has(f.key)).length;
    return enabledCount > 0 && enabledCount < moduleFeatures.length;
  }, [features, selectedFeatures]);

  const toggleModuleExpand = useCallback((moduleKey: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  }, []);

  function handleSave() {
    startTransition(async () => {
      try {
        await api.put(`/roles/${role.id}/permissions`, {
          featureKeys: Array.from(selectedFeatures),
        });
        toast.success('Permissões salvas com sucesso');
      } catch {
        toast.error('Erro ao salvar permissões');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/roles')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-normal">Permissões: {role.label}</h1>
          <p className="text-sm text-muted-foreground font-mono">{role.key}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedFeatures.size} permissões selecionadas
          </span>
          <Button onClick={handleSave} disabled={isPending}>
            <Save size={16} />
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const moduleFeatures = features.filter((f) => f.module === module.key);
          if (moduleFeatures.length === 0) return null;

          const isExpanded = expandedModules.has(module.key);
          const moduleEnabled = isModuleEnabled(module.key);
          const modulePartial = isModulePartial(module.key);

          const featuresByType = moduleFeatures.reduce<Record<string, FeatureCatalogEntry[]>>(
            (acc, f) => {
              const group = acc[f.type] ?? [];
              group.push(f);
              acc[f.type] = group;
              return acc;
            },
            {},
          );

          return (
            <Card key={module.key} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleModuleExpand(module.key)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <CardTitle className="text-sm font-medium">{module.label}</CardTitle>
                    {modulePartial && (
                      <Badge variant="secondary" className="text-[10px]">Parcial</Badge>
                    )}
                    {moduleEnabled && !modulePartial && (
                      <Badge className="text-[10px]">Ativo</Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto mr-2">
                      {moduleFeatures.filter((f) => selectedFeatures.has(f.key)).length}/{moduleFeatures.length}
                    </span>
                  </button>
                  <Switch
                    checked={moduleEnabled || modulePartial}
                    onCheckedChange={(checked) => toggleModule(module.key, checked)}
                    title={`Ativar/desativar módulo ${module.label}`}
                  />
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    {Object.entries(featuresByType).map(([type, typeFeatures]) => (
                      <div key={type}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          {FEATURE_TYPE_LABELS[type] ?? type}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {typeFeatures.map((feature) => (
                            <FeatureCheckbox
                              key={feature.key}
                              featureKey={feature.key}
                              label={feature.label}
                              checked={selectedFeatures.has(feature.key)}
                              onChange={toggleFeature}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
