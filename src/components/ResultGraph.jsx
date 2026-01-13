import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, LayoutTemplate } from 'lucide-react';
import { Button } from './ui/button';
import dagre from 'dagre';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

// وظيفة لحساب مواقع العقد بشكل تلقائي ومنظم
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 200;
  const nodeHeight = 120;

  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

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
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
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
  const { fitView, setCenter } = useReactFlow();

  const allRawNodes = useMemo(() => {
    return [...(data.startnode || []), ...(data.targetnode || [])];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!resultSearchTerm) return { nodes: allRawNodes, edges: data.edges || [] };
    
    const term = resultSearchTerm.toLowerCase();
    
    const matchingNodes = allRawNodes.filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      const inProps = Object.entries(node).some(([key, value]) => {
        if (key.startsWith('_') || key === 'label' || key === 'type' || key === 'designedNodeId') return false;
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
      return inId || inLabel || inProps;
    });

    const matchingEdges = (data.edges || []).filter(edge => {
      const inFrom = edge._from ? String(edge._from).toLowerCase().includes(term) : false;
      const inTo = edge._to ? String(edge._to).toLowerCase().includes(term) : false;
      const inLabel = edge.label ? String(edge.label).toLowerCase().includes(term) : false;
      return inFrom || inTo || inLabel;
    });

    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => {
      nodeIdsToShow.add(e._from);
      nodeIdsToShow.add(e._to);
    });

    return {
      nodes: allRawNodes.filter(n => nodeIdsToShow.has(n._id)),
      edges: matchingEdges
    };
  }, [allRawNodes, data.edges, resultSearchTerm]);

  useEffect(() => {
    const rawNodes = filteredData.nodes.map((item) => {
      const collectionName = item.label || (item._id && item._id.includes('/') ? item._id.split('/')[0] : "Unknown");
      return {
        id: item._id,
        type: 'customNode',
        position: { x: 0, y: 0 }, // سيتم تحديثها بواسطة dagre
        data: { 
          label: collectionName,
          instanceId: item._id,
          type: 'collection',
          metadata: item 
        },
      };
    });

    const getResultOffset = (source, target, idx, all) => {
      const samePair = all.filter(e => (e._from === source && e._to === target) || (e._from === target && e._to === source));
      if (samePair.length <= 1) return 0;
      const pairIdx = samePair.findIndex(e => e._id === all[idx]._id);
      const direction = pairIdx % 2 === 0 ? -1 : 1;
      return direction * Math.ceil(pairIdx / 2) * 40;
    };

    const rawEdges = filteredData.edges.map((edge, i) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      type: 'parallel',
      animated: true,
      data: { 
        offset: getResultOffset(edge._from, edge._to, i, filteredData.edges),
        metadata: edge 
      },
    }));

    // تطبيق التخطيط الذكي
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    const timer = setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 200);
    return () => clearTimeout(timer);
  }, [filteredData, setNodes, setEdges, fitView]);

  useEffect(() => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      selected: selectedResultId === node.id || resultPathNodes.includes(node.id) || highlightedId === node.id
    })));
    
    setEdges((eds) => eds.map((edge) => ({
      ...edge,
      selected: selectedResultId === edge.id || highlightedId === edge.id,
      style: (selectedResultId === edge.id || highlightedId === edge.id) 
        ? { stroke: 'hsl(var(--primary))', strokeWidth: 3 } 
        : {}
    })));
  }, [selectedResultId, resultPathNodes, highlightedId, setNodes, setEdges]);

  useEffect(() => {
    if (!selectedResultId) return;
    
    const node = nodes.find(n => n.id === selectedResultId);
    if (node) {
      setCenter(node.position.x + 60, node.position.y + 50, { zoom: 1.2, duration: 800 });
      return;
    }

    const edge = edges.find(e => e.id === selectedResultId);
    if (edge) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const midX = (sourceNode.position.x + targetNode.position.x) / 2;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2;
        setCenter(midX + 60, midY + 50, { zoom: 1.2, duration: 800 });
      }
    }
  }, [selectedResultId, nodes, edges, setCenter]);

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
    } else {
      setSelectedResultId(node.id);
    }
  }, [isResultPathMode, setResultPathNodes, executeShortestPath, setSelectedResultId]);

  const onEdgeClick = useCallback((_, edge) => {
    if (!isResultPathMode) {
      setSelectedResultId(edge.id);
    }
  }, [isResultPathMode, setSelectedResultId]);

  const reLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ duration: 800 }), 100);
  };

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
        onEdgeClick={onEdgeClick}
        onNodeMouseEnter={(_, node) => setHighlightedId(node.id)}
        onNodeMouseLeave={() => setHighlightedId(null)}
        onEdgeMouseEnter={(_, edge) => setHighlightedId(edge.id)}
        onEdgeMouseLeave={() => setHighlightedId(null)}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        
        <Panel position="bottom-right" className="m-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={reLayout}
          >
            <LayoutTemplate size={14} />
            إعادة التنظيم
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={() => fitView({ duration: 800 })}
          >
            <Maximize2 size={14} />
            تكبير الاحتواء
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

export const ResultGraph = (props) => (
  <ReactFlowProvider>
    <ResultGraphInner {...props} />
  </ReactFlowProvider>
);