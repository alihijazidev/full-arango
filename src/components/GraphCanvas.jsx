import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Panel,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../store/GraphContext';
import { CustomNode } from './GraphNodes';
import { ParallelEdge } from './ParallelEdge';
import { RadialMenu } from './RadialMenu';
import { IconPicker } from './IconPicker';
import { Maximize2, Trash2, Zap, ZapOff, Activity, LayoutGrid, CircleDot, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';

const nodeTypes = { customNode: CustomNode };
const edgeTypes = { parallel: ParallelEdge };

const GraphInner = ({ onSelectElement }) => {
  const reactFlowWrapper = useRef(null);
  const { 
    nodes, edges, onConnect, setNodes, setEdges, 
    addNodeFromMetadata, deleteElement, clearCanvas, updateNodeIcon,
    isAnimated, setIsAnimated,
    isAutoConnect, setIsAutoConnect,
    backgroundStyle, setBackgroundStyle
  } = useGraph();
  const { project, fitView } = useReactFlow();
  const [menu, setMenu] = useState(null);
  const [iconPicker, setIconPicker] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (!isTyping && event.key === 'Delete') {
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        selectedNodes.forEach(n => deleteElement(n.id, true));
        selectedEdges.forEach(e => deleteElement(e.id, false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, deleteElement]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event) => {
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
    addNodeFromMetadata(data.nodeType, data.nodeName, position, data.categoryName);
  }, [project, addNodeFromMetadata]);

  const cycleBackground = () => {
    const styles = ['dots', 'lines', 'none'];
    const nextIndex = (styles.indexOf(backgroundStyle) + 1) % styles.length;
    setBackgroundStyle(styles[nextIndex]);
  };

  const getBgIcon = () => {
    if (backgroundStyle === 'dots') return <CircleDot size={14} />;
    if (backgroundStyle === 'lines') return <LayoutGrid size={14} />;
    return <Square size={14} />;
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
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: n.id, isNode: true }); }}
        onEdgeContextMenu={(e, edge) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: edge.id, isNode: false }); }}
        onNodeDoubleClick={(e, n) => onSelectElement(n.id, true)}
        onEdgeDoubleClick={(e, edge) => onSelectElement(edge.id, false)}
        fitView
        deleteKeyCode={null}
      >
        {backgroundStyle !== 'none' && (
          <Background 
            variant={backgroundStyle === 'lines' ? 'lines' : 'dots'} 
            color="#cbd5e1" 
            gap={20} 
          />
        )}
        
        <Panel position="top-right" className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border shadow-lg">
          <div className="flex items-center gap-3 border-r pr-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className={isAnimated ? "text-primary animate-pulse" : "text-slate-400"} />
              <Label htmlFor="animate-mode" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">تحريك</Label>
              <Switch id="animate-mode" checked={isAnimated} onCheckedChange={setIsAnimated} />
            </div>
            <div className="flex items-center gap-2 ml-2">
              {isAutoConnect ? <Zap size={14} className="text-amber-500" /> : <ZapOff size={14} className="text-slate-400" />}
              <Label htmlFor="auto-mode" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ربط ذكي</Label>
              <Switch id="auto-mode" checked={isAutoConnect} onCheckedChange={setIsAutoConnect} />
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 hover:bg-slate-100" 
               onClick={cycleBackground}
               title="تغيير الخلفية"
             >
               {getBgIcon()}
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => fitView({ duration: 800 })} title="تكبير"><Maximize2 size={14} /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={clearCanvas} title="مسح"><Trash2 size={14} /></Button>
          </div>
        </Panel>
      </ReactFlow>
      
      {menu && (
        <RadialMenu 
          x={menu.x} y={menu.y}
          isNode={menu.isNode}
          onDelete={() => { deleteElement(menu.id, menu.isNode); setMenu(null); }}
          onDetails={() => { onSelectElement(menu.id, menu.isNode); setMenu(null); }}
          onOpenIconPicker={() => { setIconPicker({ x: menu.x + 100, y: menu.y, nodeId: menu.id }); setMenu(null); }}
          onClose={() => setMenu(null)}
        />
      )}

      {iconPicker && (
        <div 
          className="fixed z-[110]" 
          style={{ left: iconPicker.x, top: iconPicker.y, transform: 'translateY(-50%)' }}
        >
          <IconPicker 
            onSelect={(name) => { updateNodeIcon(iconPicker.nodeId, name); setIconPicker(null); }}
            onClose={() => setIconPicker(null)}
          />
        </div>
      )}
    </div>
  );
};

export const GraphCanvas = ({ onSelectElement }) => (
  <ReactFlowProvider>
    <GraphInner onSelectElement={onSelectElement} />
  </ReactFlowProvider>
);