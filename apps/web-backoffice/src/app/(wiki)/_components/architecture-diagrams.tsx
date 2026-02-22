'use client';

import { FlowDiagram } from './flow-diagram';
import { LayerNode } from './nodes/layer-node';
import { dddNodes, dddEdges, monorepoNodes, monorepoEdges } from '../_data/architecture-flow';

const nodeTypes = { layerNode: LayerNode };

export function DddFlowDiagram() {
  return (
    <FlowDiagram
      nodes={dddNodes}
      edges={dddEdges}
      nodeTypes={nodeTypes}
      className="h-[360px]"
    />
  );
}

export function MonorepoFlowDiagram() {
  return (
    <FlowDiagram
      nodes={monorepoNodes}
      edges={monorepoEdges}
      nodeTypes={nodeTypes}
      className="h-[420px]"
    />
  );
}
