"use client";

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // نستخدم مكتبة Lucide فقط لضمان الأداء والاتساق البصري (كافة الأيقونات SVG)
  const allIcons = useMemo(() => {
    return Object.keys(LucideIcons)
      .filter(key => key !== 'createLucideIcon' && key !== 'icons' && typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object')
      .map(key => ({ name: key, component: LucideIcons[key] }));
  }, []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allIcons
      .filter(icon => icon.name.toLowerCase().includes(term))
      .slice(0, 200); // نكتفي بعرض أول 200 نتيجة لضمان سلاسة الواجهة
  }, [searchTerm, allIcons]);

  return (
    <div className="w-[500px] bg-white border rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 tracking-tight">مكتبة أيقونات Lucide SVG</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold">عالية الجودة</Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">أيقونات رشيقة وسريعة التحميل</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-2 text-[10px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => onSelect(null)}
          >
            <RotateCcw size={12} />
            إعادة تعيين
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </Button>
        </div>
      </div>
      
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="ابحث عن أيقونة (مثلاً: User, Home, Database)..." 
          className="h-12 pr-12 text-sm bg-white border-slate-200 rounded-2xl focus-visible:ring-primary/20 shadow-sm text-right" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-[350px] -mr-2 pr-2">
        {filteredIcons.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50 py-10">
            <Search size={48} />
            <p className="text-sm font-medium">لم نجد أيقونة بهذا الاسم</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3 p-1">
            {filteredIcons.map(item => {
              const IconComponent = item.component;
              return (
                <button
                  key={item.name}
                  onClick={() => onSelect({ name: item.name, set: 'lucide' })}
                  className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-primary hover:text-white transition-all border border-slate-50 hover:border-primary shadow-sm group bg-white relative overflow-hidden p-2"
                  title={item.name}
                >
                  <IconComponent size={28} className="group-hover:scale-110 transition-transform relative z-10" />
                  <span className="text-[7px] mt-1 opacity-40 group-hover:opacity-100 truncate w-full text-center">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 border-t pt-4">
        <span>تم تحسين الأداء عبر استخدام مكتبة SVG موحدة</span>
        <Badge variant="outline" className="text-[10px] font-black">{filteredIcons.length} أيقونة معروضة</Badge>
      </div>
    </div>
  );
};