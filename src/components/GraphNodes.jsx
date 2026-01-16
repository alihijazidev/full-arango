import React, { memo, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { useGraph } from '../store/GraphContext';
import { getArabicName, getIcon, getColorStyles } from '../utils/mapping';
import { Target } from 'lucide-react';

export const CustomNode = memo(({ id, data, selected }) => {
  const { globalIcons, focusedNodeId, edges, targetNodeIds } = useGraph();
  const isCategory = data.type === 'category';
  const displayLabel = data.instanceId ? data.instanceId : getArabicName(data.label);
  
  const icon = getIcon(data.label, data.type, globalIcons);
  const colors = getColorStyles(data.label, selected);

  const isTarget = targetNodeIds.has(id);

  // منطق التركيز: إذا كان هناك عقدة مفوكس عليها، هل أنا هي أو هل أنا متصل بها؟
  const isDimmed = useMemo(() => {
    if (!focusedNodeId || focusedNodeId === id) return false;
    // التحقق من الاتصال
    return !edges.some(e => (e.source === id && e.target === focusedNodeId) || (e.target === id && e.source === focusedNodeId));
  }, [focusedNodeId, id, edges]);

  return (
    <div className={cn(
      "group relative flex flex-col items-center transition-all duration-500",
      selected ? "scale-110 z-50" : "scale-100 hover:scale-105",
      isDimmed ? "opacity-20 blur-[1px] grayscale pointer-events-none" : "opacity-100",
      focusedNodeId === id && "ring-4 ring-indigo-400 ring-offset-4 rounded-full"
    )}>
      {/* تأثير "الهدف" المتقدم */}
      {isTarget && (
        <div className="absolute inset-0 -m-4">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 border-2 border-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white p-1 rounded-full shadow-lg z-[60]">
            <Target size={12} className="animate-spin-slow" />
          </div>
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "!w-2 !h-2 !bg-slate-300 !border-none transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} 
      />
      
      <div className="flex flex-col items-center gap-1.5 p-2">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          selected 
            ? cn(colors.bg, colors.text, "ring-4 ring-offset-2 shadow-xl", colors.ring) 
            : cn("bg-transparent", colors.text, "group-hover:scale-110")
        )}>
          <div className="transform scale-125">
            {icon}
          </div>
        </div>

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