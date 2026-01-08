import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const isCategory = data.type === 'category';

  return (
    <div className={cn(
      "px-4 py-2 shadow-md rounded-md bg-white border-2 transition-all",
      selected ? "border-primary ring-2 ring-primary/20" : "border-gray-200",
      isCategory ? "bg-slate-50 border-dashed" : "bg-white"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="flex items-center gap-2">
        <div className={cn(
          "p-1.5 rounded-full",
          isCategory ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
        )}>
          {isCategory ? <FolderTree size={16} /> : <Database size={16} />}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {data.type}
          </span>
          <span className="text-sm font-bold text-gray-900">{data.label}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';