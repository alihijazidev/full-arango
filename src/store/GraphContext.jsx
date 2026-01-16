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

  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [targetNodeIds, setTargetNodeIds] = useState(new Set());
  const [shortestPathSelection, setShortestPathSelection] = useState([]);
  const [activePathElements, setActivePathElements] = useState({ nodes: new Set(), edges: new Set() });

  useEffect(() => {
    fetchMetadata().then(setMetadata);
    const saved = localStorage.getItem('arango_saved_states');
    if (saved) setSavedStates(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setEdges((eds) => eds.map(edge => ({ ...edge, animated: isAnimated })));
  }, [isAnimated]);

  const findPathInCanvas = (startId, endId, currentEdges) => {
    const adjacency = {};
    currentEdges.forEach(edge => {
      if (!adjacency[edge.source]) adjacency[edge.source] = [];
      adjacency[edge.source].push({ node: edge.target, edge: edge.id });
      if (!adjacency[edge.target]) adjacency[edge.target] = [];
      adjacency[edge.target].push({ node: edge.source, edge: edge.id });
    });

    const queue = [startId];
    const visited = new Set([startId]);
    const predecessors = {};

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === endId) {
        const pathNodes = new Set();
        const pathEdges = new Set();
        let step = endId;
        while (step !== startId) {
          pathNodes.add(step);
          const pred = predecessors[step];
          pathEdges.add(pred.edgeId);
          step = pred.prevNodeId;
        }
        pathNodes.add(startId);
        return { nodes: pathNodes, edges: pathEdges };
      }
      (adjacency[current] || []).forEach(neighbor => {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          predecessors[neighbor.node] = { prevNodeId: current, edgeId: neighbor.edge };
          queue.push(neighbor.node);
        }
      });
    }
    return null;
  };

  const findPathInSchema = (startPath, endPath) => {
    const schemaAdj = {};
    const addAdj = (from, to, label, meta, isHierarchy = false) => {
      if (!schemaAdj[from]) schemaAdj[from] = [];
      schemaAdj[from].push({ to, label, meta, isHierarchy });
      if (!schemaAdj[to]) schemaAdj[to] = [];
      schemaAdj[to].push({ to: from, label, meta, isHierarchy });
    };

    // 1. إضافة علاقات المخطط (Edges)
    metadata.edges.forEach(e => {
      const from = Array.isArray(e.fromcol) ? e.fromcol.join('/') : e.fromcol;
      const to = Array.isArray(e.tocol) ? e.tocol.join('/') : e.tocol;
      addAdj(from, to, e.label, e);
    });

    // 2. إضافة العلاقات الهرمية (فئة <-> مجموعات تابعة)
    metadata.collections.forEach(cat => {
      cat.entities.forEach(entity => {
        const fullEntityPath = `${cat.name}/${entity.name}`;
        addAdj(cat.name, fullEntityPath, 'يحتوي', null, true);
      });
    });

    const queue = [startPath];
    const visited = new Set([startPath]);
    const predecessors = {};

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === endPath) {
        const path = [];
        let step = endPath;
        while (step !== startPath) {
          const pred = predecessors[step];
          path.unshift({ from: pred.prev, to: step, label: pred.label, meta: pred.meta, isHierarchy: pred.isHierarchy });
          step = pred.prev;
        }
        return path;
      }
      (schemaAdj[current] || []).forEach(edge => {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          predecessors[edge.to] = { prev: current, label: edge.label, meta: edge.meta, isHierarchy: edge.isHierarchy };
          queue.push(edge.to);
        }
      });
    }
    return null;
  };

  const addNodeFromMetadata = (type, name, position, categoryName = null) => {
    const fullPath = type === 'collection' ? `${categoryName}/${name}` : name;
    const existing = nodes.find(n => n.data.fullPath === fullPath);
    if (existing) return existing;

    const id = `${type}-${name}-${Date.now()}`;
    let nodeMetadata = null;
    if (type === 'category') nodeMetadata = metadata.collections.find(c => c.name === name);
    else {
      const cat = metadata.collections.find(c => c.name === categoryName);
      nodeMetadata = cat?.entities.find(e => e.name === name);
    }
    const newNode = { id, type: 'customNode', position, data: { label: name, type, fullPath, categoryName, metadata: nodeMetadata, filters: [] } };
    setNodes(nds => [...nds, newNode]);
    return newNode;
  };

  const addToShortestPath = (node, currentNodes = nodes, currentEdges = edges) => {
    if (shortestPathSelection.find(n => n.id === node.id)) return;
    if (shortestPathSelection.length >= 2) {
      toast.error("يمكنك اختيار عقدتين فقط لمسار واحد");
      return;
    }

    const newSelection = [...shortestPathSelection, node];
    setShortestPathSelection(newSelection);
    toast.success(`تم اختيار ${node.data.label}`);

    if (newSelection.length === 2) {
      const [nodeA, nodeB] = newSelection;
      const canvasPath = findPathInCanvas(nodeA.id, nodeB.id, currentEdges);
      if (canvasPath) {
        setActivePathElements(canvasPath);
        toast.info("تم اكتشاف مسار مباشر في التصميم");
        return;
      }

      const schemaPath = findPathInSchema(nodeA.data.fullPath, nodeB.data.fullPath);
      if (schemaPath) {
        toast.loading("جاري جلب المسار من هيكل البيانات...", { id: 'path-fetch' });
        
        let lastNodeId = nodeA.id;
        const finalPathNodes = new Set([nodeA.id, nodeB.id]);
        const finalPathEdges = new Set();
        const newNodesToAdd = [];
        const newEdgesToAdd = [];

        schemaPath.forEach((step, idx) => {
          let stepNode;
          if (idx === schemaPath.length - 1) {
            stepNode = nodeB;
          } else {
            const pathParts = step.to.split('/');
            const type = pathParts.length > 1 ? 'collection' : 'category';
            const name = pathParts.pop();
            const catName = pathParts.length > 0 ? pathParts[0] : null;
            
            stepNode = nodes.find(n => n.data.fullPath === step.to);
            if (!stepNode) {
              stepNode = addNodeFromMetadata(type, name, { x: 400 * (idx + 1), y: 150 }, catName);
              newNodesToAdd.push(stepNode);
            }
          }
          
          finalPathNodes.add(stepNode.id);
          
          // لا ننشئ روابط للعلاقات الهرمية (Hierarchy) إلا إذا أردنا تمثيلها كروابط مرئية
          if (!step.isHierarchy) {
            const edgeId = `schema-path-${lastNodeId}-${stepNode.id}-${step.label}`;
            const newEdge = { 
              id: edgeId, source: lastNodeId, target: stepNode.id, label: step.label, 
              type: 'parallel', animated: true, data: { metadata: step.meta, filters: [], offset: 0, depth: 1 } 
            };
            newEdgesToAdd.push(newEdge);
            finalPathEdges.add(edgeId);
          }
          
          lastNodeId = stepNode.id;
        });

        setEdges(eds => [...eds, ...newEdgesToAdd]);
        setActivePathElements({ nodes: finalPathNodes, edges: finalPathEdges });
        toast.success("تم استكمال المسار آلياً من هيكل البيانات", { id: 'path-fetch' });
      } else {
        const edgeId = `manual-path-${nodeA.id}-${nodeB.id}`;
        setEdges(eds => [...eds, {
          id: edgeId, source: nodeA.id, target: nodeB.id, label: 'رابط يدوي',
          type: 'parallel', animated: true, data: { isVirtual: true, filters: [], offset: 0, depth: 1 }
        }]);
        setActivePathElements({ nodes: new Set([nodeA.id, nodeB.id]), edges: new Set([edgeId]) });
        toast.warning("لا يوجد مسار معروف؛ تم إنشاء رابط يدوي");
      }
    }
  };

  const addMetadataToShortestPath = (type, name, categoryName = null) => {
    const fullPath = type === 'collection' ? `${categoryName}/${name}` : name;
    let targetNode = nodes.find(n => n.data.fullPath === fullPath);
    if (!targetNode) {
      targetNode = addNodeFromMetadata(type, name, { x: 100, y: 100 }, categoryName);
      setTimeout(() => addToShortestPath(targetNode), 10);
    } else {
      addToShortestPath(targetNode);
    }
  };

  const toggleFocus = (nodeId) => setFocusedNodeId(prev => prev === nodeId ? null : nodeId);
  const toggleTarget = (nodeId) => {
    setTargetNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const removeFromShortestPath = (nodeId) => {
    setShortestPathSelection(prev => prev.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => !e.id.startsWith('manual-path-') && !e.id.startsWith('schema-path-')));
    setActivePathElements({ nodes: new Set(), edges: new Set() });
  };

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

  const saveCurrentState = useCallback((name) => {
    const newState = {
      id: Date.now().toString(),
      name: name || `نسخة ${new Date().toLocaleString('ar-EG')}`,
      timestamp: new Date().toISOString(),
      data: { nodes, edges, globalIcons, targetNodeIds: Array.from(targetNodeIds), focusedNodeId }
    };
    const updatedStates = [newState, ...savedStates];
    setSavedStates(updatedStates);
    localStorage.setItem('arango_saved_states', JSON.stringify(updatedStates));
    toast.success(`تم حفظ النسخة "${newState.name}" بنجاح`);
  }, [nodes, edges, globalIcons, savedStates, targetNodeIds, focusedNodeId]);

  const loadSpecificState = useCallback((stateId) => {
    const target = savedStates.find(s => s.id === stateId);
    if (target) {
      const { nodes: n, edges: e, globalIcons: i, targetNodeIds: t, focusedNodeId: f } = target.data;
      setNodes(n || []);
      setEdges(e || []);
      setGlobalIcons(i || {});
      setTargetNodeIds(new Set(t || []));
      setFocusedNodeId(f || null);
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
    const dataStr = JSON.stringify({ nodes, edges, globalIcons, targetNodeIds: Array.from(targetNodeIds), focusedNodeId, exportedAt: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `graph-${Date.now()}.json`);
    linkElement.click();
    toast.success("بدأ تصدير المخطط");
  }, [nodes, edges, globalIcons, targetNodeIds, focusedNodeId]);

  const importGraph = useCallback((jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        setGlobalIcons(data.globalIcons || {});
        if (data.targetNodeIds) setTargetNodeIds(new Set(data.targetNodeIds));
        if (data.focusedNodeId) setFocusedNodeId(data.focusedNodeId);
        toast.success("تم استيراد المخطط بنجاح");
      }
    } catch (error) {
      toast.error("فشل استيراد الملف");
    }
  }, []);

  const getParallelEdgeOffset = (source, target, existingEdges) => {
    const parallelEdges = existingEdges.filter((e) => (e.source === source && e.target === target) || (e.source === target && e.target === source));
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
          if ((edgeFromStr === sourcePath || edgeFromStr.startsWith(sourcePath + '/')) && (edgeToStr === targetPath || edgeToStr.startsWith(targetPath + '/'))) {
            const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.label}`;
            if (!currentEdges.some(e => e.id === edgeId) && !newEdges.some(e => e.id === edgeId)) {
              const offset = getParallelEdgeOffset(sourceNode.id, targetNode.id, [...currentEdges, ...newEdges]);
              newEdges.push({ id: edgeId, source: sourceNode.id, target: targetNode.id, label: edgeMeta.label, type: 'parallel', animated: isAnimated, data: { metadata: edgeMeta, filters: [], offset, depth: 1 } });
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
        return (fromStr === sourcePath || fromStr.startsWith(sourcePath + '/')) && (toStr === targetPath || toStr.startsWith(targetPath + '/'));
      });
      const offset = getParallelEdgeOffset(params.source, params.target, eds);
      return addEdge({ ...params, label: edgeMeta?.label || 'رابط يدوي', animated: isAnimated, type: 'parallel', data: { metadata: edgeMeta || { fromcol: sourcePath.split('/'), tocol: targetPath.split('/'), label: 'رابط يدوي', attributes: [], isManual: true }, filters: [], offset, depth: 1 } }, eds);
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
    if (isNode) { 
      setNodes((nds) => nds.filter((n) => n.id !== id)); 
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id)); 
      setShortestPathSelection(prev => prev.filter(n => n.id !== id));
    }
    else setEdges((eds) => eds.filter((e) => e.id !== id));
  };
  const clearCanvas = () => { 
    setNodes([]); 
    setEdges([]); 
    setShortestPathSelection([]);
    setFocusedNodeId(null);
    setTargetNodeIds(new Set());
    setActivePathElements({ nodes: new Set(), edges: new Set() });
  };

  return (
    <GraphContext.Provider value={{ 
      metadata, nodes, edges, setNodes, setEdges, onConnect, addNodeFromMetadata, addMetadataToShortestPath, addEdgeManually, updateFilters, updateNodeIcon, updateEdgeOffset, updateEdgeDepth, updateEdgeLabel, deleteElement, clearCanvas, executeStructuredQuery, executeShortestPath, queryResult, shortestPathResult, activeResultType, setActiveResultType, isQueryLoading, setQueryResult, setShortestPathResult, highlightedId, setHighlightedId, selectedResultId, setSelectedResultId, isResultPathMode, setIsResultPathMode, resultPathNodes, setResultPathNodes, isAnimated, setIsAnimated, isAutoConnect, setIsAutoConnect, resultSearchTerm, setResultSearchTerm, backgroundStyle, setBackgroundStyle, globalIcons,
      savedStates, saveCurrentState, loadSpecificState, deleteSavedState, exportGraph, importGraph, applyLayout,
      focusedNodeId, targetNodeIds, shortestPathSelection, activePathElements, toggleFocus, toggleTarget, addToShortestPath, removeFromShortestPath
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