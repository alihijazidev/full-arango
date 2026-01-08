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
    const newEdges = [];
    
    metadata.edges.forEach(edgeMeta => {
      currentNodes.forEach(sourceNode => {
        currentNodes.forEach(targetNode => {
          if (sourceNode.id === targetNode.id) return;

          // استخراج الهوية الكاملة للعقدة (Category/Collection)
          const sourcePath = sourceNode.data.fullPath; // "Category/Collection" or "Category"
          const targetPath = targetNode.data.fullPath;

          // التحقق من المطابقة: إما مطابقة كاملة للكيان أو مطابقة للفئة
          const isSourceMatch = edgeMeta.fromcol === sourcePath || edgeMeta.fromcol.startsWith(sourcePath + '/');
          const isTargetMatch = edgeMeta.tocol === targetPath || edgeMeta.tocol.startsWith(targetPath + '/');

          if (isSourceMatch && isTargetMatch) {
            const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.label}`;
            const alreadyExists = currentEdges.some(e => e.id === edgeId) || newEdges.some(e => e.id === edgeId);
            
            if (!alreadyExists) {
              const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...currentEdges, ...newEdges]);
              newEdges.push({
                id: edgeId,
                source: sourceNode.id,
                target: targetNode.id,
                label: edgeMeta.label,
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
    if (val) performAutoConnect(nodes, edges);
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

    setQueryResult({ startnode: startNodes, targetnode: [], edges: resultEdges });
    setActiveResultType('query');
    setIsQueryLoading(false);
  };

  const addEdgeManually = (edgeLabel) => {
    const edgeMeta = metadata.edges.find(e => e.label === edgeLabel);
    if (!edgeMeta) return;

    const newEdges = [];
    nodes.forEach(sourceNode => {
      nodes.forEach(targetNode => {
        if (sourceNode.id === targetNode.id) return;
        const sourcePath = sourceNode.data.fullPath;
        const targetPath = targetNode.data.fullPath;

        const isSourceMatch = edgeMeta.fromcol === sourcePath || edgeMeta.fromcol.startsWith(sourcePath + '/');
        const isTargetMatch = edgeMeta.tocol === targetPath || edgeMeta.tocol.startsWith(targetPath + '/');

        if (isSourceMatch && isTargetMatch) {
          const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.label}`;
          if (!edges.find(e => e.id === edgeId)) {
            const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...edges, ...newEdges]);
            newEdges.push({
              id: edgeId,
              source: sourceNode.id,
              target: targetNode.id,
              label: edgeMeta.label,
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

  const addNodeFromMetadata = (type, name, position, categoryName = null) => {
    const id = `${type}-${name}-${Date.now()}`;
    const fullPath = type === 'collection' ? `${categoryName}/${name}` : name;
    
    let nodeMetadata = null;
    if (type === 'category') {
      nodeMetadata = metadata.collections.find(c => c.name === name);
    } else {
      const cat = metadata.collections.find(c => c.name === categoryName);
      nodeMetadata = cat?.entities.find(e => e.name === name);
    }

    const newNode = {
      id,
      type: 'customNode',
      position,
      data: {
        label: name,
        type,
        fullPath,
        categoryName,
        metadata: nodeMetadata,
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
      executeStructuredQuery, queryResult, shortestPathResult,
      activeResultType, setActiveResultType, isQueryLoading, setQueryResult,
      highlightedId, setHighlightedId, isResultPathMode, setIsResultPathMode,
      resultPathNodes, setResultPathNodes,
      isAnimated, setIsAnimated, isAutoConnect, setIsAutoConnect
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