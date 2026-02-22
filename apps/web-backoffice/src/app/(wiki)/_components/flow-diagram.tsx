'use client';

import '@xyflow/react/dist/style.css';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';

interface FlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes?: NodeTypes;
  className?: string;
  showMiniMap?: boolean;
  fitView?: boolean;
}

function FlowInner({ nodes, edges, nodeTypes, showMiniMap = false, fitView = true }: FlowDiagramProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView={fitView}
      fitViewOptions={{ padding: 0.15 }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="hsl(150, 20%, 88%)"
      />
      <Controls
        showInteractive={false}
        className="!bottom-4 !left-4 !shadow-md !rounded-lg !border !border-[hsl(30,20%,88%)] !bg-white"
      />
      {showMiniMap && (
        <MiniMap
          nodeStrokeWidth={2}
          zoomable
          pannable
          className="!bottom-4 !right-4 !shadow-md !rounded-lg !border !border-[hsl(30,20%,88%)]"
        />
      )}
    </ReactFlow>
  );
}

export function FlowDiagram(props: FlowDiagramProps) {
  return (
    <div className={`rounded-xl border border-[hsl(30,20%,88%)] overflow-hidden bg-white shadow-sm ${props.className ?? ''}`}>
      <ReactFlowProvider>
        <FlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
