import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CollectionMetadata, EdgeMetadata, Filter } from '../types/arango';
import { fetchMetadata } from '../services/mockApi';
import { Node, Edge, Connection, addEdge } from 'reactflow';

interface GraphContextType {
  metadata: { collections: CollectionMetadata[]; edges: EdgeMetadata[] };
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onConnect: (params: Connection) => void;
  addNodeFromMetadata: (type: 'collection' | 'category', name: string, position: { x: number; y: number }) => void;
  updateFilters: (id: string, isNode: boolean, filters: Filter[]) => void;
  deleteElement: (id: string, isNode: boolean) => void;
  autoConnect: () => void;
  clearCanvas: () => void;
  edgeStyle: string;
  setEdgeStyle: (style: string) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<{ collections: CollectionMetadata[]; edges: EdgeMetadata[] }>({ collections: [], edges: [] });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [edgeStyle, _setEdgeStyle] = useState<string>('smoothstep');

  useEffect(() => {
    fetchMetadata().then(setMetadata);
  }, []);

  // Update existing edges when the global style changes
  const setEdgeStyle = (newStyle: string) => {
    _setEdgeStyle(newStyle);
    setEdges((eds) => eds.map((e) => ({ ...e, type: newStyle })));
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      type: edgeStyle,
      data: { filters: [] }
    }, eds));
  }, [edgeStyle]);

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

  const autoConnect = useCallback(() => {
    const newEdges: Edge[] = [];
    
    nodes.forEach(sourceNode => {
      nodes.forEach(targetNode => {
        if (sourceNode.id === targetNode.id) return;

        const sourceColls = sourceNode.data.type === 'collection' ? [sourceNode.data.label] : sourceNode.data.metadata?.collections || [];
        const targetColls = targetNode.data.type === 'collection' ? [targetNode.data.label] : targetNode.data.metadata?.collections || [];

        metadata.edges.forEach(edgeMeta => {
          if (sourceColls.includes(edgeMeta.from) && targetColls.includes(edgeMeta.to)) {
            const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${edgeMeta.name}`;
            if (!edges.find(e => e.id === edgeId)) {
              newEdges.push({
                id: edgeId,
                source: sourceNode.id,
                target: targetNode.id,
                label: edgeMeta.name,
                type: edgeStyle,
                animated: true,
                data: { metadata: edgeMeta, filters: [] }
              });
            }
          }
        });
      });
    });

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [nodes, edges, metadata.edges, edgeStyle]);

  return (
    <GraphContext.Provider value={{ 
      metadata, nodes, edges, setNodes, setEdges, onConnect, 
      addNodeFromMetadata, updateFilters, deleteElement, autoConnect, clearCanvas,
      edgeStyle, setEdgeStyle 
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