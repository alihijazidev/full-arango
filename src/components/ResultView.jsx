import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { X, Table as TableIcon, Network, Columns, Loader2, Search, ArrowRight, MapPinned, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Toggle } from './ui/toggle';
import { cn } from '@/lib/utils';
import { ResultTable } from './ResultTable';
import { ResultGraph } from './ResultGraph';

export const ResultView = () => {
  const { 
    queryResult, shortestPathResult, activeResultType, setActiveResultType,
    isQueryLoading, setQueryResult, setShortestPathResult,
    isResultPathMode, setIsResultPathMode 
  } = useGraph();
  
  const [viewMode, setViewMode] = useState('both');

  const closeResults = () => {
    setQueryResult(null);
    setShortestPathResult(null);
    setIsResultPathMode(false);
  };

  if (isQueryLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700">جاري معالجة البيانات...</h2>
        <p className="text-slate-500 mt-2">نحن نجمع النتائج من قاعدة بيانات أرانجو</p>
      </div>
    );
  }

  if (!queryResult && !shortestPathResult) return null;

  const currentResult = activeResultType === 'query' ? queryResult : shortestPathResult;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden" dir="rtl">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5" onClick={closeResults}>
            <ArrowRight size={18} />
            العودة للتصميم
          </Button>

          <div className="h-8 w-px bg-slate-200" />

          <Tabs value={activeResultType} onValueChange={(v) => setActiveResultType(v)}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="query" disabled={!queryResult} className="gap-2">
                <PlayCircle size={14} /> الاستعلام العام
              </TabsTrigger>
              <TabsTrigger value="shortestPath" disabled={!shortestPathResult} className="gap-2">
                <MapPinned size={14} /> أقصر مسار
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          {activeResultType === 'query' && (
            <Toggle
              pressed={isResultPathMode}
              onPressedChange={setIsResultPathMode}
              className={cn(
                "gap-2 border-2 h-9 px-4 font-bold transition-all",
                isResultPathMode ? "bg-amber-100 border-amber-500 text-amber-700 hover:bg-amber-200" : "bg-white border-slate-200"
              )}
            >
              <MapPinned size={16} />
              تحليل المسار
            </Toggle>
          )}

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="table" className="gap-2"><TableIcon size={14} /> جدول</TabsTrigger>
              <TabsTrigger value="graph" className="gap-2"><Network size={14} /> مخطط</TabsTrigger>
              <TabsTrigger value="both" className="gap-2"><Columns size={14} /> عرض مشترك</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" onClick={closeResults}><X size={20} /></Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-slate-50 relative">
        {currentResult ? (
          <div className="flex h-full overflow-hidden">
            {(viewMode === 'table' || viewMode === 'both') && (
              <div className={cn("h-full border-l overflow-hidden flex flex-col bg-white", viewMode === 'both' ? 'w-1/2' : 'w-full')}>
                <ResultTable data={currentResult} />
              </div>
            )}
            {(viewMode === 'graph' || viewMode === 'both') && (
              <div className={cn("h-full relative bg-slate-50", viewMode === 'both' ? 'w-1/2' : 'w-full')}>
                <ResultGraph data={currentResult} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 h-full flex items-center justify-center text-slate-400 flex-col gap-4 bg-white">
            <Search size={48} className="opacity-20" />
            <p>لا توجد نتائج لهذا النوع من الاستعلام</p>
          </div>
        )}
      </div>
    </div>
  );
};