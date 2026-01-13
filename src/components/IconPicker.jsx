import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lucide');

  // تجهيز المجموعات
  const iconSets = useMemo(() => ({
    lucide: {
      name: 'Lucide',
      icons: Object.keys(LucideIcons.icons),
      lib: LucideIcons.icons
    },
    fa: {
      name: 'Font Awesome',
      icons: Object.keys(FaIcons),
      lib: FaIcons
    },
    md: {
      name: 'Material Design',
      icons: Object.keys(MdIcons),
      lib: MdIcons
    }
  }), []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const currentSet = iconSets[activeTab];
    return currentSet.icons.filter(name => 
      name.toLowerCase().includes(term)
    ).slice(0, 200); // تحديد العدد للحفاظ على الأداء
  }, [searchTerm, activeTab, iconSets]);

  return (
    <div className="w-[400px] bg-white border rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 uppercase">مكتبة الأيقونات الموسعة</span>
          <span className="text-[10px] text-slate-400">اختر من بين آلاف الأيقونات العالمية</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
        <TabsList className="grid grid-cols-3 w-full h-8">
          <TabsTrigger value="lucide" className="text-[10px]">Lucide</TabsTrigger>
          <TabsTrigger value="fa" className="text-[10px]">FontAwesome</TabsTrigger>
          <TabsTrigger value="md" className="text-[10px]">Material</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="relative mb-3">
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input 
          placeholder="ابحث عن أيقونة..." 
          className="h-10 pr-8 text-xs bg-slate-50 border-none shadow-inner" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-72">
        <div className="grid grid-cols-6 gap-2 pr-2">
          {filteredIcons.map(name => {
            const IconComponent = iconSets[activeTab].lib[name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={`${activeTab}-${name}`}
                onClick={() => onSelect({ name, set: activeTab })}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 group"
                title={name}
              >
                <IconComponent size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="mt-3 text-[9px] text-slate-400 text-center border-t pt-2">
        يتم عرض أول 200 نتيجة لتسريع التصفح. استخدم البحث للوصول لأيقونات محددة.
      </div>
    </div>
  );
};