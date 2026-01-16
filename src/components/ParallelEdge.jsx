import React, { useMemo } from 'react';
import { EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { useGraph } from '../store/GraphContext';
import { getHexColor } from '../utils/mapping';

export const ParallelEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  style = {},
  markerEnd,
  label,
  selected,
  animated,
  data
}) => {
  const { updateEdgeOffset, nodes, shortestPathSelection, activePathElements } = useGraph();
  const { screenToFlowPosition, setEdges: setLocalEdges } = useReactFlow();
  
  const sourceNode = useMemo(() => nodes.find(n => n.id === source), [nodes, source]);
  const targetNode = useMemo(() => nodes.find(n => n.id === target), [nodes, target]);

  // التحقق مما إذا كان الرابط جزءاً من المسار المكتشف
  const isPartOfPath = useMemo(() => {
    return data?.isVirtual || activePathElements.edges.has(id);
  }, [activePathElements, id, data]);

  const gradientStyle = useMemo(() => {
    if (!sourceNode || !targetNode) return {};
    const startColor = isPartOfPath ? "#f59e0b" : getHexColor(sourceNode.data.label);
    const endColor = isPartOfPath ? "#f59e0b" : getHexColor(targetNode.data.label);
    return {
      background: `linear-gradient(to right, ${startColor}, ${endColor})`,
      color: 'white',
      border: 'none'
    };
  }, [sourceNode, targetNode, isPartOfPath]);

  const offset = data?.offset ?? 0;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const controlOffset = offset * 2;
  const cx = midX + nx * controlOffset;
  const cy = midY + ny * controlOffset;
  const labelX = midX + nx * offset;
  const labelY = midY + ny * offset;

  const path = `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`;

  const onHandleMouseDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const onMouseMove = (moveEvent) => {
      const flowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      const vx = flowPos.x - midX;
      const vy = flowPos.y - midY;
      const newOffset = vx * nx + vy * ny;
      updateEdgeOffset(id, newOffset);
      if (setLocalEdges) {
        setLocalEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, offset: newOffset } } : e));
      }
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className={cn(
          "react-flow__edge-path fill-none transition-all cursor-pointer",
          isPartOfPath ? "stroke-amber-400 stroke-[3px] drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" : (selected ? "stroke-primary stroke-[3px]" : "stroke-slate-400 stroke-2"),
          (animated || isPartOfPath) && "animate-dash",
          data?.isVirtual && "stroke-dasharray-5"
        )}
        d={path}
        markerEnd={markerEnd}
      />
      
      <path d={path} fill="none" stroke="transparent" strokeWidth={20} className="cursor-pointer" />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-1"
        >
          {selected && !data?.isVirtual && (
            <div 
              onMouseDown={onHandleMouseDown}
              className="w-6 h-6 bg-white border-2 border-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform z-[100]"
              style={{ touchAction: 'none' }}
            >
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          )}

          {label && (
            <div
              style={gradientStyle}
              className={cn(
                "px-3 py-1 rounded-full border shadow-md text-[10px] font-bold transition-all whitespace-nowrap select-none",
                isPartOfPath ? "ring-2 ring-amber-200" : (selected ? "scale-110 ring-2 ring-white/50" : "opacity-90"),
                data?.isVirtual && "bg-amber-500/80 border-dashed border-white/50"
              )}
            >
              {label}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};