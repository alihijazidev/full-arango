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
  const { project } = useReactFlow();
  
  // Use the offset from data, default to 0
  const offset = data?.offset ?? 0;
  
  // Calculate midpoint
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Calculate normal vector for the offset direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  
  // Control point for the Quadratic Bezier curve
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;

  // Q path: Move to source, curve through control point to target
  const path = `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`;

  const onHandleMouseDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    
    const svg = document.querySelector('.react-flow__svg');
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();

    const onMouseMove = (moveEvent) => {
      // Get flow coordinates from mouse position
      const flowPos = project({
        x: moveEvent.clientX - bounds.left,
        y: moveEvent.clientY - bounds.top
      });
      
      // Calculate the vector from midpoint to current mouse position
      const vx = flowPos.x - midX;
      const vy = flowPos.y - midY;
      
      // The offset is the projection of this vector onto the normal vector (nx, ny)
      // offset = dot product of (vx, vy) and (nx, ny)
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
      
      {/* Invisible wider path for easier clicking/selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />
      
      {selected && (
        <g 
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={onHandleMouseDown}
        >
          <circle
            cx={cx}
            cy={cy}
            r={8}
            className="fill-white stroke-primary stroke-2 shadow-sm"
          />
          <circle
            cx={cx}
            cy={cy}
            r={3}
            className="fill-primary"
          />
        </g>
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