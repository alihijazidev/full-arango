"use client";

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FlatIcons from 'react-icons/fc';
import { Search, X, RotateCcw, Palette, Layers } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lucide');

  const lucideIcons = useMemo(() => {
    return Object.keys(LucideIcons)
      .filter(key => key !== 'createLucideIcon' && key !== 'icons' && (typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object'))
      .map(key => ({ name: key, component: LucideIcons[key], set: 'lucide' }));
  }, []);

  const fcIcons = useMemo(() => {
    return Object.keys(FlatIcons)
      .map(key => ({ name: key, component: FlatIcons[key], set: 'fc' }));
  }, []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const currentSet = activeTab === 'lucide' ? lucideIcons : fcIcons;
    return currentSet
      .filter(icon => icon.name.toLowerCase().includes(term))
      .slice(0, 150);
  }, [searchTerm, activeTab, lucideIcons, fcIcons]);

  return (
    <div className="w-[500px] bg-white border rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 tracking-tight">مكتبة الأيقونات المتقدمة</span>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] font-bold">SVG 4.0</Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">اختر بين الأيقونات الملونة أو الأيقونات الهيكلية</span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
          <TabsTrigger value="lucide" className="gap-2 text-xs">
            <Layers size={14} />
            أيقونات واجهة (أحادية)
          </TabsTrigger>
          <TabsTrigger value="fc" className="gap-2 text-xs">
            <Palette size={14} />
            أيقونات ملونة (Flat)
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder={activeTab === 'lucide' ? "بحث في Lucide..." : "بحث في الأيقونات الملونة..."} 
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
            <p className="text-sm font-medium">لم نجد أيقونة بهذا الاسم في هذه المجموعة</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3 p-1">
            {filteredIcons.map(item => {
              const IconComponent = item.component;
              return (
                <button
                  key={item.name}
                  onClick={() => onSelect({ name: item.name, set: item.set })}
                  className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-slate-50 transition-all border border-slate-50 hover:border-primary shadow-sm group bg-white relative overflow-hidden p-2"
                  title={item.name}
                >
                  <IconComponent size={32} className="group-hover:scale-110 transition-transform relative z-10" />
                  <span className="text-[7px] mt-1 opacity-40 group-hover:opacity-100 truncate w-full text-center">
                    {item.name.replace('Fc', '')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 border-t pt-4">
        <span>أيقونات SVG عالية الدقة قابلة للتكبير دون فقدان الجودة</span>
        <Badge variant="outline" className="text-[10px] font-black">المجموعة: {activeTab === 'lucide' ? 'Lucide' : 'Flat Colors'}</Badge>
      </div>
    </div>
  );
};