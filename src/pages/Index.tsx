import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GraphCanvas } from '../components/GraphCanvas';
import { DetailsPanel } from '../components/DetailsPanel';
import { GraphProvider } from '../store/GraphContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedElement, setSelectedElement] = useState<{ id: string, isNode: boolean } | null>(null);

  return (
    <GraphProvider>
      <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-slate-900">
        {/* Top Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white z-20">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight">ArangoGraph <span className="text-primary font-medium text-sm border px-2 py-0.5 rounded-full ml-2">v1.0</span></h1>
          </div>

          <div className="flex-1 max-w-xl px-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Search collections, attributes or queries..." className="pl-10 h-9 bg-slate-50 border-none ring-offset-0 focus-visible:ring-1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-500"><Bell size={20} /></Button>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={18} className="text-slate-600" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 relative">
          <Sidebar />
          
          <main className="flex-1 relative bg-slate-100">
            <GraphCanvas onSelectElement={(id, isNode) => setSelectedElement({ id, isNode })} />
          </main>

          {selectedElement && (
            <DetailsPanel 
              selectedId={selectedElement.id} 
              isNode={selectedElement.isNode} 
              onClose={() => setSelectedElement(null)} 
            />
          )}
        </div>

        <MadeWithDyad />
      </div>
    </GraphProvider>
  );
};

export default Index;