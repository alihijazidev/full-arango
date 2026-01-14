import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, LayoutGrid, Network, GitGraph } from 'lucide-react';
import { Button } from './ui/button';
import dagre from 'dagre';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

// --- Grid Layout Logic ---
const getGridLayoutedElements = (nodes, edges) => {
  const spacingX = 300; 
  const spacingY = 200; 
  const columns = Math.ceil(Math.sqrt(nodes.length)); 

  const sortedNodes = [...nodes].sort((a, b) => {
    const labelA = String(a.data?.label || '');
    const labelB = String(b.data?.label || '');
    if (labelA !== labelB) {
      return labelA.localeCompare(labelB);
    }
    return String(a.id).localeCompare(String(b.id));
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

// --- Tree (Hierarchical) Layout Logic using Dagre ---
const getTreeLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 180;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: (nodeWithPosition?.x || 0) - nodeWidth / 2,
        y: (nodeWithPosition?.y || 0) - nodeHeight / 2,
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
  const [layoutMode, setLayoutMode] = useState('grid'); 

  // تصفية العقد لضمان فرادة المعرف _id
  const allRawNodes = useMemo(() => {
    const combined = [...(data?.startnode || []), ...(data?.targetnode || [])];
    const seen = new Set();
    return combined.filter(node => {
      if (seen.has(node._id)) return false;
      seen.add(node._id);
      return true;
    });
  }, [data]);

  // تصفية الروابط لضمان فرادة المعرف _id
  const allRawEdges = useMemo(() => {
    const edges = data?.edges || [];
    const seen = new Set();
    return edges.filter(edge => {
      if (seen.has(edge._id)) return false;
      seen.add(edge._id);
      return true;
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let baseNodes = allRawNodes;
    let baseEdges = allRawEdges;

    // 1. تطبيق البحث أولاً إذا وُجد
    if (resultSearchTerm) {
      const term = resultSearchTerm.toLowerCase();
      const matchesSearch = (obj) => {
        return Object.entries(obj).some(([key, value]) => {
          const keyMatch = String(key).toLowerCase().includes(term);
          const valueMatch = value !== null && value !== undefined && String(value).toLowerCase().includes(term);
          return keyMatch || valueMatch;
        });
      };
      const matchingNodes = baseNodes.filter(node => matchesSearch(node));
      const matchingEdges = baseEdges.filter(edge => matchesSearch(edge));
      const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
      matchingEdges.forEach(e => { 
        if (e._from) nodeIdsToShow.add(e._from); 
        if (e._to) nodeIdsToShow.add(e._to); 
      });
      baseNodes = baseNodes.filter(n => nodeIdsToShow.has(n._id));
      baseEdges = matchingEdges;
    }

    // 2. تطبيق التركيز (Selection Focus) إذا تم اختيار عنصر
    if (selectedResultId) {
      const isSelectedNode = allRawNodes.some(n => n._id === selectedResultId);
      const isSelectedEdge = allRawEdges.some(e => e._id === selectedResultId);

      if (isSelectedNode) {
        const connectedEdges = allRawEdges.filter(e => e._from === selectedResultId || e._to === selectedResultId);
        const neighborNodeIds = new Set([selectedResultId]);
        connectedEdges.forEach(e => {
          neighborNodeIds.add(e._from);
          neighborNodeIds.add(e._to);
        });
        
        return {
          nodes: allRawNodes.filter(n => neighborNodeIds.has(n._id)),
          edges: connectedEdges
        };
      } else if (isSelectedEdge) {
        const targetEdge = allRawEdges.find(e => e._id === selectedResultId);
        if (targetEdge) {
          const edgeNodeIds = new Set([targetEdge._from, targetEdge._to]);
          return {
            nodes: allRawNodes.filter(n => edgeNodeIds.has(n._id)),
            edges: [targetEdge]
          };
        }
      }
    }

    return { nodes: baseNodes, edges: baseEdges };
  }, [allRawNodes, allRawEdges, resultSearchTerm, selectedResultId]);

  const applyLayout = useCallback((mode = layoutMode) => {
    const rawNodes = filteredData.nodes.map((item) => ({
      id: item._id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: { 
        label: item.label || (item._id && String(item._id).includes('/') ? String(item._id).split('/')[0] : "Unknown"),
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

    let result;
    if (mode === 'tree') {
      result = getTreeLayoutedElements(rawNodes, rawEdges);
    } else {
      result = getGridLayoutedElements(rawNodes, rawEdges);
    }

    setNodes(result.nodes);
    setEdges(result.edges);
    
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 50);
  }, [filteredData, layoutMode, setNodes, setEdges, fitView]);

  useEffect(() => {
    applyLayout();
  }, [applyLayout, layoutMode]);

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
        onNodeClick={(_, node) => isResultPathMode ? setResultPathNodes(prev => [...prev, node.id].length === 2 ? (executeShortestPath(prev[0], node.id), []) : [...prev, node.id]) : setSelectedResultId(prev => prev === node.id ? null : node.id)}
        onEdgeClick={(_, edge) => !isResultPathMode && setSelectedResultId(prev => prev === edge.id ? null : edge.id)}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)}
        onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)}
        onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        
        <Panel position="bottom-right" className="m-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur p-1 rounded-lg border shadow-sm flex items-center gap-1">
            <Button 
              variant={layoutMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setLayoutMode('grid')}
            >
              <LayoutGrid size={14} />
              شبكة (Grid)
            </Button>
            <Button 
              variant={layoutMode === 'tree' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setLayoutMode('tree')}
            >
              <GitGraph size={14} />
              شجري (Tree)
            </Button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 self-center" />

          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2 h-10"
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