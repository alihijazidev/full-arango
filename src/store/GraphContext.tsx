import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CollectionMetadata, EdgeMetadata, Filter } from '../types/arango';
import { fetchMetadata } from '../services/mockApi';
import { Node, Edge, Connection, addEdge } from 'reactflow';

interface QueryResult {
  startnode: any[];
  targetnode: any[];
  edges: any[];
}

interface GraphContextType {
  metadata: { collections: CollectionMetadata[]; edges: EdgeMetadata[] };
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onConnect: (params: Connection) => void;
  addNodeFromMetadata: (type: 'collection' | 'category', name: string, position: { x: number; y: number }) => void;
  addEdgeManually: (edgeName: string) => void;
  updateFilters: (id: string, isNode: boolean, filters: Filter[]) => void;
  deleteElement: (id: string, isNode: boolean) => void;
  clearCanvas: () => void;
  executeStructuredQuery: () => Promise<void>;
  queryResult: QueryResult | null;
  isQueryLoading: boolean;
  setQueryResult: (res: QueryResult | null) => void;
  highlightedId: string | null;
  setHighlightedId: (id: string | null) => void;
  edgeStyle: string;
  setEdgeStyle: (style: string) => void;
  isAnimated: boolean;
  setIsAnimated: (val: boolean) => void;
  isAutoConnect: boolean;
  setIsAutoConnect: (val: boolean) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<{ collections: CollectionMetadata[]; edges: EdgeMetadata[] }>({ collections: [], edges: [] });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [edgeStyle, _setEdgeStyle] = useState<string>('smoothstep');
  const [isAnimated, _setIsAnimated] = useState<boolean>(true);
  const [isAutoConnect, setIsAutoConnect] = useState<boolean>(false);

  useEffect(() => {
    fetchMetadata().then(setMetadata);
  }, []);

  const setEdgeStyle = (newStyle: string) => {
    _setEdgeStyle(newStyle);
    setEdges((eds) => eds.map((e) => ({ ...e, type: newStyle })));
  };

  const setIsAnimated = (val: boolean) => {
    _setIsAnimated(val);
    setEdges((eds) => eds.map((e) => ({ ...e, animated: val })));
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      animated: isAnimated, 
      type: edgeStyle,
      data: { filters: [] }
    }, eds));
  }, [edgeStyle, isAnimated]);

  const executeStructuredQuery = async () => {
    setIsQueryLoading(true);
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const startNodes: any[] = [];
    const targetNodes: any[] = [];
    const queryEdges: any[] = [];

    // Mock data generation based on actual nodes/edges on canvas
    nodes.forEach((node, index) => {
      const isStart = index === 0;
      const mockRecord = {
        _id: `${node.data.label}/${index + 100}`,
        _key: `${index + 100}`,
        label: node.data.label,
        type: node.data.type,
        ...(node.data.metadata?.attributes || []).reduce((acc: any, attr: string) => {
          acc[attr] = "Mock Value";
          return acc;
        }, {})
      };
      
      if (isStart) startNodes.push(mockRecord);
      else targetNodes.push(mockRecord);
    });

    edges.forEach((edge, index) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      const sourceIdx = nodes.indexOf(sourceNode!);
      const targetIdx = nodes.indexOf(targetNode!);

      queryEdges.push({
        _id: `${edge.label || 'edge'}/${index + 500}`,
        _key: `${index + 500}`,
        _from: `${sourceNode?.data.label}/${sourceIdx + 100}`,
        _to: `${targetNode?.data.label}/${targetIdx + 100}`,
        label: edge.label || 'Connection',
        ...(edge.data?.metadata?.attributes || []).reduce((acc: any, attr: string) => {
          acc[attr] = "Edge Value";
          return acc;
        }, {})
      });
    });

    setQueryResult({
      startnode: startNodes,
      targetnode: targetNodes,
      edges: queryEdges
    });
    setIsQueryLoading(false);
  };

  const addEdgeManually = (edgeName: string) => {
    const edgeMeta = metadata.edges.find(e => e.name === edgeName);
    if (!edgeMeta) return;

    const newEdges: Edge[] = [];
    nodes.forEach(sourceNode => {
      nodes.forEach(targetNode => {
        if (sourceNode.id === targetNode.id) return;
        const sourceColls = sourceNode.data.type === 'collection' ? [sourceNode.data.label] : sourceNode.data.metadata?.collections || [];
        const targetColls = targetNode.data.type === 'collection' ? [targetNode.data.label] : targetNode.data.metadata?.collections || [];

        if (sourceColls.includes(edgeMeta.from) && targetColls.includes(edgeMeta.to)) {
          const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.name}`;
          if (!edges.find(e => e.id === edgeId)) {
            newEdges.push({
              id: edgeId,
              source: sourceNode.id,
              target: targetNode.id,
              label: edgeMeta.name,
              type: edgeStyle,
              animated: isAnimated,
              data: { metadata: edgeMeta, filters: [] }
            });
          }
        }
      });
    });
    if (newEdges.length > 0) setEdges((eds) => [...eds, ...newEdges]);
  };

  const addNodeFromMetadata = (type: 'collection' | 'category', name: string, position: { x: number; y: number }) => {
    const id = `${type}-${name}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'customNode',
      position,
      data: {
        label: name,
        type,
        metadata: type === 'collection' 
          ? metadata.collections.find(c => c.name === name)
          : { category: name, collections: metadata.collections.filter(c => c.category === name).map(c => c.name) },
        filters: []
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateFilters = (id: string, isNode: boolean, filters: Filter[]) => {
    if (isNode) {
      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, filters } } : n));
    } else {
      setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, filters } } : e));
    }
  };

  const deleteElement = (id: string, isNode: boolean) => {
    if (isNode) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    } else {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <GraphContext.Provider value={{ 
      metadata, nodes, edges, setNodes, setEdges, onConnect, 
      addNodeFromMetadata, addEdgeManually, updateFilters, deleteElement, clearCanvas,
      executeStructuredQuery, queryResult, isQueryLoading, setQueryResult,
      highlightedId, setHighlightedId,
      edgeStyle, setEdgeStyle, isAnimated, setIsAnimated, isAutoConnect, setIsAutoConnect
    }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) throw new Error('useGraph must be used within GraphProvider');
  return context;
};