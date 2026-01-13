import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as HiIcons from 'react-icons/hi';
import * as BiIcons from 'react-icons/bi';
import * as SiIcons from 'react-icons/si';
import * as RiIcons from 'react-icons/ri';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lucide');

  const iconSets = useMemo(() => ({
    lucide: { name: 'Lucide', icons: Object.keys(LucideIcons.icons), lib: LucideIcons.icons },
    fa: { name: 'Font Awesome', icons: Object.keys(FaIcons), lib: FaIcons },
    md: { name: 'Material', icons: Object.keys(MdIcons), lib: MdIcons },
    hi: { name: 'Heroicons', icons: Object.keys(HiIcons), lib: HiIcons },
    bi: { name: 'BoxIcons', icons: Object.keys(BiIcons), lib: BiIcons },
    ri: { name: 'Remix', icons: Object.keys(RiIcons), lib: RiIcons },
    si: { name: 'Simple (Tech)', icons: Object.keys(SiIcons), lib: SiIcons },
  }), []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const currentSet = iconSets[activeTab];
    return currentSet.icons.filter(name => 
      name.toLowerCase().includes(term)
    ).slice(0, 150); // تحسين الأداء عبر تقليل العدد المعروض في المرة الواحدة
  }, [searchTerm, activeTab, iconSets]);

  return (
    <div className="w-[450px] bg-white border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-5 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900 tracking-tight">المكتبة العالمية الكبرى</span>
          <span className="text-[10px] text-slate-500 font-medium">أكثر من 20,000 أيقونة احترافية متاحة</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X size={18} className="text-slate-400" />
        </Button>
      </div>

      <div className="relative mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-auto bg-slate-100/50 p-1 rounded-xl">
              {Object.entries(iconSets).map(([key, set]) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="px-4 py-1.5 text-[11px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  {set.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <Input 
          placeholder={`بحث في مكتبة ${iconSets[activeTab].name}...`} 
          className="h-11 pr-10 text-xs bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary/20" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-80 -mr-2 pr-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map(name => {
            const IconComponent = iconSets[activeTab].lib[name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={`${activeTab}-${name}`}
                onClick={() => onSelect({ name, set: activeTab })}
                className="flex items-center justify-center aspect-square rounded-xl hover:bg-primary hover:text-white transition-all border border-slate-50 hover:border-primary shadow-sm group bg-white"
                title={name}
              >
                <IconComponent size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            );
          })}
          {filteredIcons.length === 0 && (
            <div className="col-span-6 py-12 text-center">
              <p className="text-slate-400 text-xs">لا توجد أيقونات تطابق بحثك في هذه المكتبة</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400 border-t pt-3">
        <span>مكتبة {iconSets[activeTab].name} تحتوي على {iconSets[activeTab].icons.length} أيقونة</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">تم تحميل {filteredIcons.length} نتيجة</span>
      </div>
    </div>
  );
};