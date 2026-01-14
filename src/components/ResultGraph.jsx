import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, LayoutGrid, Network, GitGraph } from 'lucide-react';
import { Button } from './ui/button';
import dagre from 'dagre';
import { getArabicName } from '../utils/mapping';

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
    if (labelA !== labelB) return labelA.localeCompare(labelB);
    return String(a.id).localeCompare(String(b.id));
  });

  const layoutedNodes = sortedNodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return { ...node, position: { x: col * spacingX, y: row * spacingY } };
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
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return { ...node, position: { x: (nodeWithPosition?.x || 0) - nodeWidth / 2, y: (nodeWithPosition?.y || 0) - nodeHeight / 2 } };
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

  const allRawNodes = useMemo(() => [...(data?.startnode || []), ...(data?.targetnode || [])], [data]);

  const filteredData = useMemo(() => {
    const allEdges = data?.edges || [];
    if (!resultSearchTerm) return { nodes: allRawNodes, edges: allEdges };
    
    const term = resultSearchTerm.toLowerCase();
    const matchingNodes = allRawNodes.filter(node => {
      const inId = String(node._id || '').toLowerCase().includes(term);
      const inLabel = String(node.label || '').toLowerCase().includes(term);
      const inArabic = getArabicName(node.label).includes(term);
      const inProps = Object.entries(node).some(([key, val]) => 
        !key.startsWith('_') && String(val || '').toLowerCase().includes(term)
      );
      return inId || inLabel || inArabic || inProps;
    });

    const matchingEdges = allEdges.filter(edge => {
      const inBase = String(edge._from || '').toLowerCase().includes(term) || 
                     String(edge._to || '').toLowerCase().includes(term) || 
                     String(edge.label || '').toLowerCase().includes(term);
      const inProps = Object.entries(edge).some(([key, val]) => 
        !key.startsWith('_') && String(val || '').toLowerCase().includes(term)
      );
      return inBase || inProps;
    });

    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => { if (e._from) nodeIdsToShow.add(e._from); if (e._to) nodeIdsToShow.add(e._to); });

    return { nodes: allRawNodes.filter(n => nodeIdsToShow.has(n._id)), edges: matchingEdges };
  }, [allRawNodes, data?.edges, resultSearchTerm]);

  const applyLayout = useCallback((mode = layoutMode) => {
    const rawNodes = filteredData.nodes.map((item) => ({
      id: item._id, type: 'customNode', position: { x: 0, y: 0 },
      data: { label: item.label, instanceId: item._id, type: 'collection', metadata: item },
    }));
    const rawEdges = filteredData.edges.map((edge) => ({
      id: edge._id, source: edge._from, target: edge._to, label: edge.label, type: 'parallel', animated: true,
      data: { offset: 0, metadata: edge },
    }));
    const result = mode === 'tree' ? getTreeLayoutedElements(rawNodes, rawEdges) : getGridLayoutedElements(rawNodes, rawEdges);
    setNodes(result.nodes);
    setEdges(result.edges);
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 50);
  }, [filteredData, layoutMode, setNodes, setEdges, fitView]);

  useEffect(() => { applyLayout(); }, [applyLayout, layoutMode]);

  useEffect(() => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      selected: selectedResultId === node.id || resultPathNodes.includes(node.id) || highlightedId === node.id
    })));
  }, [selectedResultId, resultPathNodes, highlightedId, setNodes]);

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => isResultPathMode ? setResultPathNodes(prev => [...prev, node.id].length === 2 ? (executeShortestPath(prev[0], node.id), []) : [...prev, node.id]) : setSelectedResultId(node.id)}
        onEdgeClick={(_, edge) => !isResultPathMode && setSelectedResultId(edge.id)}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)} onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)} onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        <Panel position="bottom-right" className="m-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur p-1 rounded-lg border shadow-sm flex items-center gap-1">
            <Button variant={layoutMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-8 gap-2" onClick={() => setLayoutMode('grid')}><LayoutGrid size={14} /> شبكة (Grid)</Button>
            <Button variant={layoutMode === 'tree' ? 'default' : 'ghost'} size="sm" className="h-8 gap-2" onClick={() => setLayoutMode('tree')}><GitGraph size={14} /> شجري (Tree)</Button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1 self-center" />
          <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur shadow-md gap-2 h-10" onClick={() => fitView({ duration: 800 })}><Maximize2 size={14} /> احتواء</Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const ResultGraph = (props) => (
  <ReactFlowProvider>
    <ResultGraphInner {...props} />
  </ReactFlowProvider>
);