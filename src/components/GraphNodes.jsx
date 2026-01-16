import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { useGraph } from '../store/GraphContext';
import { getArabicName, getIcon, getColorStyles } from '../utils/mapping';

export const CustomNode = memo(({ data, selected }) => {
  const { globalIcons } = useGraph();
  const isCategory = data.type === 'category';
  const displayLabel = data.instanceId ? data.instanceId : getArabicName(data.label);
  
  // جلب الأيقونة
  const icon = getIcon(data.label, data.type, globalIcons);
  const colors = getColorStyles(data.label, selected);

  return (
    <div className={cn(
      "group relative flex flex-col items-center transition-all duration-300",
      selected ? "scale-110" : "scale-100 hover:scale-105"
    )}>
      {/* مقابض التوصيل مخفية جزئياً وتظهر عند الحاجة أو الاختيار */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "!w-2 !h-2 !bg-slate-300 !border-none transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} 
      />
      
      <div className="flex flex-col items-center gap-1.5 p-2">
        {/* حاوية الأيقونة - بدون خلفية بيضاء */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          selected 
            ? cn(colors.bg, colors.text, "ring-4 ring-offset-2 shadow-xl", colors.ring) 
            : cn("bg-transparent", colors.text, "group-hover:scale-110")
        )}>
          {/* نزيد حجم الأيقونة قليلاً لتكون أوضح */}
          <div className="transform scale-125">
            {icon}
          </div>
        </div>

        {/* تسمية العقدة */}
        <div className="flex flex-col items-center text-center max-w-[120px]">
          <span className={cn(
            "text-[8px] font-bold uppercase tracking-widest mb-0.5 transition-colors",
            selected ? colors.accent : "text-slate-400"
          )}>
            {isCategory ? 'فئة' : getArabicName(data.label)}
          </span>
          <span className={cn(
            "font-bold truncate w-full px-1 transition-all",
            selected ? "text-slate-900 scale-105" : "text-slate-600",
            data.instanceId ? "text-[9px] font-mono" : "text-xs"
          )}>
            {displayLabel}
          </span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          "!w-2 !h-2 !bg-slate-300 !border-none transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} 
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';