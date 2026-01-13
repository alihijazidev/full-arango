import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

// قائمة بأهم الأيقونات الشائعة لتقليل الحجم وتحسين الأداء
const COMMON_ICONS = [
  'User', 'UserCircle', 'Users', 'Fingerprint', 'FileText', 'MessageSquare', 
  'MessageCircle', 'ShoppingBag', 'ShoppingCart', 'Package', 'Activity',
  'Bell', 'Calendar', 'Camera', 'Check', 'ChevronRight', 'Clock', 'Cloud',
  'Code', 'Database', 'Eye', 'Gift', 'Globe', 'Heart', 'Home', 'Image',
  'Info', 'Key', 'Layers', 'Link', 'Lock', 'Mail', 'Map', 'Navigation',
  'Phone', 'Play', 'Search', 'Settings', 'Share2', 'Star', 'Tag', 'Trash2'
];

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    return COMMON_ICONS.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="w-64 bg-white border rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase">اختر أيقونة</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input 
          placeholder="بحث..." 
          className="h-8 pr-8 text-xs bg-slate-50 border-none" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-48">
        <div className="grid grid-cols-4 gap-2">
          {filteredIcons.map(name => {
            const IconComponent = LucideIcons[name];
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className="flex items-center justify-center p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                title={name}
              >
                <IconComponent size={20} />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            لا توجد نتائج
          </div>
        )}
      </ScrollArea>
    </div>
  );
};