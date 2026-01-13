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

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allIcons.slice(0, 100);
    return allIcons
      .filter(icon => icon.name.toLowerCase().includes(term))
      .slice(0, 200);
  }, [searchTerm, allIcons]);

  return (
    <div className="w-96 border-r bg-white flex flex-col h-full shadow-2xl" dir="rtl">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="font-bold text-lg">مستودع الأيقونات</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/20 bg-primary/5 text-primary">
              <Layers size={10} /> 17 مكتبة
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 border-slate-200 text-slate-400">
              <WifiOff size={10} /> أوفلاين
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="ابحث (Heart, User, Facebook...)" 
            className="pr-9 h-10 bg-slate-50 border-none text-sm text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full gap-2 border-rose-100 text-rose-600 hover:bg-rose-50"
          onClick={() => onSelect(null)}
        >
          <RotateCcw size={14} />
          إعادة التعيين للأصل
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-3 gap-3">
          {filteredIcons.map((icon, idx) => {
            const IconComponent = icon.lib[icon.name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={`${icon.set}-${icon.name}-${idx}`}
                onClick={() => onSelect({ name: icon.name, set: icon.set })}
                className="group flex flex-col items-center justify-center aspect-square rounded-xl bg-slate-50 border border-transparent hover:bg-white hover:border-primary hover:shadow-lg transition-all p-2 relative overflow-hidden"
              >
                <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[5px] font-bold px-1 bg-primary/10 text-primary rounded">
                     {icon.setName}
                   </span>
                </div>
                <div className="transform group-hover:scale-110 transition-transform mb-1">
                  <IconComponent size={24} />
                </div>
                <span className="text-[8px] text-slate-400 truncate w-full text-center px-1">
                  {icon.name}
                </span>
              </button>
            );
          })}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 opacity-60">
            <Search size={48} />
            <p className="text-xs font-bold mt-2">لا توجد نتائج</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t bg-slate-50 text-[10px] text-slate-400 flex justify-between items-center">
        <span>{allIcons.length.toLocaleString()} أيقونة محملة</span>
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-amber-500" />
          بحث موحد
        </span>
      </div>
    </div>
  );
};