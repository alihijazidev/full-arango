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
      className="fixed z-50 pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-40 h-40 flex items-center justify-center animate-in zoom-in duration-200">
        {/* The Disk Container */}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden" />
        
        {/* Inner Hole */}
        <div className="absolute w-16 h-16 rounded-full bg-slate-900/10 border border-white/20 z-10 pointer-events-none flex items-center justify-center">
           <div className="w-12 h-12 rounded-full bg-white/20 blur-xl" />
        </div>

        {/* Action: Delete Segment (Top-Left) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={cn(
            "absolute inset-0 group transition-all duration-300",
            "hover:bg-destructive/20 active:bg-destructive/40"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 50%, 50% 50%)' }}
          title="حذف"
        >
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
            <Trash2 size={20} className="text-destructive" />
            <span className="text-[8px] font-bold uppercase text-destructive opacity-0 group-hover:opacity-100 transition-opacity">حذف</span>
          </div>
        </button>

        {/* Action: Details Segment (Bottom) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
          className={cn(
            "absolute inset-0 group transition-all duration-300",
            "hover:bg-primary/20 active:bg-primary/40"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 100%, 100% 100%, 100% 50%, 0% 50%, 50% 50%)' }}
          title="تفاصيل"
        >
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
            <Info size={20} className="text-primary" />
            <span className="text-[8px] font-bold uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">تفاصيل</span>
          </div>
        </button>

        {/* Action: Close Segment (Top-Right-ish / Rest) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={cn(
            "absolute inset-0 group transition-all duration-300",
            "hover:bg-slate-200/50 active:bg-slate-300/50"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 0, 0 50%, 50% 50%)' }}
          title="إغلاق"
        >
          <div className="absolute top-[35%] left-[20%] flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
            <X size={18} className="text-slate-500" />
          </div>
        </button>
      </div>
    </div>
  );
};