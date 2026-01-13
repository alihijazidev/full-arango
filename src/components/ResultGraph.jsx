import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, Activity, Zap } from 'lucide-react';
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
  const { fitView, setCenter } = useReactFlow();
  const [isSimulating, setIsSimulating] = useState(false);
  
  const simulationRef = useRef(null);

  const allRawNodes = useMemo(() => {
    return [...(data.startnode || []), ...(data.targetnode || [])];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!resultSearchTerm) return { nodes: allRawNodes, edges: data.edges || [] };
    const term = resultSearchTerm.toLowerCase();
    
    const matchingNodes = allRawNodes.filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      return inId || inLabel;
    });

    const matchingEdges = (data.edges || []).filter(edge => {
      return edge._from.toLowerCase().includes(term) || edge._to.toLowerCase().includes(term) || edge.label.toLowerCase().includes(term);
    });

    const nodeIdsToShow = new Set(matchingNodes.map(n => n._id));
    matchingEdges.forEach(e => { nodeIdsToShow.add(e._from); nodeIdsToShow.add(e._to); });

    return {
      nodes: allRawNodes.filter(n => nodeIdsToShow.has(n._id)),
      edges: matchingEdges
    };
  }, [allRawNodes, data.edges, resultSearchTerm]);

  // وظيفة تشغيل المحاكاة الفيزيائية لتوزيع العقد
  const runSimulation = useCallback((initialNodes, initialEdges) => {
    if (simulationRef.current) simulationRef.current.stop();
    
    setIsSimulating(true);

    // تجهيز البيانات للمحاكاة
    const d3Nodes = initialNodes.map(n => ({ ...n, x: Math.random() * 500, y: Math.random() * 500 }));
    const d3Links = initialEdges.map(e => ({ source: e.source, target: e.target }));

    const simulation = forceSimulation(d3Nodes)
      .force("link", forceLink(d3Links).id(d => d.id).distance(150).strength(1))
      .force("charge", forceManyBody().strength(-1000)) // تنافر قوي لمنع التداخل
      .force("x", forceX().strength(0.1))
      .force("y", forceY().strength(0.1))
      .force("center", forceCenter(0, 0));

    simulation.on("tick", () => {
      setNodes(d3Nodes.map(node => ({
        ...node,
        position: { x: node.x, y: node.y }
      })));
    });

    simulation.on("end", () => {
      setIsSimulating(false);
      fitView({ duration: 800, padding: 0.2 });
    });

    simulationRef.current = simulation;
  }, [setNodes, fitView]);

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

    setEdges(rawEdges);
    runSimulation(rawNodes, rawEdges);

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [filteredData, runSimulation, setEdges]);

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
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur shadow-md gap-2"
            onClick={() => runSimulation(nodes, edges)}
            disabled={isSimulating}
          >
            {isSimulating ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />}
            إعادة المحاكاة (Force)
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