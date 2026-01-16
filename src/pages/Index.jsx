import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GraphCanvas } from '../components/GraphCanvas';
import { DetailsPanel } from '../components/DetailsPanel';
import { ResultView } from '../components/ResultView';
import { GraphProvider, useGraph } from '../store/GraphContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { 
  Bell as BellIcon, 
  User as UserIcon, 
  PlayCircle, 
  Save, 
  Settings, 
  Wifi, 
  CloudDownload 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const HeaderActions = () => {
  const { executeStructuredQuery } = useGraph();

  return (
    <div className="flex items-center gap-3">
      {/* مؤشر حالة الاتصال */}
      <div className="hidden md:flex items-center gap-2 ml-4 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
        <div className="relative">
          <Wifi size={14} className="text-emerald-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">متصل بـ ArangoDB</span>
      </div>

      <div className="h-6 w-px bg-slate-200 mx-1" />

      {/* أزرار العمليات */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-primary">
              <CloudDownload size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>تحميل المخطط</TooltipContent>
        </Tooltip>

        <Button variant="outline" className="gap-2 h-9 border-slate-200 text-slate-600 hidden sm:flex">
          <Save size={18} />
          حفظ المسودة
        </Button>

        <Button 
          onClick={executeStructuredQuery}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-white shadow-sm shadow-emerald-200"
        >
          <PlayCircle size={18} />
          تنفيذ الاستعلام
        </Button>
      </div>
      
      <div className="h-6 w-px bg-slate-200 mx-1" />

      {/* الإشعارات والحساب */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
          <Settings size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 relative">
          <BellIcon size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </Button>
        
        <div className="mr-2 flex items-center gap-3 pr-3 border-r">
          <div className="flex flex-col items-end hidden lg:flex">
            <span className="text-[11px] font-bold text-slate-700 leading-tight">عبدالرحمن محمد</span>
            <span className="text-[9px] text-slate-400">مسؤول النظام</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 border border-primary/20 flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
            <UserIcon size={18} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

const IndexContent = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden text-slate-900" dir="rtl">
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform -rotate-3">
              <span className="text-primary-foreground font-black text-xl">أ</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg tracking-tight leading-none">مخطط أرانجو</h1>
              <span className="text-[10px] text-slate-400 font-medium mt-1">نظام تحليل البيانات المرتبط</span>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-mono text-[10px] px-2">
            V 1.0.4
          </Badge>
        </div>

        <HeaderActions />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 relative bg-slate-100 overflow-hidden">
          <GraphCanvas onSelectElement={(id, isNode) => setSelectedElement({ id, isNode })} />
        </main>

        {selectedElement && (
          <div className="absolute left-0 top-0 h-full z-30 animate-in slide-in-from-left">
             <DetailsPanel 
              selectedId={selectedElement.id} 
              isNode={selectedElement.isNode} 
              onClose={() => setSelectedElement(null)} 
            />
          </div>
        )}
      </div>

      <ResultView />

      <footer className="shrink-0 bg-slate-50 border-t py-1">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <GraphProvider>
      <IndexContent />
    </GraphProvider>
  );
};

export default Index;