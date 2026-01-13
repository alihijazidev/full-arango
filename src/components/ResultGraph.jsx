import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, Zap, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
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
  const [isSimulating, setIsSimulating] = useState(false);

  const allRawNodes = useMemo(() => {
    return [...(data.startnode || []), ...(data.targetnode || [])];
  }, [data]);

  // تصفية البيانات بناءً على البحث
  const filteredData = useMemo(() => {
    if (!resultSearchTerm) return { nodes: allRawNodes, edges: data.edges || [] };
    const term = resultSearchTerm.toLowerCase();
    
    const matchingNodes = allRawNodes.filter(node => {
      return (node._id && node._id.toLowerCase().includes(term)) || 
             (node.label && node.label.toLowerCase().includes(term));
    });

    const matchingEdges = (data.edges || []).filter(edge => {
      return edge._from.toLowerCase().includes(term) || 
             edge._to.toLowerCase().includes(term) || 
             edge.label.toLowerCase().includes(term);
    });

    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => { nodeIdsToShow.add(e._from); nodeIdsToShow.add(e._to); });

    return {
      nodes: allRawNodes.filter(n => nodeIdsToShow.has(n._id)),
      edges: matchingEdges
    };
  }, [allRawNodes, data.edges, resultSearchTerm]);

  // تطبيق توزيع القوى (Force Layout)
  const runSimulation = useCallback((initialNodes, initialEdges) => {
    setIsSimulating(true);

    // تحويل البيانات لتناسب d3-force
    const simulationNodes = initialNodes.map(n => ({ ...n, x: Math.random() * 500, y: Math.random() * 500 }));
    const simulationLinks = initialEdges.map(e => ({ 
      source: e.source, 
      target: e.target,
      id: e.id
    }));

    const simulation = forceSimulation(simulationNodes)
      .force("link", forceLink(simulationLinks).id(d => d.id).distance(150).strength(1))
      .force("charge", forceManyBody().strength(-800)) // قوة تنافر قوية لمنع التداخل
      .force("center", forceCenter(window.innerWidth / 4, window.innerHeight / 4))
      .force("x", forceX().strength(0.1))
      .force("y", forceY().strength(0.1))
      .stop();

    // تشغيل المحاكاة لعدد من الخطوات للوصول للاستقرار
    for (let i = 0; i < 300; ++i) simulation.tick();

    const layoutedNodes = simulationNodes.map(node => ({
      ...initialNodes.find(n => n.id === node.id),
      position: { x: node.x, y: node.y }
    }));

    setNodes(layoutedNodes);
    setEdges(initialEdges);
    setIsSimulating(false);
    
    setTimeout(() => fitView({ duration: 1000, padding: 0.2 }), 100);
  }, [setNodes, setEdges, fitView]);

  useEffect(() => {
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

    if (rawNodes.length > 0) {
      runSimulation(rawNodes, rawEdges);
    }
  }, [filteredData, runSimulation]);

  // تحديث حالة التحديد (Selection)
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
        <Background color="#f8fafc" gap={20} variant="dots" />
        
        <Panel position="bottom-right" className="m-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white shadow-md gap-2 border-primary/20 text-primary"
            onClick={() => runSimulation(nodes, edges)}
            disabled={isSimulating}
          >
            {isSimulating ? <Zap size={14} className="animate-spin" /> : <Share2 size={14} />}
            توزيع القوى (Force)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white shadow-md gap-2"
            onClick={() => fitView({ duration: 800 })}
          >
            <Maximize2 size={14} />
            احتواء
          </Button>
        </Panel>

        {isResultPathMode && (
          <Panel position="top-center" className="bg-amber-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce mt-4">
            <p className="text-xs font-bold flex items-center gap-2">
              <MapPinned size={16} />
              {resultPathNodes.length === 0 ? 'حدد عقدة البداية' : 'حدد عقدة النهاية'}
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