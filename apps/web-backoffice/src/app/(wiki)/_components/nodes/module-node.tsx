'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface ModuleNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  isHub?: boolean;
  [key: string]: unknown;
}

const colorStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    dot: 'bg-teal-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    dot: 'bg-indigo-500',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    dot: 'bg-slate-500',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
};

export function ModuleNode({ data }: NodeProps) {
  const nodeData = data as ModuleNodeData;
  const c = colorStyles[nodeData.color ?? 'green'] ?? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' };

  if (nodeData.isHub) {
    return (
      <div className="flex flex-col items-center justify-center w-[120px] h-[120px] rounded-full bg-[hsl(150,50%,12%)] border-4 border-[hsl(48,100%,42%)] shadow-lg shadow-[hsl(150,50%,12%)]/20">
        <Handle type="source" position={Position.Top} className="!bg-[hsl(48,100%,42%)] !border-white !w-2 !h-2" />
        <Handle type="target" position={Position.Top} className="!bg-[hsl(48,100%,42%)] !border-white !w-2 !h-2" id="t" />
        <Handle type="source" position={Position.Bottom} id="b" className="!bg-[hsl(48,100%,42%)] !border-white !w-2 !h-2" />
        <Handle type="source" position={Position.Left} id="l" className="!bg-[hsl(48,100%,42%)] !border-white !w-2 !h-2" />
        <Handle type="source" position={Position.Right} id="r" className="!bg-[hsl(48,100%,42%)] !border-white !w-2 !h-2" />
        <span className="text-[10px] font-bold text-[hsl(48,100%,42%)] uppercase tracking-widest text-center px-2 leading-tight">
          {nodeData.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-w-[130px] rounded-xl border ${c.border} ${c.bg} shadow-sm px-3 py-2.5`}>
      <Handle type="target" position={Position.Left} className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <Handle type="target" position={Position.Top} id="t" className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} id="b" className="!bg-[hsl(150,20%,60%)] !border-white !w-2 !h-2" />
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
        <span className={`text-xs font-bold ${c.text} leading-tight`}>{nodeData.label}</span>
      </div>
      {nodeData.description && (
        <p className="text-[10px] text-[hsl(150,15%,50%)] leading-snug">{nodeData.description}</p>
      )}
    </div>
  );
}
