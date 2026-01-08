import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMetadata } from '../services/mockApi';
import { addEdge } from 'reactflow';

const GraphContext = createContext(undefined);

export const GraphProvider = ({ children }) => {
  const [metadata, setMetadata] = useState({ collections: [], edges: [] });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [queryResult, setQueryResult] = useState(null);
  const [shortestPathResult, setShortestPathResult] = useState(null);
  const [activeResultType, setActiveResultType] = useState('query');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  
  const [isResultPathMode, setIsResultPathMode] = useState(false);
  const [resultPathNodes, setResultPathNodes] = useState([]);

  const [edgeStyle, _setEdgeStyle] = useState('parallel');
  const [isAnimated, _setIsAnimated] = useState(true);
  const [isAutoConnect, _setIsAutoConnect] = useState(false);

  useEffect(() => {
    fetchMetadata().then(setMetadata);
  }, []);

  const getParallelEdgeOffset = (source, target, existingEdges) => {
    const parallelEdges = existingEdges.filter(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
    );
    const count = parallelEdges.length;
    if (count === 0) return 0;
    const step = 40;
    const direction = count % 2 === 0 ? -1 : 1;
    return direction * Math.ceil(count / 2) * step;
  };

  const performAutoConnect = useCallback((currentNodes, currentEdges) => {
    let updatedEdges = [...currentEdges];
    const newEdges = [];
    
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

  const setIsAutoConnect = (val) => {
    _setIsAutoConnect(val);
    if (val) {
      performAutoConnect(nodes, edges);
    }
  };

  const setEdgeStyle = (newStyle) => {
    _setEdgeStyle(newStyle);
    setEdges((eds) => eds.map((e) => ({ ...e, type: newStyle })));
  };

  const setIsAnimated = (val) => {
    _setIsAnimated(val);
    setEdges((eds) => eds.map((e) => ({ ...e, animated: val })));
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const offset = getParallelEdgeOffset(params.source, params.target, eds);
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
    
    const startNodes = nodes.map((n) => ({ 
      _id: `${n.data.label}/mock-${Math.floor(Math.random() * 1000)}`, 
      label: n.data.label,
      designedNodeId: n.id
    }));

    const resultEdges = [];
    edges.forEach(edge => {
      const sourceInResults = startNodes.find(n => n.designedNodeId === edge.source);
      const targetInResults = startNodes.find(n => n.designedNodeId === edge.target);
      
      if (sourceInResults && targetInResults) {
        resultEdges.push({
          _id: `edge/${edge.label}-${Math.floor(Math.random() * 1000)}`,
          _from: sourceInResults._id,
          _to: targetInResults._id,
          label: edge.label
        });
      }
    });

    setQueryResult({ 
      startnode: startNodes, 
      targetnode: [], 
      edges: resultEdges 
    });
    setActiveResultType('query');
    setIsQueryLoading(false);
  };

  const executeShortestPath = async (fromId, toId) => {
    setIsQueryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = {
      startnode: [{ _id: fromId, label: fromId.split('/')[0] || 'Start' }],
      targetnode: [{ _id: toId, label: toId.split('/')[0] || 'End' }],
      edges: [{ _id: 'edge/shortest', _from: fromId, _to: toId, label: 'أقصر مسار' }]
    };

    setShortestPathResult(result);
    setActiveResultType('shortestPath');
    setIsResultPathMode(false);
    setResultPathNodes([]);
    setIsQueryLoading(false);
  };

  const addEdgeManually = (edgeName) => {
    const edgeMeta = metadata.edges.find(e => e.name === edgeName);
    if (!edgeMeta) return;

    const newEdges = [];
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

  const addNodeFromMetadata = (type, name, position) => {
    const id = `${type}-${name}-${Date.now()}`;
    const newNode = {
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

  const updateFilters = (id, isNode, filters) => {
    if (isNode) {
      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, filters } } : n));
    } else {
      setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, filters } } : e));
    }
  };

  const updateEdgeOffset = (id, offset) => {
    setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, offset } } : e));
  };

  const deleteElement = (id, isNode) => {
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
      addNodeFromMetadata, addEdgeManually, updateFilters, updateEdgeOffset, deleteElement, clearCanvas,
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