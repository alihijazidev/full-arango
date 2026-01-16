import React, { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GraphCanvas } from '../components/GraphCanvas';
import { DetailsPanel } from '../components/DetailsPanel';
import { ResultView } from '../components/ResultView';
import { GraphProvider, useGraph } from '../store/GraphContext';
import { SavedStatesManager } from '../components/SavedStatesManager';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { 
  PlayCircle, 
  FileDown,
  FileUp,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const HeaderActionsLeft = () => {
  const { exportGraph, importGraph, saveCurrentState } = useGraph();
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleQuickSave = () => {
    const now = new Date().toLocaleString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const saveName = `حفظ سريع - ${now}`;
    saveCurrentState(saveName);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) importGraph(content);
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange} 
      />
      
      {/* مجموعة الملفات */}
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
              onClick={handleImportClick}
            >
              <FileUp size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>استيراد ملف JSON</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
              onClick={exportGraph}
            >
              <FileDown size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>تصدير ملف JSON</TooltipContent>
        </Tooltip>
      </div>

      {/* مجموعة إدارة الحالات */}
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
        <SavedStatesManager iconOnly={true} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-600 hover:bg-blue-100" 
              onClick={handleQuickSave}
            >
              <PlusCircle size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>حفظ سريع للرسم الحالي</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const HeaderMainActions = () => {
  const { executeStructuredQuery } = useGraph();

  return (
    <Button 
      onClick={executeStructuredQuery}
      className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-white shadow-sm shadow-emerald-200 px-4"
    >
      <PlayCircle size={18} />
      تنفيذ الاستعلام
    </Button>
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

          <div className="h-6 w-px bg-slate-200" />
          
          <HeaderActionsLeft />
        </div>

        <HeaderMainActions />
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