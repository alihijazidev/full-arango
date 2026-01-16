import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { Target, Eye, Trash2, Info, LayoutList, MapPinned, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { getArabicName, getSmallIcon, getColorStyles } from '../utils/mapping';

export const AnalysisTab = ({ onSelectElement }) => {
  const { 
    nodes, focusedNodeId, targetNodeIds, toggleFocus, toggleTarget, globalIcons,
    shortestPathSelection, removeFromShortestPath, addMetadataToShortestPath,
    addNodeFromMetadata
  } = useGraph();

  const [dragOverArea, setDragOverArea] = useState(null);

  const focusedNode = nodes.find(n => n.id === focusedNodeId);
  const targetNodes = nodes.filter(n => targetNodeIds.has(n.id));

  const handleGenericDrop = (event, type) => {
    event.preventDefault();
    setDragOverArea(null);
    const dropData = event.dataTransfer.getData('application/reactflow');
    if (!dropData) return;
    const data = JSON.parse(dropData);

    if (type === 'path') {
      addMetadataToShortestPath(data.nodeType, data.nodeName, data.categoryName);
    } else {
      const newNode = addNodeFromMetadata(data.nodeType, data.nodeName, { x: 100, y: 100 }, data.categoryName);
      if (type === 'focus') toggleFocus(newNode.id);
      if (type === 'target') toggleTarget(newNode.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* قسم عقدة التركيز */}
          <section 
            onDragOver={(e) => { e.preventDefault(); setDragOverArea('focus'); }}
            onDragLeave={() => setDragOverArea(null)}
            onDrop={(e) => handleGenericDrop(e, 'focus')}
            className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              dragOverArea === 'focus' ? "bg-indigo-50 ring-2 ring-indigo-400" : ""
            )}
          >
            <h3 className="text-[11px] font-bold mb-3 px-1 flex items-center gap-2 text-slate-500 uppercase tracking-wider">
              <Eye size={14} className="text-indigo-500" />
              عقدة التركيز
            </h3>
            
            {focusedNode ? (
              <div 
                className="p-3 bg-white border-2 border-indigo-100 rounded-xl shadow-sm flex items-center gap-3 group cursor-pointer hover:border-indigo-300 transition-all"
                onClick={() => onSelectElement?.(focusedNode.id, true)}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600")}>
                  {getSmallIcon(focusedNode.data.label, focusedNode.data.type, globalIcons)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold truncate">{getArabicName(focusedNode.data.label)}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{focusedNode.id.split('-').pop()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); toggleFocus(focusedNode.id); }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-slate-400 bg-slate-100/50">
                <Info size={20} className="mb-2 opacity-30" />
                <p className="text-[9px] text-center px-4 leading-relaxed">اسقط عقدة هنا لتثبيت التركيز عليها</p>
              </div>
            )}
          </section>

          {/* قسم العقد المستهدفة */}
          <section 
            onDragOver={(e) => { e.preventDefault(); setDragOverArea('target'); }}
            onDragLeave={() => setDragOverArea(null)}
            onDrop={(e) => handleGenericDrop(e, 'target')}
            className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              dragOverArea === 'target' ? "bg-rose-50 ring-2 ring-rose-400" : ""
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-bold flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                <Target size={14} className="text-rose-500" />
                العقد المستهدفة
              </h3>
              <Badge variant="secondary" className="text-[10px]">{targetNodes.length}</Badge>
            </div>

            <div className="space-y-2">
              {targetNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-slate-400 bg-slate-100/50">
                  <LayoutList size={20} className="mb-2 opacity-30" />
                  <p className="text-[9px] text-center px-4 leading-relaxed">اسقط العقد المستهدفة هنا للمراقبة</p>
                </div>
              ) : (
                targetNodes.map(node => {
                  const colors = getColorStyles(node.data.label);
                  return (
                    <div 
                      key={node.id} 
                      className="p-2.5 bg-white border rounded-xl shadow-sm flex items-center gap-3 group hover:border-rose-200 transition-colors cursor-pointer"
                      onClick={() => onSelectElement?.(node.id, true)}
                    >
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", colors.bg, colors.text)}>
                        {getSmallIcon(node.data.label, node.data.type, globalIcons)}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold truncate">{getArabicName(node.data.label)}</span>
                        <span className="text-[9px] text-slate-400 font-mono truncate">{node.id.split('-').pop()}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); toggleTarget(node.id); }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* قسم أقصر مسار */}
      <div 
        className={cn(
          "shrink-0 bg-white border-t shadow-lg z-10 transition-all p-2",
          dragOverArea === 'path' ? "bg-amber-50 ring-2 ring-inset ring-amber-400" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOverArea('path'); }}
        onDragLeave={() => setDragOverArea(null)}
        onDrop={(e) => handleGenericDrop(e, 'path')}
      >
        <div className="p-2 flex items-center justify-between border-b bg-slate-50/50 rounded-t-xl">
          <h3 className="font-bold text-[11px] flex items-center gap-2 text-slate-700">
            <MapPinned size={14} className="text-amber-500" />
            تحليل أقصر مسار
          </h3>
          <Badge variant={shortestPathSelection.length === 2 ? "default" : "outline"} className={cn("text-[10px]", shortestPathSelection.length === 2 ? "bg-emerald-500" : "")}>
            {shortestPathSelection.length}/2
          </Badge>
        </div>

        <div className="p-3 space-y-3">
          {shortestPathSelection.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-xl bg-slate-100/30 gap-2">
              <Layers size={20} className="text-slate-300" />
              <p className="text-[9px] text-slate-500 px-2 leading-relaxed">
                اسقط عقدتين (البداية والنهاية) هنا لبدء التحليل
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shortestPathSelection.map((node, index) => {
                const colors = getColorStyles(node.data.label);
                return (
                  <div 
                    key={node.id} 
                    className="relative flex items-center gap-3 p-2 bg-white border rounded-lg group shadow-sm cursor-pointer hover:border-amber-200"
                    onClick={() => onSelectElement?.(node.id, true)}
                  >
                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-slate-50", colors.text)}>
                      {getSmallIcon(node.data.label, node.data.type, globalIcons)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-bold truncate">{getArabicName(node.data.label)}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={(e) => { e.stopPropagation(); removeFromShortestPath(node.id); }}
                    >
                      <Trash2 size={12} />
                    </Button>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center font-bold shadow-md">
                      {index === 0 ? 'A' : 'B'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};