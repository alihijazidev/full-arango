"use client";

import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { X, Table as TableIcon, Network, Columns, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ResultTable } from './ResultTable';
import { ResultGraph } from './ResultGraph';

export const ResultView = () => {
  const { queryResult, isQueryLoading, setQueryResult } = useGraph();
  const [viewMode, setViewMode] = useState<'table' | 'graph' | 'both'>('both');

  if (isQueryLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700">جاري معالجة البيانات...</h2>
        <p className="text-slate-500 mt-2">نحن نجمع النتائج من قاعدة بيانات أرانجو</p>
      </div>
    );
  }

  if (!queryResult) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-500" dir="rtl">
      {/* Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg">نتائج الاستعلام</h2>
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="table" className="gap-2"><TableIcon size={14} /> جدول</TabsTrigger>
              <TabsTrigger value="graph" className="gap-2"><Network size={14} /> مخطط</TabsTrigger>
              <TabsTrigger value="both" className="gap-2"><Columns size={14} /> العرض المشترك</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setQueryResult(null)}>
          <X size={20} />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {(viewMode === 'table' || viewMode === 'both') && (
          <div className={`h-full border-l overflow-hidden flex flex-col ${viewMode === 'both' ? 'w-1/2' : 'w-full'}`}>
            <ResultTable data={queryResult} />
          </div>
        )}
        
        {(viewMode === 'graph' || viewMode === 'both') && (
          <div className={`h-full relative ${viewMode === 'both' ? 'w-1/2' : 'w-full'}`}>
            <ResultGraph data={queryResult} />
          </div>
        )}
      </div>
    </div>
  );
};