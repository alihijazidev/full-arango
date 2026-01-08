import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { RadialMenu } from './RadialMenu';
import { Settings2, Play, LayoutGrid, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const nodeTypes = {
  customNode: CustomNode,
};

const GraphInner = ({ onSelectElement }: { onSelectElement: (id: string, isNode: boolean) => void }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, edges, onConnect, setNodes, setEdges, 
    addNodeFromMetadata, autoConnect, deleteElement,
    edgeStyle, setEdgeStyle 
  } = useGraph();
  const { project } = useReactFlow();
  
  const [menu, setMenu] = useState<{ x: number, y: number, id: string, isNode: boolean } | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    addNodeFromMetadata(data.nodeType, data.nodeName, position);
    // Trigger auto-connect after drop
    setTimeout(autoConnect, 100);
  }, [project, addNodeFromMetadata, autoConnect]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, id: node.id, isNode: true });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: any) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, id: edge.id, isNode: false });
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: any) => {
    onSelectElement(node.id, true);
  }, [onSelectElement]);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: any) => {
    onSelectElement(edge.id, false);
  }, [onSelectElement]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => setNodes((nds) => {
           // Handle node position changes manually or via helper
           return nds; 
        })} // Note: In production we'd use applyNodeChanges
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        fitView
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        
        <Panel position="top-right" className="flex items-center gap-2 bg-white/80 backdrop-blur p-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 border-r pr-2">
            <Settings2 size={16} className="text-slate-500" />
            <Select value={edgeStyle} onValueChange={setEdgeStyle}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Edge Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Smooth</SelectItem>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="step">Step</SelectItem>
                <SelectItem value="smoothstep">Smooth Step</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="ghost" size="sm" onClick={autoConnect} className="h-8 text-xs gap-1">
            <Play size={14} /> Auto-Connect
          </Button>
          
          <div className="flex items-center gap-1 border-l pl-2">
             <Button variant="ghost" size="icon" className="h-8 w-8"><LayoutGrid size={14} /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 size={14} /></Button>
          </div>
        </Panel>
      </ReactFlow>

      {menu && (
        <RadialMenu 
          x={menu.x}
          y={menu.y}
          onDelete={() => {
            deleteElement(menu.id, menu.isNode);
            setMenu(null);
          }}
          onDetails={() => {
            onSelectElement(menu.id, menu.isNode);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
};

export const GraphCanvas = ({ onSelectElement }: { onSelectElement: (id: string, isNode: boolean) => void }) => (
  <ReactFlowProvider>
    <GraphInner onSelectElement={onSelectElement} />
  </ReactFlowProvider>
);