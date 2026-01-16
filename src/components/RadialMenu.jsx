import React, { useState } from 'react';
import { Trash2, Info, X, Image as ImageIcon, Zap, Target, Eye, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';

const RingSegment = ({ 
  startAngle, 
  endAngle, 
  innerRadius, 
  outerRadius, 
  color, 
  hoverColor, 
  onClick, 
  onMouseEnter,
  children,
  className,
  disabled = false
}) => {
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
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

  const midAngle = (startAngle + endAngle) / 2;
  const labelPos = polarToCartesian(x, y, (innerRadius + outerRadius) / 2, midAngle);

  return (
    <g 
      className={cn("cursor-pointer group select-none outline-none", disabled && "pointer-events-none opacity-20 grayscale", className)} 
      onClick={(e) => { e.stopPropagation(); if(!disabled) onClick?.(); }}
      onMouseEnter={() => { if(!disabled) onMouseEnter?.(); }}
    >
      <path 
        d={d} 
        className={cn("transition-all duration-300", color, hoverColor, "stroke-white/10 stroke-[0.5]")} 
      />
      <foreignObject 
        x={labelPos.x - 20} 
        y={labelPos.y - 20} 
        width="40" 
        height="40" 
        className="pointer-events-none"
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-white drop-shadow-md transition-all duration-300">
          <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
            {children[0]}
          </div>
          <span className="text-[7px] font-black mt-1 tracking-tighter uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-1">
            {children.slice(1)}
          </span>
        </div>
      </foreignObject>
    </g>
  );
};

export const RadialMenu = ({ x, y, onDelete, onDetails, onClose, onOpenIconPicker, isNode, onFocus, onToggleTarget, onAddToPath }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const segments = [
    { label: "تفاصيل", icon: <Info size={16} />, color: "fill-indigo-600", hover: "hover:fill-indigo-500", action: onDetails },
    { label: "المسار", icon: <MapPinned size={16} />, color: "fill-amber-500", hover: "hover:fill-amber-400", action: onAddToPath },
    { label: "أدوات", icon: <Zap size={16} />, color: "fill-slate-800", hover: "hover:fill-slate-700", action: () => setShowAdvanced(!showAdvanced), isTools: true },
    { label: "أيقونة", icon: <ImageIcon size={16} />, color: "fill-teal-500", hover: "hover:fill-teal-400", action: onOpenIconPicker },
    { label: "حذف", icon: <Trash2 size={16} />, color: "fill-rose-500", hover: "hover:fill-rose-400", action: onDelete },
  ];

  return (
    <div 
      className="fixed z-[100] pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-[220px] h-[220px] animate-in zoom-in-90 fade-in duration-200 ease-out">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_30px_rgba(0,0,0,0.3)] overflow-visible">
          <circle cx="100" cy="100" r="105" fill="black" fillOpacity="0.02" />

          {showAdvanced && isNode && (
            <g className="animate-in zoom-in-95 slide-in-from-top-2 duration-300">
               <RingSegment
                startAngle={144}
                endAngle={180}
                innerRadius={102}
                outerRadius={135}
                color="fill-violet-500"
                hoverColor="hover:fill-violet-400"
                onClick={onFocus}
              >
                <Eye size={14} />
                تركيز
              </RingSegment>

              <RingSegment
                startAngle={180}
                endAngle={216}
                innerRadius={102}
                outerRadius={135}
                color="fill-rose-600"
                hoverColor="hover:fill-rose-500"
                onClick={onToggleTarget}
              >
                <Target size={14} />
                هدف
              </RingSegment>
            </g>
          )}

          {segments.map((seg, i) => {
            const startAngle = i * 72;
            const endAngle = (i + 1) * 72;
            const isDisabled = !isNode && (seg.label === "أيقونة" || seg.label === "أدوات" || seg.label === "المسار");

            return (
              <RingSegment
                key={seg.label}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={48}
                outerRadius={100}
                color={seg.color}
                hoverColor={seg.hover}
                onClick={seg.action}
                onMouseEnter={seg.isTools ? () => setShowAdvanced(true) : undefined}
                disabled={isDisabled}
              >
                {seg.icon}
                {seg.label}
              </RingSegment>
            );
          })}

          <g className="cursor-pointer group" onClick={onClose}>
            <circle cx="100" cy="100" r="46" className="fill-white drop-shadow-sm transition-all duration-300 group-hover:fill-slate-50" />
            <circle cx="100" cy="100" r="40" className="fill-white stroke-slate-100 stroke-[1]" />
            <foreignObject x="80" y="80" width="40" height="40">
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-rose-500 transition-all duration-300">
                <div className="group-hover:rotate-90 transition-transform duration-300">
                  <X size={18} />
                </div>
                <span className="text-[5px] font-black mt-0.5 tracking-widest opacity-60">إغلاق</span>
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </div>
  );
};