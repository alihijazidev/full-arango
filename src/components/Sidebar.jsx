import React, { useMemo, useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { Database, FolderTree, ChevronLeft, Share2, Plus, Search, MapPinned, Trash2, PlayCircle, Info, Layers } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { getArabicName, getSmallIcon, getColorStyles } from '../utils/mapping';

export const Sidebar = () => {
  const { 
    metadata, nodes, addEdgeManually, globalIcons, 
    shortestPathSelection, removeFromShortestPath, executeStructuredQuery 
  } = useGraph();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return metadata.collections;
    return metadata.collections.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getArabicName(cat.name).includes(searchTerm) ||
      cat.entities.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || getArabicName(e.name).includes(searchTerm))
    );
  }, [metadata.collections, searchTerm]);

  const activePaths = useMemo(() => {
    return nodes.map(n => n.data.fullPath);
  }, [nodes]);

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
    <div className="w-80 border-l bg-white flex flex-col h-full shadow-sm" dir="rtl">
      {/* الجزء العلوي: البحث والمجموعات (قابل للتمرير) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Database size={14} />
            مستودع البيانات
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="بحث في المجموعات..." 
              className="pr-9 h-9 bg-white border-slate-200 text-xs text-right shadow-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <section>
              <h3 className="text-[11px] font-bold mb-3 flex items-center gap-2 text-slate-500 uppercase">
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
                <h3 className="text-[11px] font-bold flex items-center gap-2 text-slate-500 mb-3 uppercase">
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

      {/* الجزء السفلي: أقصر مسار (ثابت ودائم) */}
      <div className="shrink-0 bg-slate-50 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10">
        <div className="p-4 flex items-center justify-between bg-white border-b">
          <h3 className="font-bold text-xs flex items-center gap-2 text-slate-700">
            <MapPinned size={16} className="text-amber-500" />
            تحليل أقصر مسار
          </h3>
          <Badge variant={shortestPathSelection.length === 2 ? "default" : "outline"} className={cn(shortestPathSelection.length === 2 ? "bg-emerald-500" : "")}>
            {shortestPathSelection.length}/2
          </Badge>
        </div>

        <div className="p-4 space-y-4">
          {shortestPathSelection.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-xl bg-slate-100/50 gap-2">
              <Layers size={24} className="text-slate-300" />
              <p className="text-[10px] text-slate-500 leading-relaxed px-2">
                اختر عقدتين من المخطط عبر قائمة <b>"أدوات"</b> لبدء تحليل المسار بينهما.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shortestPathSelection.map((node, index) => {
                const colors = getColorStyles(node.data.label);
                return (
                  <div key={node.id} className="relative flex items-center gap-3 p-2 bg-white border rounded-lg group shadow-sm">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50", colors.text)}>
                      {getSmallIcon(node.data.label, node.data.type, globalIcons)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-bold truncate">{getArabicName(node.data.label)}</span>
                      <span className="text-[8px] text-slate-400 font-mono truncate">{node.id.split('-').pop()}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => removeFromShortestPath(node.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center font-bold shadow-sm">
                      {index === 0 ? 'A' : 'B'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button 
            className="w-full gap-2 font-bold h-10 shadow-lg shadow-emerald-500/10" 
            variant={shortestPathSelection.length < 2 ? "secondary" : "default"}
            disabled={shortestPathSelection.length < 2}
            onClick={executeStructuredQuery}
          >
            <PlayCircle size={16} />
            تنفيذ تحليل المسار
          </Button>
        </div>
      </div>
    </div>
  );
};