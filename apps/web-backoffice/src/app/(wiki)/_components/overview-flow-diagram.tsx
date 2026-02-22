'use client';

import { FlowDiagram } from './flow-diagram';
import { ModuleNode } from './nodes/module-node';
import { overviewNodes, overviewEdges } from '../_data/overview-flow';

const nodeTypes = { moduleNode: ModuleNode };

export default function OverviewFlowDiagram() {
  return (
    <FlowDiagram
      nodes={overviewNodes}
      edges={overviewEdges}
      nodeTypes={nodeTypes}
      className="h-[420px]"
      showMiniMap={false}
    />
  );
}
