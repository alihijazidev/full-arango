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
  const [resultSearchTerm, setResultSearchTerm] = useState('');

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

          const sourcePath = sourceNode.data.fullPath;
          const targetPath = targetNode.data.fullPath;

          const edgeFromStr = Array.isArray(edgeMeta.fromcol) ? edgeMeta.fromcol.join('/') : edgeMeta.fromcol;
          const edgeToStr = Array.isArray(edgeMeta.tocol) ? edgeMeta.tocol.join('/') : edgeMeta.tocol;

          const isSourceMatch = edgeFromStr === sourcePath || edgeFromStr.startsWith(sourcePath + '/');
          const isTargetMatch = edgeToStr === targetPath || edgeToStr.startsWith(targetPath + '/');

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
                data: { metadata: edgeMeta, filters: [], offset, depth: 1 }
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
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      const sourcePath = sourceNode?.data?.fullPath || '';
      const targetPath = targetNode?.data?.fullPath || '';

      const edgeMeta = metadata.edges.find(e => {
        const fromStr = Array.isArray(e.fromcol) ? e.fromcol.join('/') : e.fromcol;
        const toStr = Array.isArray(e.tocol) ? e.tocol.join('/') : e.tocol;
        return (fromStr === sourcePath || fromStr.startsWith(sourcePath + '/')) && 
               (toStr === targetPath || toStr.startsWith(targetPath + '/'));
      });

      const offset = getParallelEdgeOffset(params.source, params.target, eds);
      
      return addEdge({ 
        ...params, 
        label: edgeMeta?.label || null,
        animated: isAnimated, 
        type: 'parallel',
        data: { 
          metadata: edgeMeta || { 
            fromcol: sourcePath.split('/'), 
            tocol: targetPath.split('/'), 
            label: 'رابط يدوي', 
            attributes: [], 
            isManual: true 
          },
          filters: [], 
          offset,
          depth: 1 
        }
      }, eds);
    });
  }, [isAnimated, nodes, metadata.edges]);

  const executeStructuredQuery = async () => {
    setIsQueryLoading(true);
    const structuredQuery = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return {
        sourceNode: { id: sourceNode.id, label: sourceNode.data.label, type: sourceNode.data.type, path: sourceNode.data.fullPath, filters: sourceNode.data.filters },
        edge: { id: edge.id, label: edge.label || edge.data?.metadata?.label || "manual", depth: edge.data?.depth || 1, filters: edge.data?.filters || [] },
        targetNode: { id: targetNode.id, label: targetNode.data.label, type: targetNode.data.type, path: targetNode.data.fullPath, filters: targetNode.data.filters }
      };
    });
    console.log("Structured Query Request:", structuredQuery);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockResultNodes = nodes.map((n) => ({ 
      _id: `${n.data.label}/mock-${Math.floor(Math.random() * 1000)}`, 
      label: n.data.label,
      designedNodeId: n.id
    }));
    const mockResultEdges = [];
    edges.forEach(edge => {
      const sourceInResults = mockResultNodes.find(n => n.designedNodeId === edge.source);
      const targetInResults = mockResultNodes.find(n => n.designedNodeId === edge.target);
      if (sourceInResults && targetInResults) {
        mockResultEdges.push({
          _id: `edge/${edge.label || 'manual'}-${Math.floor(Math.random() * 1000)}`,
          _from: sourceInResults._id,
          _to: targetInResults._id,
          label: edge.label || 'manual'
        });
      }
    });
    setQueryResult({ startnode: mockResultNodes, targetnode: [], edges: mockResultEdges });
    setActiveResultType('query');
    setIsQueryLoading(false);
  };

  const executeShortestPath = async (fromId, toId) => {
    setIsQueryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const pathNodes = queryResult.startnode.filter(n => n._id === fromId || n._id === toId);
    const pathEdges = queryResult.edges.filter(e => 
      (e._from === fromId && e._to === toId) || (e._to === fromId && e._from === toId)
    );
    setShortestPathResult({ startnode: pathNodes, targetnode: [], edges: pathEdges });
    setActiveResultType('shortestPath');
    setIsQueryLoading(false);
    setIsResultPathMode(false);
    setResultPathNodes([]);
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
        const fromStr = Array.isArray(edgeMeta.fromcol) ? edgeMeta.fromcol.join('/') : edgeMeta.fromcol;
        const toStr = Array.isArray(edgeMeta.tocol) ? edgeMeta.tocol.join('/') : edgeMeta.tocol;
        const isSourceMatch = fromStr === sourcePath || fromStr.startsWith(sourcePath + '/');
        const isTargetMatch = toStr === targetPath || toStr.startsWith(targetPath + '/');
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
              data: { metadata: edgeMeta, filters: [], offset, depth: 1 }
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
      data: { label: name, type, fullPath, categoryName, metadata: nodeMetadata, filters: [] }
    };
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      if (isAutoConnect) setTimeout(() => performAutoConnect(updatedNodes, edges), 0);
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

  const updateEdgeDepth = (id, depth) => {
    setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, depth: parseInt(depth) || 1 } } : e));
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
      addNodeFromMetadata, addEdgeManually, updateFilters, updateEdgeOffset, updateEdgeDepth, deleteElement, clearCanvas,
      executeStructuredQuery, executeShortestPath, queryResult, shortestPathResult,
      activeResultType, setActiveResultType, isQueryLoading, setQueryResult, setShortestPathResult,
      highlightedId, setHighlightedId, isResultPathMode, setIsResultPathMode,
      resultPathNodes, setResultPathNodes,
      isAnimated, setIsAnimated, isAutoConnect, setIsAutoConnect,
      resultSearchTerm, setResultSearchTerm
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