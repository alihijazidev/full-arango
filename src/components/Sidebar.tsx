import React from 'react';
import { useGraph } from '../store/GraphContext';
import { Database, FolderTree, ChevronRight, Share2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';

export const Sidebar = () => {
  const { metadata } = useGraph();

  const categories = Array.from(new Set(metadata.collections.map(c => c.category)));

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, nodeName }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 border-r bg-slate-50 flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Database className="text-primary" size={20} />
          Metadata
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Drag items to the graph area</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-600">
              <FolderTree size={16} />
              Categories & Collections
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
                  <AccordionContent className="pl-6 pr-2 pt-1 pb-2 space-y-1">
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
                          <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50" />
                        </div>
                      ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-600">
              <Share2 size={16} />
              Edge Collections
            </h3>
            <div className="space-y-1">
              {metadata.edges.map(edge => (
                <div
                  key={edge.name}
                  className="flex flex-col p-2 rounded-md bg-white border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 size={14} className="text-emerald-500" />
                    <span className="text-sm font-medium">{edge.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="bg-slate-100 px-1 rounded">{edge.from}</span>
                    <span>→</span>
                    <span className="bg-slate-100 px-1 rounded">{edge.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};