import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GraphCanvas } from '../components/GraphCanvas';
import { DetailsPanel } from '../components/DetailsPanel';
import { ResultView } from '../components/ResultView';
import { GraphProvider, useGraph } from '../store/GraphContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Bell as BellIcon, User as UserIcon, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeaderActions = () => {
  const { executeStructuredQuery } = useGraph();

  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={executeStructuredQuery}
        className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 font-bold"
      >
        <PlayCircle size={18} />
        تنفيذ الاستعلام
      </Button>
      
      <div className="h-6 w-px bg-slate-200 mx-2" />

      <Button variant="ghost" size="icon" className="text-slate-500"><BellIcon size={20} /></Button>
      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
        <UserIcon size={18} className="text-slate-600" />
      </div>
    </div>
  );
};

const IndexContent = () => {
  const [selectedElement, setSelectedElement] = useState<{ id: string, isNode: boolean } | null>(null);

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-slate-900" dir="rtl">
      {/* Top Header */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">أ</span>
          </div>
          <h1 className="font-bold text-lg tracking-tight">مخطط أرانجو <span className="text-primary font-medium text-sm border px-2 py-0.5 rounded-full mr-2">إصدار 1.0</span></h1>
        </div>

        <HeaderActions />
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
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

      <div className="bg-slate-50 border-t">
        <MadeWithDyad />
      </div>
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