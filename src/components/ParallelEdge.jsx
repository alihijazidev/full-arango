import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { cn } from '@/lib/utils';

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
  const offset = data?.offset || 0;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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

  return (
    <>
      <path
        id={id}
        style={style}
        className={cn(
          "react-flow__edge-path stroke-2 fill-none transition-all",
          selected ? "stroke-primary" : "stroke-slate-300",
          animated && "stroke-dash-array-4 animate-dash"
        )}
        d={path}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${cx}px,${cy}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              "px-2 py-0.5 rounded-full border bg-white shadow-sm text-[10px] font-bold transition-all whitespace-nowrap",
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