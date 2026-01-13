"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw, Globe, Palette, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState('flat-color-icons'); // المجموعات الملونة افتراضياً

  // البحث في Iconify API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      // البحث في المجموعة المحددة أو في الكل
      const query = activeSet === 'all' ? searchTerm : `${searchTerm}&collection=${activeSet}`;
      
      fetch(`https://api.iconify.design/search?query=${query}&limit=100`)
        .then(res => res.json())
        .then(data => {
          setResults(data.icons || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeSet]);

  return (
    <div className="w-[600px] bg-white border rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">محرك البحث عن الأيقونات</span>
            <Badge className="bg-blue-600">LIVE</Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">ابحث في أكثر من 200,000 أيقونة SVG ملونة وعادية</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="ابحث عن: User, Cloud, Bitcoin, Food..." 
            className="h-12 pr-12 text-sm bg-slate-50 border-none rounded-xl focus-visible:ring-blue-500/20 shadow-inner text-right" 
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

      <Tabs value={activeSet} onValueChange={setActiveSet} className="mb-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="flat-color-icons" className="gap-2 text-[10px]">
            <Palette size={14} /> ملونة (Flat)
          </TabsTrigger>
          <TabsTrigger value="noto" className="gap-2 text-[10px]">
            <Sparkles size={14} /> إيموجي (Google)
          </TabsTrigger>
          <TabsTrigger value="lucide" className="gap-2 text-[10px]">
            <Globe size={14} /> واجهة (Lucide)
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2 text-[10px]">
             كل المكتبات
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[380px] -mr-2 pr-2">
        {loading ? (
          <div className="grid grid-cols-5 gap-4 p-2">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-20 opacity-60">
            <Globe size={64} strokeWidth={1} />
            <p className="text-sm font-bold">{searchTerm.length < 2 ? 'ابدأ بكتابة اسم الأيقونة للبحث في السحاب...' : 'لا توجد نتائج، جرب كلمات أخرى'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3 p-1">
            {results.map(iconName => (
              <button
                key={iconName}
                onClick={() => onSelect({ name: iconName })}
                className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-blue-500/20 transition-all border border-transparent bg-slate-50 group p-2 overflow-hidden"
              >
                <div className="transform group-hover:scale-125 transition-transform duration-300 mb-2">
                  <img 
                    src={`https://api.iconify.design/${iconName.replace(':', '/')}.svg`} 
                    alt={iconName}
                    style={{ width: 32, height: 32 }}
                  />
                </div>
                <span className="text-[7px] text-slate-400 truncate w-full text-center">
                  {iconName.split(':')[1]}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 border-t pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>متصل بمحرك الأيقونات السحابي</span>
        </div>
        <Badge variant="outline" className="text-[9px]">{results.length} أيقونة جاهزة</Badge>
      </div>
    </div>
  );
};