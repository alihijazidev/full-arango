import React, { useCallback } from 'react';
import { getBezierPath, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { useGraph } from '../store/GraphContext';

export const ParallelEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  animated,
  data
}) => {
  const { updateEdgeOffset } = useGraph();
  const { project } = useReactFlow();
  const offset = data?.offset || 0;
  
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
    
    const onMouseMove = (moveEvent) => {
      const mouseX = moveEvent.clientX;
      const mouseY = moveEvent.clientY;
      
      // Calculate projection onto the normal vector to find new offset
      const svg = document.querySelector('.react-flow__svg');
      if (!svg) return;
      
      const bounds = svg.getBoundingClientRect();
      const currentPos = project({
        x: mouseX - bounds.left,
        y: mouseY - bounds.top
      });
      
      const vectorToMouseX = currentPos.x - midX;
      const vectorToMouseY = currentPos.y - midY;
      
      // dot product with normal vector gives the distance along normal (offset)
      const newOffset = vectorToMouseX * nx + vectorToMouseY * ny;
      updateEdgeOffset(id, newOffset);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

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
          selected ? "stroke-primary" : "stroke-slate-300",
          animated && "stroke-dash-array-4 animate-dash"
        )}
        d={path}
        markerEnd={markerEnd}
      />
      
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          className="fill-primary cursor-move hover:r-7 transition-all"
          onMouseDown={onHandleMouseDown}
        />
      )}

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${cx}px,${cy}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              "px-2 py-0.5 rounded-full border bg-white shadow-sm text-[10px] font-bold transition-all whitespace-nowrap select-none",
              selected ? "border-primary text-primary z-10 scale-110" : "border-slate-200 text-slate-500"
            )}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};