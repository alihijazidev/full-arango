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

export const RadialMenu: React.FC<RadialMenuProps> = ({ x, y, onDelete, onDetails, onClose }) => {
  return (
    <div 
      className="fixed z-[100] pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-48 h-48 flex items-center justify-center animate-in zoom-in-75 duration-200">
        {/* Main Disk Base */}
        <div className="absolute inset-0 rounded-full bg-slate-100 border-4 border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden" />
        
        {/* Segment 1: Delete (Top-Left) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={cn(
            "absolute inset-0 transition-all duration-200",
            "bg-white hover:bg-destructive hover:text-white text-destructive border-r border-b border-slate-100"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}
          title="حذف"
        >
          <div className="absolute top-[18%] left-[28%] -translate-x-1/2 flex flex-col items-center">
            <Trash2 size={20} />
            <span className="text-[10px] font-bold mt-1">حذف</span>
          </div>
        </button>

        {/* Segment 2: Details (Bottom) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
          className={cn(
            "absolute inset-0 transition-all duration-200",
            "bg-white hover:bg-primary hover:text-white text-primary border-t border-slate-100"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 100%, 100% 100%)' }}
          title="تفاصيل"
        >
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Info size={22} />
            <span className="text-[10px] font-bold mt-1">تفاصيل</span>
          </div>
        </button>

        {/* Segment 3: Close (Top-Right) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={cn(
            "absolute inset-0 transition-all duration-200",
            "bg-white hover:bg-slate-800 hover:text-white text-slate-500 border-l border-b border-slate-100"
          )}
          style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}
          title="إغلاق"
        >
          <div className="absolute top-[18%] right-[28%] translate-x-1/2 flex flex-col items-center">
            <X size={20} />
            <span className="text-[10px] font-bold mt-1">إغلاق</span>
          </div>
        </button>

        {/* The Open Center (The Hole) */}
        <div className="absolute w-16 h-16 rounded-full bg-slate-50 border-4 border-white shadow-inner z-10 pointer-events-none flex items-center justify-center">
           <div className="w-10 h-10 rounded-full bg-white shadow-sm" />
        </div>

        {/* Decorative Separators */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-100/50 rotate-[45deg]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-100/50 -rotate-[45deg]" />
        </div>
      </div>
    </div>
  );
};