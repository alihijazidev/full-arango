import React from 'react';
import { Trash2, Info, X } from 'lucide-react';
import { Button } from './ui/button';

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
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background Overlay to close */}
        <div className="absolute inset-0 rounded-full bg-black/5 backdrop-blur-sm border border-white/20 animate-in zoom-in duration-200" />
        
        {/* Delete Action */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-0 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={18} />
        </Button>

        {/* Details Action */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
        >
          <Info size={18} />
        </Button>

        {/* Close Action */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};