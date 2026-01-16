import React, { useState } from 'react';
import { Trash2, Info, X, Image as ImageIcon, Zap, Target, Eye, MapPinned, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const RingSegment = ({ 
  startAngle, 
  endAngle, 
  innerRadius, 
  outerRadius, 
  color, 
  hoverColor, 
  onClick, 
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
      className={cn("cursor-pointer group", disabled && "pointer-events-none opacity-40", className)} 
      onClick={(e) => { e.stopPropagation(); if(!disabled) onClick(); }}
    >
      <path 
        d={d} 
        className={cn("transition-colors duration-200", color, hoverColor)} 
        stroke="white" 
        strokeWidth="1.5"
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

export const RadialMenu = ({ x, y, onDelete, onDetails, onClose, onOpenIconPicker, isNode, onFocus, onToggleTarget, onAddToPath }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // تقسيم الدائرة إلى 5 أقسام متساوية (360 / 5 = 72 درجة لكل قسم)
  const segments = [
    { label: "تفاصيل", icon: <Info size={18} />, color: "fill-blue-600", hover: "hover:fill-blue-700", action: onDetails },
    { label: "المسار", icon: <MapPinned size={18} />, color: "fill-amber-500", hover: "hover:fill-amber-600", action: onAddToPath },
    { label: "أدوات", icon: <Zap size={18} />, color: "fill-violet-600", hover: "hover:fill-violet-700", action: () => setShowAdvanced(!showAdvanced), isTools: true },
    { label: "أيقونة", icon: <ImageIcon size={18} />, color: "fill-teal-500", hover: "hover:fill-teal-600", action: onOpenIconPicker },
    { label: "حذف", icon: <Trash2 size={18} />, color: "fill-rose-500", hover: "hover:fill-rose-600", action: onDelete },
  ];

  return (
    <div 
      className="fixed z-[100] pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-[320px] h-[320px] animate-in zoom-in-75 duration-200">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
          {/* حلقة الأدوات المتقدمة (الخارجية) تظهر عند الضغط على "أدوات" */}
          {showAdvanced && isNode && (
            <g className="animate-in zoom-in-90 fade-in duration-300">
               {/* تركيز */}
               <RingSegment
                startAngle={144}
                endAngle={180}
                innerRadius={105}
                outerRadius={140}
                color="fill-indigo-500"
                hoverColor="hover:fill-indigo-600"
                onClick={onFocus}
              >
                <Eye size={16} />
                <span className="text-[6px] font-bold mt-0.5">تركيز</span>
              </RingSegment>

              {/* استهداف */}
              <RingSegment
                startAngle={180}
                endAngle={216}
                innerRadius={105}
                outerRadius={140}
                color="fill-rose-600"
                hoverColor="hover:fill-rose-700"
                onClick={onToggleTarget}
              >
                <Target size={16} />
                <span className="text-[6px] font-bold mt-0.5">هدف</span>
              </RingSegment>
            </g>
          )}

          {/* الحلقة الأساسية المكونة من 5 أقسام متساوية */}
          {segments.map((seg, i) => {
            const startAngle = i * 72;
            const endAngle = (i + 1) * 72;
            const isDisabled = !isNode && (seg.label === "أيقونة" || seg.label === "أدوات" || seg.label === "المسار");

            return (
              <RingSegment
                key={seg.label}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={45}
                outerRadius={100}
                color={seg.color}
                hoverColor={seg.hover}
                onClick={seg.action}
                disabled={isDisabled}
              >
                {seg.icon}
                <span className="text-[7px] font-bold uppercase mt-1">{seg.label}</span>
                {seg.isTools && <ChevronRight size={8} className={cn("mt-0.5 transition-transform", showAdvanced ? "rotate-90" : "")} />}
              </RingSegment>
            );
          })}

          {/* زر الإغلاق المركزي */}
          <g className="cursor-pointer group" onClick={onClose}>
            <circle cx="100" cy="100" r="43" fill="white" className="shadow-lg group-hover:fill-slate-50 transition-colors" />
            <circle cx="100" cy="100" r="38" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <foreignObject x="80" y="80" width="40" height="40">
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-all">
                <X size={20} />
                <span className="text-[6px] font-bold mt-0.5 uppercase">إغلاق</span>
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </div>
  );
};