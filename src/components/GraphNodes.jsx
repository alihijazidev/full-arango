import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { getArabicName, getIcon, getColorStyles } from '../utils/mapping';

export const CustomNode = memo(({ data, selected }) => {
  const isCategory = data.type === 'category';
  const displayName = getArabicName(data.label);
  const icon = getIcon(data.label, data.type);
  const colors = getColorStyles(data.label, selected);

  return (
    <div className={cn(
      "group relative flex flex-col items-center transition-all duration-300",
      selected ? "scale-105" : "scale-100"
    )}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-primary transition-colors" 
      />
      
      <div className={cn(
        "min-w-[140px] p-3 rounded-xl bg-white shadow-md border-2 transition-all flex flex-col items-center gap-2",
        selected 
          ? cn("shadow-lg ring-4", colors.border, colors.ring, colors.shadow) 
          : "border-slate-100 hover:border-slate-300 hover:shadow-lg",
        isCategory ? "border-dashed" : "border-solid"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
          colors.bg,
          colors.text
        )}>
          {icon}
        </div>

        <div className="flex flex-col items-center text-center">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest mb-0.5",
            colors.accent
          )}>
            {isCategory ? 'فئة' : 'مجموعة'}
          </span>
          <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">
            {displayName}
          </span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-primary transition-colors" 
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';