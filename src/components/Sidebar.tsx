import React, { useMemo, useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { Database, FolderTree, ChevronLeft, Share2, Plus, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const { metadata, nodes, addEdgeManually } = useGraph();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCollections = useMemo(() => {
    if (!searchTerm) return metadata.collections;
    return metadata.collections.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [metadata.collections, searchTerm]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(filteredCollections.map(c => c.category)));
    // If we are searching, we might want to include categories that match even if their collections don't (though usually filteredCollections handles this)
    return cats;
  }, [filteredCollections]);

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
      <div className="p-4 border-b bg-white space-y-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Database className="text-primary" size={20} />
          البيانات الوصفية
        </h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input 
            placeholder="بحث في المجموعات..." 
            className="pr-9 h-8 bg-slate-50 border-none text-xs text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-600">
              <FolderTree size={16} />
              الفئات والمجموعات
            </h3>
            {categories.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground py-4">لا توجد نتائج مطابقة</p>
            )}
            <Accordion type="multiple" className="w-full" defaultValue={searchTerm ? categories : []}>
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
                    {filteredCollections
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