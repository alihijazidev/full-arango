import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMetadata } from '../services/mockApi';
import { addEdge } from 'reactflow';
import { toast } from "sonner";
import { getGridLayout, getCircularLayout, getTreeLayout, getForceLayout } from '../utils/layouts';

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
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [isResultPathMode, setIsResultPathMode] = useState(false);
  const [resultPathNodes, setResultPathNodes] = useState([]);
  const [isAnimated, setIsAnimated] = useState(true);
  const [isAutoConnect, setIsAutoConnect] = useState(false);
  const [resultSearchTerm, setResultSearchTerm] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState('dots');
  const [globalIcons, setGlobalIcons] = useState({});
  const [savedStates, setSavedStates] = useState([]);

  useEffect(() => {
    fetchMetadata().then(setMetadata);
    const saved = localStorage.getItem('arango_saved_states');
    if (saved) setSavedStates(JSON.parse(saved));
  }, []);

  // --- دوال التخطيط ---
  const applyLayout = useCallback((type) => {
    if (nodes.length === 0) return;
    
    let layoutedNodes = [];
    switch (type) {
      case 'grid': layoutedNodes = getGridLayout(nodes); break;
      case 'circular': layoutedNodes = getCircularLayout(nodes); break;
      case 'tree-tb': layoutedNodes = getTreeLayout(nodes, edges, 'TB'); break;
      case 'tree-lr': layoutedNodes = getTreeLayout(nodes, edges, 'LR'); break;
      case 'force': layoutedNodes = getForceLayout(nodes, edges); break;
      default: return;
    }
    
    setNodes(layoutedNodes);
    toast.success(`تم تطبيق التخطيط ${type}`);
  }, [nodes, edges]);

  // --- وظائف الحفظ المتعدد ---
  const saveCurrentState = useCallback((name) => {
    const newState = {
      id: Date.now().toString(),
      name: name || `نسخة ${new Date().toLocaleString('ar-EG')}`,
      timestamp: new Date().toISOString(),
      data: { nodes, edges, globalIcons }
    };
    const updatedStates = [newState, ...savedStates];
    setSavedStates(updatedStates);
    localStorage.setItem('arango_saved_states', JSON.stringify(updatedStates));
    toast.success(`تم حفظ النسخة "${newState.name}" بنجاح`);
  }, [nodes, edges, globalIcons, savedStates]);

  const loadSpecificState = useCallback((stateId) => {
    const target = savedStates.find(s => s.id === stateId);
    if (target) {
      const { nodes: n, edges: e, globalIcons: i } = target.data;
      setNodes(n || []);
      setEdges(e || []);
      setGlobalIcons(i || {});
      toast.success(`تم استعادة النسخة: ${target.name}`);
    }
  }, [savedStates]);

  const deleteSavedState = useCallback((stateId) => {
    const updated = savedStates.filter(s => s.id !== stateId);
    setSavedStates(updated);
    localStorage.setItem('arango_saved_states', JSON.stringify(updated));
    toast.info("تم حذف النسخة المحفوظة");
  }, [savedStates]);

  const exportGraph = useCallback(() => {
    const dataStr = JSON.stringify({ nodes, edges, globalIcons, exportedAt: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `graph-${Date.now()}.json`);
    linkElement.click();
    toast.success("بدأ تصدير المخطط");
  }, [nodes, edges, globalIcons]);

  const importGraph = useCallback((jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        setGlobalIcons(data.globalIcons || {});
        toast.success("تم استيراد المخطط بنجاح");
      }
    } catch (error) {
      toast.error("فشل استيراد الملف");
    }
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
          if ((edgeFromStr === sourcePath || edgeFromStr.startsWith(sourcePath + '/')) && 
              (edgeToStr === targetPath || edgeToStr.startsWith(targetPath + '/'))) {
            const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.label}`;
            if (!currentEdges.some(e => e.id === edgeId) && !newEdges.some(e => e.id === edgeId)) {
              const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...currentEdges, ...newEdges]);
              newEdges.push({
                id: edgeId, source: sourceNode.id, target: targetNode.id,
                label: edgeMeta.label, type: 'parallel', animated: isAnimated,
                data: { metadata: edgeMeta, filters: [], offset, depth: 1 }
              });
            }
          }
        });
      });
    });
    if (newEdges.length > 0) setEdges((eds) => [...eds, ...newEdges]);
  }, [metadata.edges, isAnimated]);

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
        ...params, label: edgeMeta?.label || 'رابط يدوي', animated: isAnimated, type: 'parallel',
        data: { metadata: edgeMeta || { fromcol: sourcePath.split('/'), tocol: targetPath.split('/'), label: 'رابط يدوي', attributes: [], isManual: true }, filters: [], offset, depth: 1 }
      }, eds);
    });
  }, [isAnimated, nodes, metadata.edges]);

  const executeStructuredQuery = async () => {
    setIsQueryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockResultNodes = nodes.map((n) => ({ _id: `${n.data.label}/mock-${Math.floor(Math.random() * 1000)}`, label: n.data.label, designedNodeId: n.id }));
    const mockResultEdges = [];
    edges.forEach(edge => {
      const sourceInResults = mockResultNodes.find(n => n.designedNodeId === edge.source);
      const targetInResults = mockResultNodes.find(n => n.designedNodeId === edge.target);
      if (sourceInResults && targetInResults) {
        mockResultEdges.push({ _id: `edge/${edge.label || 'manual'}-${Math.floor(Math.random() * 1000)}`, _from: sourceInResults._id, _to: targetInResults._id, label: edge.label || 'manual' });
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
    const pathEdges = queryResult.edges.filter(e => (e._from === fromId && e._to === toId) || (e._to === fromId && e._from === toId));
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
        if ((fromStr === sourcePath || fromStr.startsWith(sourcePath + '/')) && (toStr === targetPath || toStr.startsWith(targetPath + '/'))) {
          const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.label}`;
          if (!edges.find(e => e.id === edgeId)) {
            const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...edges, ...newEdges]);
            newEdges.push({ id: edgeId, source: sourceNode.id, target: targetNode.id, label: edgeMeta.label, type: 'parallel', animated: isAnimated, data: { metadata: edgeMeta, filters: [], offset, depth: 1 } });
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
    if (type === 'category') nodeMetadata = metadata.collections.find(c => c.name === name);
    else {
      const cat = metadata.collections.find(c => c.name === categoryName);
      nodeMetadata = cat?.entities.find(e => e.name === name);
    }
    const newNode = { id, type: 'customNode', position, data: { label: name, type, fullPath, categoryName, metadata: nodeMetadata, filters: [] } };
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      if (isAutoConnect) setTimeout(() => performAutoConnect(updatedNodes, edges), 0);
      return updatedNodes;
    });
  };

  const updateFilters = (id, isNode, filters) => {
    if (isNode) setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, filters } } : n));
    else setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, filters } } : e));
  };

  const updateNodeIcon = (id, iconData) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    const label = node.data.label;
    setGlobalIcons(prev => ({ ...prev, [label]: iconData }));
  };

  const updateEdgeDepth = (id, depth) => setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, depth: parseInt(depth) || 1 } } : e));
  const updateEdgeLabel = (id, label) => setEdges((eds) => eds.map((e) => e.id === id ? { ...e, label } : e));
  const updateEdgeOffset = (id, offset) => setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, offset } } : e));
  const deleteElement = (id, isNode) => {
    if (isNode) { setNodes((nds) => nds.filter((n) => n.id !== id)); setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id)); }
    else setEdges((eds) => eds.filter((e) => e.id !== id));
  };
  const clearCanvas = () => { setNodes([]); setEdges([]); };

  return (
    <GraphContext.Provider value={{ 
      metadata, nodes, edges, setNodes, setEdges, onConnect, addNodeFromMetadata, addEdgeManually, updateFilters, updateNodeIcon, updateEdgeOffset, updateEdgeDepth, updateEdgeLabel, deleteElement, clearCanvas, executeStructuredQuery, executeShortestPath, queryResult, shortestPathResult, activeResultType, setActiveResultType, isQueryLoading, setQueryResult, setShortestPathResult, highlightedId, setHighlightedId, selectedResultId, setSelectedResultId, isResultPathMode, setIsResultPathMode, resultPathNodes, setResultPathNodes, isAnimated, setIsAnimated, isAutoConnect, setIsAutoConnect, resultSearchTerm, setResultSearchTerm, backgroundStyle, setBackgroundStyle, globalIcons,
      savedStates, saveCurrentState, loadSpecificState, deleteSavedState, exportGraph, importGraph, applyLayout
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