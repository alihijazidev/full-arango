import React, { useCallback, useRef, useState, useEffect } from 'react';
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
import { Settings2, Play, LayoutGrid, Maximize2, Trash2, Zap, ZapOff, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const nodeTypes = {
  customNode: CustomNode,
};

const GraphInner = ({ onSelectElement }: { onSelectElement: (id: string, isNode: boolean) => void }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, edges, onConnect, setNodes, setEdges, 
    addNodeFromMetadata, deleteElement, clearCanvas,
    edgeStyle, setEdgeStyle, isAnimated, setIsAnimated,
    isAutoConnect, setIsAutoConnect
  } = useGraph();
  const { project, fitView } = useReactFlow();
  
  const [menu, setMenu] = useState<{ x: number, y: number, id: string, isNode: boolean } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        selectedNodes.forEach(n => deleteElement(n.id, true));
        selectedEdges.forEach(e => deleteElement(e.id, false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, deleteElement]);

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
  }, [project, addNodeFromMetadata]);

  const onLayoutGrid = () => {
    setNodes((nds) => nds.map((node, index) => ({
      ...node,
      position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 250 }
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
        deleteKeyCode={null}
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        
        <Panel position="top-right" className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border shadow-lg">
          <div className="flex items-center gap-3 border-r pr-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className={isAnimated ? "text-primary animate-pulse" : "text-slate-400"} />
              <Label htmlFor="animate-mode" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">تحريك</Label>
              <Switch 
                id="animate-mode" 
                checked={isAnimated} 
                onCheckedChange={setIsAnimated} 
              />
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              {isAutoConnect ? <Zap size={14} className="text-amber-500" /> : <ZapOff size={14} className="text-slate-400" />}
              <Label htmlFor="auto-mode" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ربط ذكي</Label>
              <Switch 
                id="auto-mode" 
                checked={isAutoConnect} 
                onCheckedChange={setIsAutoConnect} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-r pr-3">
            <Settings2 size={16} className="text-slate-500" />
            <Select value={edgeStyle} onValueChange={setEdgeStyle}>
              <SelectTrigger className="w-28 h-8 text-[10px] font-bold uppercase border-none bg-slate-100 hover:bg-slate-200 transition-colors">
                <SelectValue placeholder="النمط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-xs">انسيابي</SelectItem>
                <SelectItem value="straight" className="text-xs">مستقيم</SelectItem>
                <SelectItem value="step" className="text-xs">متدرج</SelectItem>
                <SelectItem value="smoothstep" className="text-xs">ناعم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={onLayoutGrid} title="ترتيب"><LayoutGrid size={14} /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => fitView({ duration: 800 })} title="تكبير"><Maximize2 size={14} /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={clearCanvas} title="مسح"><Trash2 size={14} /></Button>
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