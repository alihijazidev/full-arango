import React, { useState, useMemo } from 'react';
import { icons, Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

// الحصول على كافة أسماء الأيقونات الصالحة من كائن icons الرسمي
const ALL_LUCIDE_ICONS = Object.keys(icons).sort();

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return ALL_LUCIDE_ICONS.filter(name => 
      name.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="w-80 bg-white border rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 uppercase">مكتبة الأيقونات ({ALL_LUCIDE_ICONS.length})</span>
          <span className="text-[10px] text-slate-400">جميع أيقونات Lucide متاحة للبحث</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input 
          placeholder="بحث (مثلاً: User, Heart, Settings)..." 
          className="h-10 pr-8 text-xs bg-slate-50 border-none shadow-inner" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-72">
        <div className="grid grid-cols-5 gap-2 pr-2">
          {filteredIcons.map(name => {
            const IconComponent = icons[name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 group"
                title={name}
              >
                <IconComponent size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            );
          })}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
            <Search size={32} className="opacity-10" />
            <p className="text-xs italic">لا توجد نتائج</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};