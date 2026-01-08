import React, { useMemo } from 'react';
import { useGraph } from '../store/GraphContext';
import { Database, FolderTree, ChevronLeft, Share2, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const { metadata, nodes, addEdgeManually } = useGraph();

  const categories = useMemo(() => 
    Array.from(new Set(metadata.collections.map(c => c.category))), 
  [metadata.collections]);

  const activeCollectionNames = useMemo(() => {
    return nodes.flatMap(n => {
      if (n.data.type === 'collection') return [n.data.label];
      return n.data.metadata?.collections || [];
    });
  }, [nodes]);

  const filteredEdges = useMemo(() => {
    return metadata.edges.filter(edge => 
      activeCollectionNames.includes(edge.from) && activeCollectionNames.includes(edge.to)
    );
  }, [metadata.edges, activeCollectionNames]);

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, nodeName }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 border-l bg-slate-50 flex flex-col h-full" dir="rtl">
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Database className="text-primary" size={20} />
          البيانات الوصفية
        </h2>
        <p className="text-xs text-muted-foreground mt-1">اسحب العناصر إلى منطقة الرسم</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-600">
              <FolderTree size={16} />
              الفئات والمجموعات
            </h3>
            <Accordion type="multiple" className="w-full">
              {categories.map(cat => (
                <AccordionItem value={cat} key={cat} className="border-none">
                  <div 
                    draggable 
                    onDragStart={(e) => onDragStart(e, 'category', cat)}
                    className="flex items-center"
                  >
                    <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-md hover:bg-slate-200 transition-colors cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2">
                        <FolderTree size={14} className="text-orange-500" />
                        <span className="text-sm font-medium">{cat}</span>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pr-6 pl-2 pt-1 pb-2 space-y-1">
                    {metadata.collections
                      .filter(c => c.category === cat)
                      .map(coll => (
                        <div
                          key={coll.name}
                          draggable
                          onDragStart={(e) => onDragStart(e, 'collection', coll.name)}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-200 cursor-grab active:cursor-grabbing group transition-all"
                        >
                          <Database size={14} className="text-blue-500" />
                          <span className="text-sm">{coll.name}</span>
                          <ChevronLeft size={12} className="mr-auto opacity-0 group-hover:opacity-50" />
                        </div>
                      ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-600">
                <Share2 size={16} />
                علاقات نشطة ({filteredEdges.length})
              </h3>
            </div>
            
            <div className="space-y-2">
              {filteredEdges.length === 0 ? (
                <div className="text-[10px] text-center p-4 border border-dashed rounded text-muted-foreground">
                  أضف مجموعات مرتبطة لعرض العلاقات
                </div>
              ) : (
                filteredEdges.map(edge => (
                  <button
                    key={edge.name}
                    onClick={() => addEdgeManually(edge.name)}
                    className={cn(
                      "w-full text-right flex flex-col p-2 rounded-md bg-white border border-slate-200 shadow-sm transition-all",
                      "hover:border-primary hover:shadow-md group active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Share2 size={14} className="text-emerald-500" />
                        <span className="text-sm font-medium">{edge.name}</span>
                      </div>
                      <Plus size={12} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="bg-slate-100 px-1 rounded">{edge.from}</span>
                      <span>←</span>
                      <span className="bg-slate-100 px-1 rounded">{edge.to}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};