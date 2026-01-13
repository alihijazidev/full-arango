"use client";

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as Fa6Icons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import * as HiIcons from 'react-icons/hi';
import * as Hi2Icons from 'react-icons/hi2';
import * as BiIcons from 'react-icons/bi';
import * as SiIcons from 'react-icons/si';
import * as RiIcons from 'react-icons/ri';
import * as AiIcons from 'react-icons/ai';
import * as BsIcons from 'react-icons/bs';
import * as Io5Icons from 'react-icons/io5';
import * as TiIcons from 'react-icons/ti';
import * as GiIcons from 'react-icons/gi';
import * as TbIcons from 'react-icons/tb';
import * as PiIcons from 'react-icons/pi';
import * as LuIcons from 'react-icons/lu';
import * as FcIcons from 'react-icons/fc';
import { Search, X, RotateCcw, WifiOff, Sparkles, Layers } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // دمج كافة المكتبات في مخزن واحد عملاق
  const allIcons = useMemo(() => {
    const sets = [
      { id: 'fc', name: 'Color', lib: FcIcons },
      { id: 'lu', name: 'Lucide', lib: LucideIcons.icons || LucideIcons },
      { id: 'fa6', name: 'FontAwesome 6', lib: Fa6Icons },
      { id: 'fa', name: 'FontAwesome 5', lib: FaIcons },
      { id: 'md', name: 'Material', lib: MdIcons },
      { id: 'hi2', name: 'Heroicons 2', lib: Hi2Icons },
      { id: 'hi', name: 'Heroicons 1', lib: HiIcons },
      { id: 'bi', name: 'BoxIcons', lib: BiIcons },
      { id: 'si', name: 'SimpleIcons', lib: SiIcons },
      { id: 'ri', name: 'Remix', lib: RiIcons },
      { id: 'ai', name: 'AntDesign', lib: AiIcons },
      { id: 'bs', name: 'Bootstrap', lib: BsIcons },
      { id: 'io5', name: 'Ionicons', lib: Io5Icons },
      { id: 'tb', name: 'Tabler', lib: TbIcons },
      { id: 'pi', name: 'Phosphor', lib: PiIcons },
      { id: 'gi', name: 'GameIcons', lib: GiIcons },
      { id: 'ti', name: 'Typicons', lib: TiIcons }
    ];

    const consolidated = [];
    sets.forEach(set => {
      Object.keys(set.lib).forEach(iconName => {
        // نتحقق أن العنصر هو بالفعل مكون React
        if (typeof set.lib[iconName] === 'function' || typeof set.lib[iconName] === 'object') {
          consolidated.push({
            name: iconName,
            set: set.id,
            setName: set.name,
            lib: set.lib
          });
        }
      });
    });
    return consolidated;
  }, []);

  // فلترة ذكية وسريعة
  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allIcons.slice(0, 150); // عينة أولية متنوعة

    return allIcons
      .filter(icon => icon.name.toLowerCase().includes(term))
      .slice(0, 250); // تحديد النتائج لضمان سرعة الاستجابة
  }, [searchTerm, allIcons]);

  return (
    <div className="w-[620px] bg-white border rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] p-7 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">المستودع الموحد للأيقونات</span>
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/20 bg-primary/5 text-primary">
              <Layers size={10} /> 17 مكتبة عالمية
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">ابحث في +50,000 أيقونة مخزنة محلياً (أوفلاين)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1 border-slate-200 text-slate-400">
            <WifiOff size={10} /> 100% Offline
          </Badge>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100" onClick={onClose}>
            <X size={22} className="text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder="ابحث عن أي شيء: Heart, User, Check, Facebook, Twitter..." 
            className="h-14 pr-12 text-base bg-slate-50 border-none rounded-2xl shadow-inner focus-visible:ring-primary/20 text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <Button 
          variant="outline" 
          className="h-14 px-5 gap-2 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all"
          onClick={() => onSelect(null)}
        >
          <RotateCcw size={18} />
          إعادة تعيين
        </Button>
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
         <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
           <Sparkles size={12} className="text-amber-500" />
           النتائج المتاحة: {filteredIcons.length}
         </div>
      </div>

      <ScrollArea className="h-[420px] -mr-2 pr-2">
        <div className="grid grid-cols-5 gap-4 p-1">
          {filteredIcons.map((icon, idx) => {
            const IconComponent = icon.lib[icon.name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={`${icon.set}-${icon.name}-${idx}`}
                onClick={() => onSelect({ name: icon.name, set: icon.set })}
                className="group flex flex-col items-center justify-center aspect-square rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary hover:ring-4 hover:ring-primary/5 transition-all p-3 relative overflow-hidden"
              >
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Badge className="text-[6px] h-3 px-1 bg-primary/10 text-primary border-none">
                     {icon.setName}
                   </Badge>
                </div>
                <div className="transform group-hover:scale-125 transition-transform duration-300 mb-2">
                  <IconComponent size={36} />
                </div>
                <span className="text-[7px] font-bold text-slate-400 group-hover:text-slate-900 truncate w-full text-center px-1">
                  {icon.name}
                </span>
              </button>
            );
          })}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24 opacity-60">
            <Search size={64} strokeWidth={1} />
            <p className="text-base font-bold mt-4">لم نجد أيقونة تطابق هذا البحث في المستودع</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 border-t pt-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-medium">تصفح موحد لجميع المكتبات المثبتة محلياً</span>
        </div>
        <div className="flex gap-4 opacity-70">
          <span>{allIcons.length.toLocaleString()} أيقونة محملة</span>
        </div>
      </div>
    </div>
  );
};