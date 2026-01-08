import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { RadialMenu } from './RadialMenu';
import { Settings2, Play, LayoutGrid, Maximize2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const nodeTypes = {
  customNode: CustomNode,
};

const GraphInner = ({ onSelectElement }: { onSelectElement: (id: string, isNode: boolean) => void }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, edges, onConnect, setNodes, setEdges, 
    addNodeFromMetadata, autoConnect, deleteElement, clearCanvas,
    edgeStyle, setEdgeStyle 
  } = useGraph();
  const { project, fitView } = useReactFlow();
  
  const [menu, setMenu] = useState<{ x: number, y: number, id: string, isNode: boolean } | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const dropData = event.dataTransfer.getData('application/reactflow');
    if (!dropData) return;

    const data = JSON.parse(dropData);

    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    addNodeFromMetadata(data.nodeType, data.nodeName, position);
    setTimeout(autoConnect, 100);
  }, [project, addNodeFromMetadata, autoConnect]);

  const onLayoutGrid = () => {
    setNodes((nds) => nds.map((node, index) => ({
      ...node,
      position: { x: (index % 3) * 200, y: Math.floor(index / 3) * 200 }
    })));
    setTimeout(() => fitView({ duration: 800 }), 100);
  };

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper} dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: n.id, isNode: true }); }}
        onEdgeContextMenu={(e, edge) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: edge.id, isNode: false }); }}
        onNodeDoubleClick={(e, n) => onSelectElement(n.id, true)}
        onEdgeDoubleClick={(e, edge) => onSelectElement(edge.id, false)}
        fitView
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        
        <Panel position="top-right" className="flex items-center gap-2 bg-white/80 backdrop-blur p-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 border-r pr-2">
            <Settings2 size={16} className="text-slate-500" />
            <Select value={edgeStyle} onValueChange={setEdgeStyle}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="نمط الحافة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">انسيابي</SelectItem>
                <SelectItem value="straight">مستقيم</SelectItem>
                <SelectItem value="step">متدرج</SelectItem>
                <SelectItem value="smoothstep">متدرج ناعم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="ghost" size="sm" onClick={autoConnect} className="h-8 text-xs gap-1">
            <Play size={14} /> ربط تلقائي
          </Button>

          <Button variant="ghost" size="sm" onClick={clearCanvas} className="h-8 text-xs gap-1 text-destructive hover:text-destructive">
            <Trash2 size={14} /> مسح
          </Button>
          
          <div className="flex items-center gap-1 border-l pl-2">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLayoutGrid} title="ترتيب شبكي"><LayoutGrid size={14} /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fitView({ duration: 800 })} title="تكبير للكل"><Maximize2 size={14} /></Button>
          </div>
        </Panel>
      </ReactFlow>

      {menu && (
        <RadialMenu 
          x={menu.x}
          y={menu.y}
          onDelete={() => { deleteElement(menu.id, menu.isNode); setMenu(null); }}
          onDetails={() => { onSelectElement(menu.id, menu.isNode); setMenu(null); }}
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