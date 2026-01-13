import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, Panel, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { MapPinned, Maximize2, LayoutTemplate, Zap } from 'lucide-react';
import { Button } from './ui/button';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

// إعدادات ELK للتوزيع الذكي
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeLayered': '100',
  'elk.spacing.nodeNode': '80',
  'elk.edgeRouting': 'SPLINES',
};

const getLayoutedElements = async (nodes, edges) => {
  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      ...node,
      width: 180,
      height: 100,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    
    return {
      nodes: nodes.map((node) => {
        const layoutedNode = layoutedGraph.children.find((n) => n.id === node.id);
        return {
          ...node,
          position: { x: layoutedNode.x, y: layoutedNode.y },
        };
      }),
      edges,
    };
  } catch (error) {
    console.error('ELK Layout Error:', error);
    return { nodes, edges };
  }
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
  const [isLayouting, setIsLayouting] = useState(false);

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

  const applyLayout = useCallback(async (currentNodes, currentEdges) => {
    setIsLayouting(true);
    const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setIsLayouting(false);
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
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

    const rawEdges = filteredData.edges.map((edge, i) => ({
      id: edge._id,
      source: edge._from,
      target: edge._to,
      label: edge.label,
      type: 'parallel',
      animated: true,
      data: { offset: 0, metadata: edge },
    }));

    applyLayout(rawNodes, rawEdges);
  }, [filteredData, applyLayout]);

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
            onClick={() => applyLayout(nodes, edges)}
            disabled={isLayouting}
          >
            {isLayouting ? <Zap size={14} className="animate-spin" /> : <LayoutTemplate size={14} />}
            إعادة التوزيع (ELK)
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