"use client";

import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';

const nodeTypes = {
  customNode: CustomNode,
};

interface ResultGraphProps {
  data: any;
}

export const ResultGraph: React.FC<ResultGraphProps> = ({ data }) => {
  const { highlightedId, setHighlightedId } = useGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const allNodes = [...data.startnode, ...data.targetnode];
    
    const initialNodes: Node[] = allNodes.map((item, i) => ({
      id: item._id,
      type: 'customNode',
      position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 200 },
      data: { label: item._id.split('/')[1], type: 'collection' },
      selected: highlightedId === item._id
    }));

    const initialEdges: Edge[] = data.edges.map((edge: any) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      animated: true,
      selected: highlightedId === edge._id,
      style: highlightedId === edge._id ? { stroke: 'hsl(var(--primary))', strokeWidth: 3 } : {}
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [data, highlightedId, setNodes, setEdges]);

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)}
        onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)}
        onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};