"use client";

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FlatIcons from 'react-icons/fc';
import { Search, X, RotateCcw, Palette, Layers, WifiOff } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('fc'); // الملونة هي التبويب الافتراضي

  // جلب كافة الأسماء من المكتبات المحلية
  const lucideList = useMemo(() => 
    Object.keys(LucideIcons).filter(key => typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object'), []
  );
  
  const fcList = useMemo(() => 
    Object.keys(FlatIcons).filter(key => key.startsWith('Fc')), []
  );

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const list = activeTab === 'fc' ? fcList : lucideList;
    return list
      .filter(name => name.toLowerCase().includes(term))
      .slice(0, 100); // عرض أول 100 نتيجة فقط للأداء
  }, [searchTerm, activeTab, lucideList, fcList]);

  return (
    <div className="w-[550px] bg-white border rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900">مكتبة الأيقونات (أوفلاين)</span>
            <Badge variant="outline" className="text-[10px] gap-1 border-slate-300">
              <WifiOff size={10} /> 100% Offline
            </Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">تصفح آلاف الأيقونات المدمجة محلياً في التطبيق</span>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X size={20} className="text-slate-400" />
        </Button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="ابحث محلياً: User, Home, Cloud..." 
            className="h-12 pr-12 text-sm bg-slate-50 border-none rounded-xl text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <Button 
          variant="outline" 
          className="h-12 gap-2 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl"
          onClick={() => onSelect(null)}
        >
          <RotateCcw size={16} />
          الأصل
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="fc" className="gap-2 text-xs">
            <Palette size={14} /> أيقونات ملونة
          </TabsTrigger>
          <TabsTrigger value="lucide" className="gap-2 text-xs">
            <Layers size={14} /> أيقونات واجهة
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[350px] -mr-2 pr-2">
        <div className="grid grid-cols-5 gap-3 p-1">
          {filteredIcons.map(name => {
            const IconLib = activeTab === 'fc' ? FlatIcons : LucideIcons;
            const IconComponent = IconLib[name];
            return (
              <button
                key={name}
                onClick={() => onSelect({ name, set: activeTab })}
                className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all border border-transparent bg-slate-50 group p-2"
              >
                <div className="transform group-hover:scale-110 transition-transform mb-2">
                  <IconComponent size={32} />
                </div>
                <span className="text-[7px] text-slate-400 truncate w-full text-center">
                  {name.replace('Fc', '')}
                </span>
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 opacity-60">
            <Search size={48} />
            <p className="text-sm font-bold">لا توجد نتائج مطابقة محلياً</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 border-t pt-4">
        <span>تم تحميل {filteredIcons.length} أيقونة من المكتبة المحلية</span>
        <Badge variant="secondary" className="text-[9px]">حماية الخصوصية: مفعلة</Badge>
      </div>
    </div>
  );
};