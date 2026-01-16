import React, { useMemo, useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { Database, FolderTree, ChevronLeft, Share2, Plus, Search, Activity, Layout } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { getArabicName, getSmallIcon, getColorStyles } from '../utils/mapping';
import { AnalysisTab } from './AnalysisTab';

const SidebarRailItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative group mb-2 outline-none",
      isActive 
        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
        : "text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200"
    )}
  >
    <Icon size={20} className="transition-transform duration-300 group-hover:scale-110 z-10" />
    
    {/* ملصق التسمية المنبثق عند التمرير */}
    <div className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:right-16 transition-all duration-300 pointer-events-none shadow-xl z-50 flex items-center gap-2 border border-white/10">
      {label}
      <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 rotate-45 border-r border-t border-white/10" />
    </div>

    {/* مؤشر الحالة النشطة / التمرير */}
    <div className={cn(
      "absolute -right-1 top-1/2 -translate-y-1/2 w-1 rounded-l-full bg-primary transition-all duration-300",
      isActive ? "h-7 opacity-100" : "h-0 opacity-0 group-hover:h-4 group-hover:opacity-40"
    )} />

    {/* تأثير هالة خفيفة عند النشاط */}
    {isActive && (
      <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse pointer-events-none" />
    )}
  </button>
);

export const Sidebar = () => {
  const { metadata, nodes, addEdgeManually, globalIcons } = useGraph();
  const [activeTab, setActiveTab] = useState('data');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return metadata.collections;
    return metadata.collections.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getArabicName(cat.name).includes(searchTerm) ||
      cat.entities.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || getArabicName(e.name).includes(searchTerm))
    );
  }, [metadata.collections, searchTerm]);

  const activePaths = useMemo(() => nodes.map(n => n.data.fullPath), [nodes]);

  const filteredEdges = useMemo(() => {
    return metadata.edges.filter(edge => {
      const fromStr = Array.isArray(edge.fromcol) ? edge.fromcol.join('/') : edge.fromcol;
      const toStr = Array.isArray(edge.tocol) ? edge.tocol.join('/') : edge.tocol;
      const isFromActive = activePaths.some(path => fromStr === path || fromStr.startsWith(path + '/'));
      const isToActive = activePaths.some(path => toStr === path || toStr.startsWith(path + '/'));
      return isFromActive && isToActive;
    });
  }, [metadata.edges, activePaths]);

  const onDragStart = (event, nodeType, nodeName, categoryName = null) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, nodeName, categoryName }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-full border-l bg-white shadow-sm" dir="rtl">
      {/* الشريط الجانبي النحيف للتنقل (Rail) */}
      <div className="w-16 border-l flex flex-col items-center py-6 gap-2 bg-slate-50/50 shrink-0">
        <SidebarRailItem 
          icon={Database} 
          label="بيانات المخطط" 
          isActive={activeTab === 'data'} 
          onClick={() => setActiveTab('data')} 
        />
        <SidebarRailItem 
          icon={Activity} 
          label="أدوات التحليل" 
          isActive={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')} 
        />
      </div>

      {/* منطقة محتوى التبويب المختار */}
      <div className="w-[264px] flex flex-col overflow-hidden">
        {activeTab === 'data' ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="p-4 border-b bg-white">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Layout size={16} className="text-primary" />
                مستعرض البيانات
              </h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input 
                  placeholder="بحث في المجموعات..." 
                  className="pr-9 h-9 bg-slate-50 border-none text-xs text-right shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <section>
                  <h3 className="text-[10px] font-bold mb-3 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                    <FolderTree size={14} />
                    الفئات والمجموعات
                  </h3>
                  <Accordion type="multiple" className="w-full">
                    {filteredCategories.map(cat => {
                      const colors = getColorStyles(cat.name);
                      return (
                        <AccordionItem value={cat.name} key={cat.name} className="border-none mb-1">
                          <div draggable onDragStart={(e) => onDragStart(e, 'category', cat.name)} className="flex items-center">
                            <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <span className={cn(colors.text)}>{getSmallIcon(cat.name, 'category', globalIcons)}</span>
                                <span className="text-sm font-semibold">{getArabicName(cat.name)}</span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pr-6 pl-2 pt-1 pb-2 space-y-1">
                            {cat.entities
                              .filter(e => !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()) || cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || getArabicName(e.name).includes(searchTerm))
                              .map(entity => {
                                const entityColors = getColorStyles(entity.name);
                                return (
                                  <div key={entity.name} draggable onDragStart={(e) => onDragStart(e, 'collection', entity.name, cat.name)} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 cursor-grab active:cursor-grabbing group transition-all border border-transparent hover:border-slate-200">
                                    <span className={cn(entityColors.text)}>{getSmallIcon(entity.name, 'collection', globalIcons)}</span>
                                    <span className="text-sm">{getArabicName(entity.name)}</span>
                                    <ChevronLeft size={12} className="mr-auto opacity-0 group-hover:opacity-50" />
                                  </div>
                                );
                              })}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </section>

                {filteredEdges.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-bold flex items-center gap-2 text-slate-400 mb-3 uppercase tracking-widest">
                      <Share2 size={14} />
                      علاقات متاحة ({filteredEdges.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredEdges.map(edge => {
                        const fromStr = Array.isArray(edge.fromcol) ? edge.fromcol.join('/') : edge.fromcol;
                        const toStr = Array.isArray(edge.tocol) ? edge.tocol.join('/') : edge.tocol;
                        return (
                          <button 
                            key={`${edge.label}-${fromStr}-${toStr}`} 
                            onClick={() => addEdgeManually(edge.label)} 
                            className="w-full text-right flex flex-col p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-primary hover:shadow-md group transition-all"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                                  <Share2 size={12} className="text-emerald-600" />
                                </div>
                                <span className="text-xs font-bold">{edge.label}</span>
                              </div>
                              <Plus size={12} className="text-slate-300 group-hover:text-primary" />
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{getArabicName(fromStr.split('/').pop())}</span>
                              <span className="text-slate-300">←</span>
                              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{getArabicName(toStr.split('/').pop())}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="p-4 border-b bg-white">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                تحليل المخطط
              </h2>
            </div>
            <AnalysisTab />
          </div>
        )}
      </div>
    </div>
  );
};