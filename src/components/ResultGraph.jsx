import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, LayoutGrid, Filter } from 'lucide-react';
import { Button } from './ui/button';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

// وظيفة التوزيع الشبكي المنظم
const getGridLayoutedElements = (nodes, edges) => {
  const spacingX = 300; 
  const spacingY = 200; 
  const columns = Math.ceil(Math.sqrt(nodes.length)); 

  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.data.label !== b.data.label) {
      return a.data.label.localeCompare(b.data.label);
    }
    return a.id.localeCompare(b.id);
  });

  const layoutedNodes = sortedNodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    return {
      ...node,
      position: {
        x: col * spacingX,
        y: row * spacingY,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const ResultGraphInner = ({ data }) => {
  const { 
    highlightedId, setHighlightedId, 
    selectedResultId, setSelectedResultId,
    isResultPathMode, resultPathNodes, setResultPathNodes, executeShortestPath,
    resultSearchTerm
  } = useGraph();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const allRawNodes = useMemo(() => {
    return [...(data.startnode || []), ...(data.targetnode || [])];
  }, [data]);

  const filteredData = useMemo(() => {
    // 1. تصفية العلاقات المتكررة بناءً على _id
    const uniqueEdgesMap = new Map();
    (data.edges || []).forEach(edge => {
      if (!uniqueEdgesMap.has(edge._id)) {
        uniqueEdgesMap.set(edge._id, edge);
      }
    });
    const uniqueEdges = Array.from(uniqueEdgesMap.values());

    if (!resultSearchTerm) return { nodes: allRawNodes, edges: uniqueEdges };
    
    const term = resultSearchTerm.toLowerCase();
    
    const matchingNodes = allRawNodes.filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      return inId || inLabel;
    });

    const matchingEdges = uniqueEdges.filter(edge => {
      return (
        edge._from.toLowerCase().includes(term) || 
        edge._to.toLowerCase().includes(term) || 
        edge.label.toLowerCase().includes(term) ||
        edge._id.toLowerCase().includes(term)
      );
    });

    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => { nodeIdsToShow.add(e._from); nodeIdsToShow.add(e._to); });

    return {
      nodes: allRawNodes.filter(n => nodeIdsToShow.has(n._id)),
      edges: matchingEdges
    };
  }, [allRawNodes, data.edges, resultSearchTerm]);

  const applyLayout = useCallback(() => {
    const rawNodes = filteredData.nodes.map((item) => ({
      id: item._id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: { 
        label: item.label || (item._id && item._id.includes('/') ? item._id.split('/')[0] : "Unknown"),
        instanceId: item._id,
        type: 'collection',
        metadata: item 
      },
    }));

    const rawEdges = filteredData.edges.map((edge) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      type: 'parallel',
      animated: true,
      data: { offset: 0, metadata: edge },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getGridLayoutedElements(rawNodes, rawEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 50);
  }, [filteredData, setNodes, setEdges, fitView]);

  useEffect(() => {
    applyLayout();
  }, [applyLayout]);

  useEffect(() => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      selected: selectedResultId === node.id || resultPathNodes.includes(node.id) || highlightedId === node.id
    })));
  }, [selectedResultId, resultPathNodes, highlightedId, setNodes]);

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => isResultPathMode ? setResultPathNodes(prev => [...prev, node.id].length === 2 ? (executeShortestPath(prev[0], node.id), []) : [...prev, node.id]) : setSelectedResultId(node.id)}
        onEdgeClick={(_, edge) => !isResultPathMode && setSelectedResultId(edge.id)}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)}
        onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)}
        onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        
        <Panel position="bottom-right" className="m-4 flex gap-2">
          <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-md border shadow-sm flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <Filter size={12} className="text-primary" />
            تصفية المعرفات المتكررة نشطة
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={applyLayout}
          >
            <LayoutGrid size={14} />
            إعادة ترتيب الشبكة
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={() => fitView({ duration: 800 })}
          >
            <Maximize2 size={14} />
            احتواء
          </Button>
        </Panel>

        {isResultPathMode && (
          <Panel position="top-center" className="bg-amber-500 text-white px-4 py-1.5 rounded-full shadow-lg animate-pulse">
            <p className="text-[10px] font-bold flex items-center gap-2">
              <MapPinned size={14} />
              {resultPathNodes.length === 0 ? 'اختر نقطة البداية' : 'اختر نقطة النهاية'}
            </p>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const ResultGraph = (props) => (
  <ReactFlowProvider>
    <ResultGraphInner {...props} />
  </ReactFlowProvider>
);