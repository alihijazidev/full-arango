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

  return (
    <div 
      className="fixed z-[100] pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-[300px] h-[300px] animate-in zoom-in-75 duration-200">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
          {/* حلقة الأدوات المتقدمة (الخارجية) */}
          {showAdvanced && isNode && (
            <g className="animate-in zoom-in-90 fade-in duration-300">
               {/* تركيز */}
               <RingSegment
                startAngle={225}
                endAngle={285}
                innerRadius={97}
                outerRadius={135}
                color="fill-indigo-500"
                hoverColor="hover:fill-indigo-600"
                onClick={onFocus}
              >
                <Eye size={16} />
                <span className="text-[6px] font-bold mt-0.5">تركيز</span>
              </RingSegment>

              {/* استهداف */}
              <RingSegment
                startAngle={285}
                endAngle={345}
                innerRadius={97}
                outerRadius={135}
                color="fill-rose-600"
                hoverColor="hover:fill-rose-700"
                onClick={onToggleTarget}
              >
                <Target size={16} />
                <span className="text-[6px] font-bold mt-0.5">هدف</span>
              </RingSegment>

              {/* إضافة للمسار */}
              <RingSegment
                startAngle={345}
                endAngle={45}
                innerRadius={97}
                outerRadius={135}
                color="fill-amber-500"
                hoverColor="hover:fill-amber-600"
                onClick={onAddToPath}
              >
                <MapPinned size={16} />
                <span className="text-[6px] font-bold mt-0.5">للمسار</span>
              </RingSegment>
            </g>
          )}

          {/* الحلقة الأساسية (الداخلية) */}
          {/* حذف */}
          <RingSegment
            startAngle={225}
            endAngle={270}
            innerRadius={45}
            outerRadius={95}
            color="fill-rose-500"
            hoverColor="hover:fill-rose-600"
            onClick={onDelete}
          >
            <Trash2 size={18} />
            <span className="text-[7px] font-bold uppercase mt-0.5">حذف</span>
          </RingSegment>

          {/* أيقونة */}
          <RingSegment
            startAngle={270}
            endAngle={315}
            innerRadius={45}
            outerRadius={95}
            color={isNode ? "fill-teal-500" : "fill-slate-300"}
            hoverColor={isNode ? "hover:fill-teal-600" : ""}
            onClick={onOpenIconPicker}
            disabled={!isNode}
          >
            <ImageIcon size={18} />
            <span className="text-[7px] font-bold uppercase mt-0.5">أيقونة</span>
          </RingSegment>

          {/* أدوات متقدمة - خيار جديد يفتح الحلقة الخارجية */}
          <RingSegment
            startAngle={315}
            endAngle={360}
            innerRadius={45}
            outerRadius={95}
            color={isNode ? "fill-violet-600" : "fill-slate-300"}
            hoverColor={isNode ? "hover:fill-violet-700" : ""}
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={!isNode}
          >
            <Zap size={18} className={showAdvanced ? "animate-pulse" : ""} />
            <span className="text-[7px] font-bold uppercase mt-0.5">أدوات</span>
            <ChevronRight size={8} className={cn("mt-0.5 transition-transform", showAdvanced ? "rotate-90" : "")} />
          </RingSegment>

          {/* إغلاق */}
          <RingSegment
            startAngle={360}
            endAngle={405}
            innerRadius={45}
            outerRadius={95}
            color="fill-slate-800"
            hoverColor="hover:fill-slate-900"
            onClick={onClose}
          >
            <X size={18} />
            <span className="text-[7px] font-bold uppercase mt-0.5">إغلاق</span>
          </RingSegment>

          {/* تفاصيل */}
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

          <circle cx="100" cy="100" r="43" fill="white" className="shadow-inner" />
          <circle cx="100" cy="100" r="30" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="100" cy="100" r="4" fill="#cbd5e1" />
        </svg>
      </div>
    </div>
  );
};