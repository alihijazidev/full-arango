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
import * as VscIcons from 'react-icons/vsc';
import * as FcIcons from 'react-icons/fc';
import * as WiIcons from 'react-icons/wi';
import * as GoIcons from 'react-icons/go';
import * as ImIcons from 'react-icons/im';
import * as GrIcons from 'react-icons/gr';
import * as CgIcons from 'react-icons/cg';
import * as DiIcons from 'react-icons/di';
import * as FiIcons from 'react-icons/fi';
import * as PiIcons from 'react-icons/pi';
import * as TbIcons from 'react-icons/tb';
import * as TfiIcons from 'react-icons/tfi';
import * as SlIcons from 'react-icons/sl';
import * as RxIcons from 'react-icons/rx';
import * as LiaIcons from 'react-icons/lia';
import * as CiIcons from 'react-icons/ci';
import * as LuIcons from 'react-icons/lu';
import { Search, X, Layers, RotateCcw } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const iconSets = useMemo(() => ({
    lucide: { name: 'Lucide', icons: Object.keys(LucideIcons.icons), lib: LucideIcons.icons },
    tb: { name: 'Tabler', icons: Object.keys(TbIcons), lib: TbIcons },
    pi: { name: 'Phosphor', icons: Object.keys(PiIcons), lib: PiIcons },
    fa6: { name: 'FA 6', icons: Object.keys(Fa6Icons), lib: Fa6Icons },
    fa: { name: 'FA 5', icons: Object.keys(FaIcons), lib: FaIcons },
    rx: { name: 'Radix', icons: Object.keys(RxIcons), lib: RxIcons },
    lia: { name: 'Line Awesome', icons: Object.keys(LiaIcons), lib: LiaIcons },
    ci: { name: 'Circum', icons: Object.keys(CiIcons), lib: CiIcons },
    lu: { name: 'Lucide (M)', icons: Object.keys(LuIcons), lib: LuIcons },
    fc: { name: 'Flat Color', icons: Object.keys(FcIcons), lib: FcIcons },
    di: { name: 'Devicons', icons: Object.keys(DiIcons), lib: DiIcons },
    md: { name: 'Material', icons: Object.keys(MdIcons), lib: MdIcons },
    ai: { name: 'Ant Design', icons: Object.keys(AiIcons), lib: AiIcons },
    bs: { name: 'Bootstrap', icons: Object.keys(BsIcons), lib: BsIcons },
    hi2: { name: 'Heroicons 2', icons: Object.keys(Hi2Icons), lib: Hi2Icons },
    hi: { name: 'Heroicons 1', icons: Object.keys(HiIcons), lib: HiIcons },
    fi: { name: 'Feather', icons: Object.keys(FiIcons), lib: FiIcons },
    go: { name: 'Octicons', icons: Object.keys(GoIcons), lib: GoIcons },
    io5: { name: 'Ionicons', icons: Object.keys(Io5Icons), lib: Io5Icons },
    gi: { name: 'Game Icons', icons: Object.keys(GiIcons), lib: GiIcons },
    bi: { name: 'BoxIcons', icons: Object.keys(BiIcons), lib: BiIcons },
    ri: { name: 'Remix', icons: Object.keys(RiIcons), lib: RiIcons },
    si: { name: 'Simple', icons: Object.keys(SiIcons), lib: SiIcons },
    im: { name: 'IcoMoon', icons: Object.keys(ImIcons), lib: ImIcons },
    wi: { name: 'Weather', icons: Object.keys(WiIcons), lib: WiIcons },
    gr: { name: 'Grommet', icons: Object.keys(GrIcons), lib: GrIcons },
    cg: { name: 'css.gg', icons: Object.keys(CgIcons), lib: CgIcons },
    tfi: { name: 'Themify', icons: Object.keys(TfiIcons), lib: TfiIcons },
    sl: { name: 'Simple Line', icons: Object.keys(SlIcons), lib: SlIcons },
    ti: { name: 'Typicons', icons: Object.keys(TiIcons), lib: TiIcons },
    vsc: { name: 'VS Code', icons: Object.keys(VscIcons), lib: VscIcons },
  }), []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    if (activeTab === 'all') {
      const results = [];
      for (const [key, set] of Object.entries(iconSets)) {
        const matches = set.icons
          .filter(name => name.toLowerCase().includes(term))
          .map(name => ({ name, set: key, libName: set.name, lib: set.lib }));
        results.push(...matches);
        if (results.length > 350) break; 
      }
      return results;
    } else {
      const currentSet = iconSets[activeTab];
      return currentSet.icons
        .filter(name => name.toLowerCase().includes(term))
        .slice(0, 350)
        .map(name => ({ name, set: activeTab, libName: currentSet.name, lib: currentSet.lib }));
    }
  }, [searchTerm, activeTab, iconSets]);

  return (
    <div className="w-[680px] bg-white border rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200 border-slate-200" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 tracking-tight">مستودع الأيقونات الشامل</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold">40 مكتبة</Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">+150,000 أيقونة احترافية</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-2 text-[10px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => onSelect(null)}
          >
            <RotateCcw size={12} />
            إعادة تعيين للأصل
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="relative mb-5 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-auto bg-transparent gap-1">
              <TabsTrigger 
                value="all" 
                className="px-4 py-2 text-[11px] font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <Layers size={14} />
                البحث الشامل
              </TabsTrigger>
              <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
              {Object.entries(iconSets).map(([key, set]) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="px-4 py-2 text-[11px] font-bold rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all border border-transparent data-[state=active]:border-slate-200"
                >
                  {set.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>
      
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder={activeTab === 'all' ? "ابحث في كل المكتبات..." : `بحث في مكتبة ${iconSets[activeTab].name}...`} 
          className="h-12 pr-12 text-sm bg-white border-slate-200 rounded-2xl focus-visible:ring-primary/20 shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-[420px] -mr-2 pr-2">
        {filteredIcons.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
            <Search size={48} />
            <p className="text-sm font-medium">لم نجد أيقونة بهذا الاسم</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3 p-1">
            {filteredIcons.map(item => {
              const IconComponent = item.lib[item.name];
              if (!IconComponent) return null;
              
              return (
                <button
                  key={`${item.set}-${item.name}`}
                  onClick={() => onSelect({ name: item.name, set: item.set })}
                  className="flex flex-col items-center justify-center aspect-square rounded-2xl hover:bg-primary hover:text-white transition-all border border-slate-50 hover:border-primary shadow-sm group bg-white relative overflow-hidden p-2"
                  title={`${item.name} (${item.libName})`}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <IconComponent size={24} className="group-hover:scale-110 transition-transform relative z-10 mb-1" />
                  {activeTab === 'all' && (
                    <span className="text-[7px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 group-hover:text-white/80 transition-all truncate w-full text-center">
                      {item.libName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>تم تحميل جميع المكتبات بنجاح</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-black">{filteredIcons.length} نتيجة معروضة</Badge>
      </div>
    </div>
  );
};