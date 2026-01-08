import React from 'react';
import { Trash2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadialMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onDetails: () => void;
  onClose: () => void;
}

const RingSegment = ({ 
  startAngle, 
  endAngle, 
  innerRadius, 
  outerRadius, 
  color, 
  hoverColor, 
  onClick, 
  children,
  className
}: { 
  startAngle: number; 
  endAngle: number; 
  innerRadius: number; 
  outerRadius: number; 
  color: string; 
  hoverColor: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const x = 100, y = 100;
  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const startInner = polarToCartesian(x, y, innerRadius, startAngle);
  const endInner = polarToCartesian(x, y, innerRadius, endAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
    "Z"
  ].join(" ");

  // Calculate center of the segment for the icon/text
  const midAngle = (startAngle + endAngle) / 2;
  const labelPos = polarToCartesian(x, y, (innerRadius + outerRadius) / 2, midAngle);

  return (
    <g className={cn("cursor-pointer group", className)} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <path 
        d={d} 
        className={cn("transition-colors duration-200", color, hoverColor)} 
        stroke="white" 
        strokeWidth="2"
      />
      <foreignObject 
        x={labelPos.x - 25} 
        y={labelPos.y - 25} 
        width="50" 
        height="50" 
        className="pointer-events-none"
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-white group-hover:scale-110 transition-transform">
          {children}
        </div>
      </foreignObject>
    </g>
  );
};

export const RadialMenu: React.FC<RadialMenuProps> = ({ x, y, onDelete, onDetails, onClose }) => {
  return (
    <div 
      className="fixed z-[100] pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-56 h-56 animate-in zoom-in-75 duration-200">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          {/* Delete Segment - Top Left */}
          <RingSegment
            startAngle={225}
            endAngle={315}
            innerRadius={45}
            outerRadius={95}
            color="fill-rose-500"
            hoverColor="hover:fill-rose-600"
            onClick={onDelete}
          >
            <Trash2 size={20} />
            <span className="text-[8px] font-bold uppercase mt-0.5">حذف</span>
          </RingSegment>

          {/* Close Segment - Top Right */}
          <RingSegment
            startAngle={315}
            endAngle={405}
            innerRadius={45}
            outerRadius={95}
            color="fill-slate-800"
            hoverColor="hover:fill-slate-900"
            onClick={onClose}
          >
            <X size={20} />
            <span className="text-[8px] font-bold uppercase mt-0.5">إغلاق</span>
          </RingSegment>

          {/* Details Segment - Bottom Half */}
          <RingSegment
            startAngle={45}
            endAngle={225}
            innerRadius={45}
            outerRadius={95}
            color="fill-blue-600"
            hoverColor="hover:fill-blue-700"
            onClick={onDetails}
          >
            <Info size={24} />
            <span className="text-[10px] font-bold uppercase mt-1">تفاصيل</span>
          </RingSegment>

          {/* Center Hub Decoration */}
          <circle cx="100" cy="100" r="43" fill="white" className="shadow-inner" />
          <circle cx="100" cy="100" r="30" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="100" cy="100" r="4" fill="#cbd5e1" />
        </svg>
      </div>
    </div>
  );
};