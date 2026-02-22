'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface LayerNodeData {
  label: string;
  sublabel?: string;
  items?: string[];
  color?: string;
  [key: string]: unknown;
}

const styles: Record<string, { bg: string; border: string; label: string; badge: string }> = {
  green: {
    bg: 'bg-gradient-to-r from-emerald-50 to-emerald-50/50',
    border: 'border-l-4 border-l-emerald-500 border-emerald-100',
    label: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  blue: {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-50/50',
    border: 'border-l-4 border-l-blue-500 border-blue-100',
    label: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-gradient-to-r from-purple-50 to-purple-50/50',
    border: 'border-l-4 border-l-purple-500 border-purple-100',
    label: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-700',
  },
  amber: {
    bg: 'bg-gradient-to-r from-amber-50 to-amber-50/50',
    border: 'border-l-4 border-l-amber-500 border-amber-100',
    label: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
  },
};

export function LayerNode({ data }: NodeProps) {
  const nodeData = data as LayerNodeData;
  const s = styles[nodeData.color ?? 'blue'] ?? { bg: 'bg-blue-50', border: 'border-l-4 border-l-blue-500 border-blue-100', label: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' };

  return (
    <div className={`min-w-[260px] rounded-xl border ${s.border} ${s.bg} px-4 py-3 shadow-sm`}>
      <Handle type="target" position={Position.Top} className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="l" className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />

      <span className={`text-xs font-bold ${s.label} uppercase tracking-wider`}>{nodeData.label}</span>
      {nodeData.sublabel && (
        <p className="text-[11px] text-[hsl(150,15%,50%)] mt-0.5">{nodeData.sublabel}</p>
      )}
      {nodeData.items && nodeData.items.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {nodeData.items.map((item) => (
            <span key={item} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.badge}`}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
