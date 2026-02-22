'use client';

import { FlowDiagram } from './flow-diagram';
import { TableNode } from './nodes/table-node';
import { databaseNodes, databaseEdges } from '../_data/database-nodes';

const nodeTypes = { tableNode: TableNode };

export default function DatabaseErd() {
  return (
    <FlowDiagram
      nodes={databaseNodes}
      edges={databaseEdges}
      nodeTypes={nodeTypes}
      className="h-[640px]"
      showMiniMap
    />
  );
}
