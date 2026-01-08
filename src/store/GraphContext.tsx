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
  executeShortestPath: (fromId: string, toId: string) => Promise<void>;
  queryResult: QueryResult | null;
  shortestPathResult: QueryResult | null;
  activeResultType: 'query' | 'shortestPath';
  setActiveResultType: (type: 'query' | 'shortestPath') => void;
  isQueryLoading: boolean;
  setQueryResult: (res: QueryResult | null) => void;
  setShortestPathResult: (res: QueryResult | null) => void;
  highlightedId: string | null;
  setHighlightedId: (id: string | null) => void;
  isResultPathMode: boolean;
  setIsResultPathMode: (val: boolean) => void;
  resultPathNodes: string[];
  setResultPathNodes: React.Dispatch<React.SetStateAction<string[]>>;
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
  const [shortestPathResult, setShortestPathResult] = useState<QueryResult | null>(null);
  const [activeResultType, setActiveResultType] = useState<'query' | 'shortestPath'>('query');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  const [isResultPathMode, setIsResultPathMode] = useState(false);
  const [resultPathNodes, setResultPathNodes] = useState<string[]>([]);

  const [edgeStyle, _setEdgeStyle] = useState<string>('parallel');
  const [isAnimated, _setIsAnimated] = useState<boolean>(true);
  const [isAutoConnect, _setIsAutoConnect] = useState<boolean>(false);

  useEffect(() => {
    fetchMetadata().then(setMetadata);
  }, []);

  // Helper to calculate offset for parallel edges
  const getParallelEdgeOffset = (source: string, target: string, existingEdges: Edge[]) => {
    const parallelEdges = existingEdges.filter(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
    );
    
    // Calculate offset based on count: 0, 30, -30, 60, -60...
    const count = parallelEdges.length;
    if (count === 0) return 0;
    const step = 40;
    const direction = count % 2 === 0 ? -1 : 1;
    return direction * Math.ceil(count / 2) * step;
  };

  const performAutoConnect = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    let updatedEdges = [...currentEdges];
    const newEdges: Edge[] = [];
    
    metadata.edges.forEach(edgeMeta => {
      currentNodes.forEach(sourceNode => {
        currentNodes.forEach(targetNode => {
          if (sourceNode.id === targetNode.id) return;

          const sourceColls = sourceNode.data.type === 'collection' ? [sourceNode.data.label] : sourceNode.data.metadata?.collections || [];
          const targetColls = targetNode.data.type === 'collection' ? [targetNode.data.label] : targetNode.data.metadata?.collections || [];

          if (sourceColls.includes(edgeMeta.from) && targetColls.includes(edgeMeta.to)) {
            const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.name}`;
            const alreadyExists = updatedEdges.some(e => e.id === edgeId) || newEdges.some(e => e.id === edgeId);
            
            if (!alreadyExists) {
              const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...updatedEdges, ...newEdges]);
              newEdges.push({
                id: edgeId,
                source: sourceNode.id,
                target: targetNode.id,
                label: edgeMeta.name,
                type: 'parallel',
                animated: isAnimated,
                data: { metadata: edgeMeta, filters: [], offset }
              });
            }
          }
        });
      });
    });

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [metadata.edges, isAnimated]);

  const setIsAutoConnect = (val: boolean) => {
    _setIsAutoConnect(val);
    if (val) {
      performAutoConnect(nodes, edges);
    }
  };

  const setEdgeStyle = (newStyle: string) => {
    _setEdgeStyle(newStyle);
    setEdges((eds) => eds.map((e) => ({ ...e, type: newStyle })));
  };

  const setIsAnimated = (val: boolean) => {
    _setIsAnimated(val);
    setEdges((eds) => eds.map((e) => ({ ...e, animated: val })));
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const offset = getParallelEdgeOffset(params.source!, params.target!, eds);
      return addEdge({ 
        ...params, 
        animated: isAnimated, 
        type: 'parallel',
        data: { filters: [], offset }
      }, eds);
    });
  }, [isAnimated]);

  const executeStructuredQuery = async () => {
    setIsQueryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const startNodes = nodes.map((n) => ({ _id: `node/${n.id}`, label: n.data.label }));
    setQueryResult({ startnode: startNodes, targetnode: [], edges: [] });
    setActiveResultType('query');
    setIsQueryLoading(false);
  };

  const executeShortestPath = async (fromId: string, toId: string) => {
    setIsQueryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = {
      startnode: [{ _id: fromId, label: fromId.split('/')[1] || 'Start' }],
      targetnode: [{ _id: toId, label: toId.split('/')[1] || 'End' }],
      edges: [{ _id: 'edge/shortest', _from: fromId, _to: toId, label: 'أقصر مسار' }]
    };

    setShortestPathResult(result);
    setActiveResultType('shortestPath');
    setIsResultPathMode(false);
    setResultPathNodes([]);
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
            const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...edges, ...newEdges]);
            newEdges.push({
              id: edgeId,
              source: sourceNode.id,
              target: targetNode.id,
              label: edgeMeta.name,
              type: 'parallel',
              animated: isAnimated,
              data: { metadata: edgeMeta, filters: [], offset }
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
    
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      if (isAutoConnect) {
        setTimeout(() => performAutoConnect(updatedNodes, edges), 0);
      }
      return updatedNodes;
    });
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
      executeStructuredQuery, executeShortestPath, queryResult, shortestPathResult,
      activeResultType, setActiveResultType, isQueryLoading, setQueryResult, setShortestPathResult,
      highlightedId, setHighlightedId, isResultPathMode, setIsResultPathMode,
      resultPathNodes, setResultPathNodes,
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