import React from 'react';
import { EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { useGraph } from '../store/GraphContext';

export const ParallelEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  selected,
  animated,
  data
}) => {
  const { updateEdgeOffset } = useGraph();
  const { screenToFlowPosition } = useReactFlow();
  
  const offset = data?.offset ?? 0;
  
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;

  const path = `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`;

  const onHandleMouseDown = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const onMouseMove = (moveEvent) => {
      // تحويل إحداثيات الشاشة إلى إحداثيات المخطط بدقة
      const flowPos = screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });
      
      const vx = flowPos.x - midX;
      const vy = flowPos.y - midY;
      const newOffset = vx * nx + vy * ny;
      
      updateEdgeOffset(id, newOffset);
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
          "react-flow__edge-path stroke-2 fill-none transition-all cursor-pointer",
          selected ? "stroke-primary stroke-[3px]" : "stroke-slate-400",
          animated && "animate-dash"
        )}
        d={path}
        markerEnd={markerEnd}
      />
      
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${cx}px,${cy}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-1"
        >
          {selected && (
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
              className={cn(
                "px-2 py-0.5 rounded-full border bg-white shadow-sm text-[10px] font-bold transition-all whitespace-nowrap select-none",
                selected ? "border-primary text-primary scale-110" : "border-slate-200 text-slate-500"
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