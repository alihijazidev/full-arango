import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const isCategory = data.type === 'category';

  return (
    <div className={cn(
      "group relative flex flex-col items-center transition-all duration-300",
      selected ? "scale-105" : "scale-100"
    )}>
      {/* Target Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-primary transition-colors" 
      />
      
      {/* Main Node Body */}
      <div className={cn(
        "min-w-[120px] p-3 rounded-xl bg-white shadow-md border-2 transition-all flex flex-col items-center gap-2",
        selected 
          ? "border-primary shadow-primary/20 ring-4 ring-primary/10" 
          : "border-slate-100 hover:border-slate-300 hover:shadow-lg",
        isCategory ? "border-dashed" : "border-solid"
      )}>
        {/* Icon Header */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
          isCategory ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500",
          selected && (isCategory ? "bg-orange-500 text-white" : "bg-blue-500 text-white")
        )}>
          {isCategory ? (
            <FolderTree size={20} />
          ) : (
            <Database size={20} />
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col items-center text-center">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest mb-0.5",
            isCategory ? "text-orange-400" : "text-blue-400"
          )}>
            {isCategory ? 'فئة' : 'مجموعة'}
          </span>
          <span className="text-sm font-bold text-slate-700 truncate max-w-[100px]">
            {data.label}
          </span>
        </div>
      </div>

      {/* Source Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-primary transition-colors" 
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';