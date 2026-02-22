'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface TableNodeData {
  tableName: string;
  columns?: string[];
  color?: string;
  [key: string]: unknown;
}

const colorMap: Record<string, { header: string; border: string; dot: string }> = {
  green: { header: 'bg-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  blue: { header: 'bg-blue-600', border: 'border-blue-200', dot: 'bg-blue-400' },
  amber: { header: 'bg-amber-500', border: 'border-amber-200', dot: 'bg-amber-400' },
  purple: { header: 'bg-purple-600', border: 'border-purple-200', dot: 'bg-purple-400' },
  rose: { header: 'bg-rose-600', border: 'border-rose-200', dot: 'bg-rose-400' },
  sky: { header: 'bg-sky-600', border: 'border-sky-200', dot: 'bg-sky-400' },
  teal: { header: 'bg-teal-600', border: 'border-teal-200', dot: 'bg-teal-400' },
  indigo: { header: 'bg-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  orange: { header: 'bg-orange-500', border: 'border-orange-200', dot: 'bg-orange-400' },
  slate: { header: 'bg-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
};

export function TableNode({ data }: NodeProps) {
  const nodeData = data as TableNodeData;
  const c = colorMap[nodeData.color ?? 'slate'] ?? { header: 'bg-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };

  return (
    <div className={`min-w-[160px] rounded-lg border ${c.border} bg-white shadow-sm overflow-hidden`}>
      <Handle type="target" position={Position.Left} className={`!${c.dot} !border-white !w-2 !h-2`} />
      <Handle type="source" position={Position.Right} className={`!${c.dot} !border-white !w-2 !h-2`} />
      <Handle type="target" position={Position.Top} id="t" className={`!${c.dot} !border-white !w-2 !h-2`} />
      <Handle type="source" position={Position.Bottom} id="b" className={`!${c.dot} !border-white !w-2 !h-2`} />

      <div className={`${c.header} px-3 py-1.5`}>
        <span className="text-[11px] font-mono font-bold text-white">{nodeData.tableName}</span>
      </div>

      {nodeData.columns && nodeData.columns.length > 0 && (
        <div className="px-3 py-2 space-y-0.5">
          {nodeData.columns.map((col) => (
            <div key={col} className="flex items-center gap-1.5">
              <div className={`w-1 h-1 rounded-full ${c.dot}`} />
              <span className="text-[10px] font-mono text-[hsl(150,15%,40%)]">{col}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
