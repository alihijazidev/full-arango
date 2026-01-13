"use client";

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FlatIcons from 'react-icons/fc';
import { Search, X, RotateCcw, WifiOff, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // دمج كافة الأيقونات في قائمة واحدة مع تحديد المصدر
  const allIcons = useMemo(() => {
    const lucide = Object.keys(LucideIcons)
      .filter(key => typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object')
      .map(name => ({ name, set: 'lucide', lib: LucideIcons }));
      
    const fc = Object.keys(FlatIcons)
      .filter(key => key.startsWith('Fc'))
      .map(name => ({ name, set: 'fc', lib: FlatIcons }));

    return [...fc, ...lucide];
  }, []);

  // فلترة القائمة الموحدة بناءً على كلمة البحث
  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allIcons.slice(0, 150); // عرض عينة أولية عند فتح القائمة

    return allIcons
      .filter(icon => icon.name.toLowerCase().includes(term))
      .slice(0, 200); // تحديد النتائج لسرعة العرض
  }, [searchTerm, allIcons]);

  return (
    <div className="w-[580px] bg-white border rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-7 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">البحث الشامل عن الأيقونات</span>
            <Badge variant="outline" className="text-[10px] gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
              <WifiOff size={10} /> أوفلاين بالكامل
            </Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">ابحث في آلاف الأيقونات الملونة والوظيفية من مكان واحد</span>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X size={22} className="text-slate-400" />
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder="ابحث عن: User, Home, Cloud, Payment..." 
            className="h-14 pr-12 text-base bg-slate-50 border-none rounded-2xl shadow-inner focus-visible:ring-primary/20 text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <Button 
          variant="outline" 
          className="h-14 px-5 gap-2 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold"
          onClick={() => onSelect(null)}
        >
          <RotateCcw size={18} />
          الأصل
        </Button>
      </div>

      <div className="bg-slate-50/50 rounded-2xl p-2 mb-2">
         <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
           <Sparkles size={12} className="text-amber-500" />
           نتائج البحث الموحدة ({filteredIcons.length})
         </div>
      </div>

      <ScrollArea className="h-[400px] -mr-2 pr-2">
        <div className="grid grid-cols-5 gap-4 p-1">
          {filteredIcons.map(icon => {
            const IconComponent = icon.lib[icon.name];
            return (
              <button
                key={`${icon.set}-${icon.name}`}
                onClick={() => onSelect({ name: icon.name, set: icon.set })}
                className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all border border-transparent bg-white shadow-sm group p-3"
              >
                <div className="transform group-hover:scale-125 transition-transform duration-300 mb-2">
                  <IconComponent size={34} />
                </div>
                <div className="flex flex-col items-center w-full">
                  <span className="text-[8px] font-black text-slate-700 truncate w-full text-center">
                    {icon.name.replace('Fc', '')}
                  </span>
                  <Badge className="text-[6px] h-3 px-1 mt-1 bg-slate-100 text-slate-400 border-none group-hover:bg-primary/10 group-hover:text-primary">
                    {icon.set === 'fc' ? 'COLOR' : 'UI'}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24 opacity-60">
            <Search size={64} strokeWidth={1} />
            <p className="text-base font-bold mt-4">لا توجد أيقونات تطابق بحثك محلياً</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 border-t pt-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="font-medium text-slate-500">البحث يعمل في الوضع المحلي (أوفلاين)</span>
        </div>
        <div className="flex gap-3">
          <span className="opacity-50">تلميح: ابحث بالإنجليزية</span>
        </div>
      </div>
    </div>
  );
};