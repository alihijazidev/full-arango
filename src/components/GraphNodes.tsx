import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const isCategory = data.type === 'category';

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 transition-all",
      selected ? "scale-110" : "scale-100"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors",
        selected ? "border-primary bg-primary/10" : "border-white bg-white",
        isCategory ? "border-dashed border-orange-200" : "border-blue-100"
      )}>
        {isCategory ? (
          <FolderTree size={32} className="text-orange-500" />
        ) : (
          <Database size={32} className="text-blue-500" />
        )}
      </div>

      <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border shadow-sm flex flex-col items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          {isCategory ? 'فئة' : 'مجموعة'}
        </span>
        <span className="text-xs font-bold text-gray-900">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';