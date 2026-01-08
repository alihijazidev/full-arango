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
      <div className="relative w-52 h-52 flex items-center justify-center animate-in zoom-in-75 duration-200">
        {/* Main Outer Disk Shadow/Border */}
        <div className="absolute inset-0 rounded-full border-[6px] border-white shadow-[0_15px_50px_-10px_rgba(0,0,0,0.4)] bg-slate-100 overflow-hidden" />
        
        {/* Action: Delete (Top-Left Segment) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={cn(
            "absolute inset-0 transition-all duration-300 group",
            "bg-rose-500 hover:bg-rose-600 text-white"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}
          title="حذف"
        >
          <div className="absolute top-[18%] left-[28%] -translate-x-1/2 flex flex-col items-center group-hover:scale-110 transition-transform">
            <Trash2 size={22} />
            <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">حذف</span>
          </div>
        </button>

        {/* Action: Details (Bottom Segment) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
          className={cn(
            "absolute inset-0 transition-all duration-300 group border-t-2 border-white/20",
            "bg-blue-600 hover:bg-blue-700 text-white"
          )}
          style={{ clipPath: 'polygon(50% 50%, 0 100%, 100% 100%)' }}
          title="تفاصيل"
        >
          <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 flex flex-col items-center group-hover:scale-110 transition-transform">
            <Info size={24} />
            <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">تفاصيل</span>
          </div>
        </button>

        {/* Action: Close (Top-Right Segment) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={cn(
            "absolute inset-0 transition-all duration-300 group",
            "bg-slate-800 hover:bg-slate-900 text-white"
          )}
          style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}
          title="إغلاق"
        >
          <div className="absolute top-[18%] right-[28%] translate-x-1/2 flex flex-col items-center group-hover:scale-110 transition-transform">
            <X size={22} />
            <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">إغلاق</span>
          </div>
        </button>

        {/* The Hub (Open Center) */}
        <div className="absolute w-20 h-20 rounded-full bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] z-10 pointer-events-none flex items-center justify-center">
           <div className="w-12 h-12 rounded-full border-4 border-slate-50 bg-white shadow-sm flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-slate-200" />
           </div>
        </div>

        {/* Highlight separator lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/30 rotate-[45deg]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/30 -rotate-[45deg]" />
        </div>
      </div>
    </div>
  );
};