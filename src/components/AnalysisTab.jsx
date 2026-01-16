import React from 'react';
import { useGraph } from '../store/GraphContext';
import { Target, Eye, Trash2, Info, LayoutList } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { getArabicName, getSmallIcon, getColorStyles } from '../utils/mapping';

export const AnalysisTab = () => {
  const { 
    nodes, focusedNodeId, targetNodeIds, toggleFocus, toggleTarget, globalIcons 
  } = useGraph();

  const focusedNode = nodes.find(n => n.id === focusedNodeId);
  const targetNodes = nodes.filter(n => targetNodeIds.has(n.id));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* قسم عقدة التركيز */}
          <section>
            <h3 className="text-[11px] font-bold mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-wider">
              <Eye size={14} className="text-indigo-500" />
              عقدة التركيز الحالية
            </h3>
            
            {focusedNode ? (
              <div className="p-3 bg-white border-2 border-indigo-100 rounded-xl shadow-sm flex items-center gap-3 group">
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
                  className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  onClick={() => toggleFocus(focusedNode.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl text-slate-400 bg-slate-100/50">
                <Info size={20} className="mb-2 opacity-30" />
                <p className="text-[10px] text-center px-4 leading-relaxed">لا يوجد تركيز نشط حالياً. استخدم القائمة الشعاعية على العقدة لتفعيل التركيز.</p>
              </div>
            )}
          </section>

          {/* قسم العقد المستهدفة */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                <Target size={14} className="text-rose-500" />
                العقد المستهدفة
              </h3>
              <Badge variant="secondary" className="text-[10px]">{targetNodes.length}</Badge>
            </div>

            <div className="space-y-2">
              {targetNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl text-slate-400 bg-slate-100/50">
                  <LayoutList size={20} className="mb-2 opacity-30" />
                  <p className="text-[10px] text-center px-4 leading-relaxed">لم يتم تحديد أهداف. يمكنك تحديد أهداف متعددة عبر القائمة الشعاعية.</p>
                </div>
              ) : (
                targetNodes.map(node => {
                  const colors = getColorStyles(node.data.label);
                  return (
                    <div key={node.id} className="p-2.5 bg-white border rounded-xl shadow-sm flex items-center gap-3 group hover:border-rose-200 transition-colors">
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
                        onClick={() => toggleTarget(node.id)}
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
    </div>
  );
};