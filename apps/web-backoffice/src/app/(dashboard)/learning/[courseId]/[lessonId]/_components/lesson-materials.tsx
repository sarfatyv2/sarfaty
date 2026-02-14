import { FileDown } from 'lucide-react';
import type { LessonMaterial } from '@nexus/types';

interface LessonMaterialsProps {
  materials: LessonMaterial[];
}

export function LessonMaterials({ materials }: LessonMaterialsProps) {
  if (materials.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Materiais Complementares</h3>
      <div className="space-y-2">
        {materials.map((material, index) => (
          <a
            key={index}
            href={material.storagePath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <FileDown size={16} className="text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{material.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
