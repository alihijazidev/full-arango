"use client";

import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { X, Table as TableIcon, Network, Columns, Loader2, Search, ArrowRight, MapPinned, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';

export const ResultView = () => {
  const { 
    queryResult, shortestPathResult, activeResultType, setActiveResultType,
    isQueryLoading, setQueryResult, setShortestPathResult 
  } = useGraph();
  
  const [viewMode, setViewMode] = useState<'table' | 'graph' | 'both'>('both');

  const closeResults = () => {
    setQueryResult(null);
    setShortestPathResult(null);
  };

  if (isQueryLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700">جاري معالجة البيانات...</h2>
        <p className="text-slate-500 mt-2">نحن نجمع النتائج من قاعدة بيانات أرانجو</p>
      </div>
    );
  }

  if (!queryResult && !shortestPathResult) return null;

  const currentResult = activeResultType === 'query' ? queryResult : shortestPathResult;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-500" dir="rtl">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5" onClick={closeResults}>
            <ArrowRight size={18} />
            العودة للتصميم
          </Button>

          <div className="h-8 w-px bg-slate-200" />

          <Tabs value={activeResultType} onValueChange={(v: any) => setActiveResultType(v)}>
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
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="table" className="gap-2"><TableIcon size={14} /> جدول</TabsTrigger>
              <TabsTrigger value="graph" className="gap-2"><Network size={14} /> مخطط</TabsTrigger>
              <TabsTrigger value="both" className="gap-2"><Columns size={14} /> عرض مشترك</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" onClick={closeResults}><X size={20} /></Button>
        </div>
      </header>

      {/* Content */}
      {currentResult ? (
        <div className="flex-1 overflow-hidden flex">
          {/* Lazy imports logic or direct components if small enough */}
          {/* Note: In a real app we'd split these, but for simplicity we keep the existing components logic */}
          <div className="flex-1 flex overflow-hidden">
             {/* ResultTable and ResultGraph will consume the 'currentResult' via props or context */}
             {/* Import here if they were separate files, or just use them */}
             {/* Re-using the logic from the previous turn */}
             <ResultContent viewMode={viewMode} data={currentResult} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
          <Search size={48} className="opacity-20" />
          <p>لا توجد نتائج لهذا النوع من الاستعلام</p>
        </div>
      )}
    </div>
  );
};

// Helper component to keep ResultView clean
import { ResultTable } from './ResultTable';
import { ResultGraph } from './ResultGraph';

const ResultContent = ({ viewMode, data }: { viewMode: string, data: any }) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {(viewMode === 'table' || viewMode === 'both') && (
        <div className={cn("h-full border-l overflow-hidden flex flex-col", viewMode === 'both' ? 'w-1/2' : 'w-full')}>
          <ResultTable data={data} />
        </div>
      )}
      {(viewMode === 'graph' || viewMode === 'both') && (
        <div className={cn("h-full relative", viewMode === 'both' ? 'w-1/2' : 'w-full')}>
          <ResultGraph data={data} />
        </div>
      )}
    </div>
  );
};