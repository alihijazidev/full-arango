import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

export const ResultGraph = ({ data }) => {
  const { 
    highlightedId, setHighlightedId, 
    isResultPathMode, resultPathNodes, setResultPathNodes, executeShortestPath,
    resultSearchTerm
  } = useGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const filteredData = useMemo(() => {
    if (!resultSearchTerm) return data;
    const term = resultSearchTerm.toLowerCase();
    
    // 1. Get nodes that match text
    const matchingNodes = [...(data.startnode || []), ...(data.targetnode || [])].filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      const inProps = Object.entries(node).some(([key, value]) => {
        if (key.startsWith('_') || key === 'label' || key === 'type' || key === 'designedNodeId') return false;
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
      return inId || inLabel || inProps;
    });

    // 2. Get edges that match text
    const matchingEdges = (data.edges || []).filter(edge => {
      const inFrom = edge._from ? String(edge._from).toLowerCase().includes(term) : false;
      const inTo = edge._to ? String(edge._to).toLowerCase().includes(term) : false;
      const inLabel = edge.label ? String(edge.label).toLowerCase().includes(term) : false;
      return inFrom || inTo || inLabel;
    });

    // 3. Final set of nodes: matches + source/target of matching edges
    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => {
      nodeIdsToShow.add(e._from);
      nodeIdsToShow.add(e._to);
    });

    const finalNodes = [...(data.startnode || []), ...(data.targetnode || [])].filter(n => nodeIdsToShow.has(n._id));
    
    // 4. Final set of edges: matches only (per user request)
    return {
      startnode: finalNodes,
      targetnode: [],
      edges: matchingEdges
    };
  }, [data, resultSearchTerm]);

  useEffect(() => {
    const allNodes = filteredData.startnode;
    
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

    const initialEdges = filteredData.edges.map((edge, i) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      type: 'parallel',
      animated: true,
      data: { offset: getResultOffset(edge._from, edge._to, i, filteredData.edges) },
      selected: highlightedId === edge._id,
      style: highlightedId === edge._id ? { stroke: 'hsl(var(--primary))', strokeWidth: 3 } : {}
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Auto-fit after data change
    if (resultSearchTerm) {
      setTimeout(() => fitView({ duration: 400 }), 50);
    }
  }, [filteredData, highlightedId, resultPathNodes, setNodes, setEdges, fitView, resultSearchTerm]);

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
        
        <Panel position="bottom-right" className="m-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={() => fitView({ duration: 800 })}
          >
            <Maximize2 size={14} />
            إعادة تعيين الموقع
          </Button>
        </Panel>

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