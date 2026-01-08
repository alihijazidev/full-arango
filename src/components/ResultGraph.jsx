import React, { useEffect, useCallback } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned } from 'lucide-react';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

export const ResultGraph = ({ data }) => {
  const { 
    highlightedId, setHighlightedId, 
    isResultPathMode, resultPathNodes, setResultPathNodes, executeShortestPath 
  } = useGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const allNodes = [...data.startnode, ...data.targetnode];
    
    const initialNodes = allNodes.map((item, i) => ({
      id: item._id,
      type: 'customNode',
      position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 200 },
      data: { label: item._id.split('/')[1] || item.label, type: 'collection' },
      selected: highlightedId === item._id || resultPathNodes.includes(item._id)
    }));

    const getResultOffset = (source, target, idx, all) => {
      const samePair = all.filter(e => (e._from === source && e._to === target) || (e._from === target && e._to === source));
      if (samePair.length <= 1) return 0;
      const pairIdx = samePair.findIndex(e => e._id === all[idx]._id);
      const direction = pairIdx % 2 === 0 ? -1 : 1;
      return direction * Math.ceil(pairIdx / 2) * 40;
    };

    const initialEdges = data.edges.map((edge, i) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      type: 'parallel',
      animated: true,
      data: { offset: getResultOffset(edge._from, edge._to, i, data.edges) },
      selected: highlightedId === edge._id,
      style: highlightedId === edge._id ? { stroke: 'hsl(var(--primary))', strokeWidth: 3 } : {}
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [data, highlightedId, resultPathNodes, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => {
    if (isResultPathMode) {
      setResultPathNodes(prev => {
        const next = [...prev, node.id];
        if (next.length === 2) {
          executeShortestPath(next[0], next[1]);
          return [];
        }
        return next;
      });
    }
  }, [isResultPathMode, setResultPathNodes, executeShortestPath]);

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)}
        onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)}
        onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        
        {isResultPathMode && (
          <Panel position="top-center" className="bg-amber-500 text-white px-4 py-1.5 rounded-full shadow-lg animate-pulse">
            <p className="text-[10px] font-bold flex items-center gap-2">
              <MapPinned size={14} />
              {resultPathNodes.length === 0 ? 'اختر نقطة البداية في النتائج' : 'اختر نقطة النهاية في النتائج'}
            </p>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};