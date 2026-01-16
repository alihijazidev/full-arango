import React, { useState, useRef } from 'react';
import { useGraph } from '../store/GraphContext';
import Draggable from 'react-draggable';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { History, Save, Trash2, Clock, Check, GripHorizontal } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const SavedStatesManager = ({ iconOnly = false }) => {
  const { savedStates, saveCurrentState, loadSpecificState, deleteSavedState } = useGraph();
  const [saveName, setSaveName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef(null);

  const handleSave = () => {
    saveCurrentState(saveName);
    setSaveName('');
  };

  const triggerButton = (
    <Button 
      variant={iconOnly ? "ghost" : "outline"} 
      size={iconOnly ? "icon" : "default"} 
      className={iconOnly ? "h-8 w-8" : "gap-2 h-9 border-slate-200 text-slate-600"}
      onClick={() => setIsOpen(true)}
    >
      <History size={18} />
      {!iconOnly && "إدارة النسخ"}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* تحسين الزر ليعمل بشكل مستقل عن DialogTrigger لتجنب مشاكل التداخل */}
      {iconOnly ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {triggerButton}
          </TooltipTrigger>
          <TooltipContent>إدارة واستعادة النسخ</TooltipContent>
        </Tooltip>
      ) : triggerButton}
      
      <Draggable nodeRef={nodeRef} handle=".drag-handle">
        <DialogContent 
          ref={nodeRef}
          className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-transparent" 
          dir="rtl"
          style={{ top: '20%', left: '35%', transform: 'none' }}
        >
          <div className="bg-white rounded-lg border shadow-xl flex flex-col w-full">
            <div className="drag-handle w-full h-6 bg-slate-100 flex items-center justify-center cursor-move hover:bg-slate-200 transition-colors">
              <GripHorizontal size={14} className="text-slate-400" />
            </div>

            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-right flex items-center gap-2">
                <History className="text-primary" size={20} />
                إدارة النسخ المحفوظة
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6 text-right">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">حفظ نسخة جديدة</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="أدخل اسماً للنسخة..." 
                    className="text-right h-10"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <Button onClick={handleSave} className="gap-2">
                    <Save size={16} />
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">النسخ السابقة ({savedStates.length})</h3>
                <ScrollArea className="h-[250px] border rounded-lg p-2 bg-slate-50/50">
                  <div className="space-y-2">
                    {savedStates.length === 0 ? (
                      <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 gap-2">
                        <History size={32} className="opacity-20" />
                        <p className="text-xs">لا توجد نسخ محفوظة حالياً</p>
                      </div>
                    ) : (
                      savedStates.map((state) => (
                        <div 
                          key={state.id}
                          className="group flex items-center justify-between p-3 bg-white border rounded-md hover:border-primary transition-all shadow-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-slate-700">{state.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Clock size={10} />
                              {new Date(state.timestamp).toLocaleString('ar-EG')}
                              <Badge variant="secondary" className="text-[8px] py-0">
                                {state.data.nodes.length} عقدة
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                              onClick={() => deleteSavedState(state.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => {
                                loadSpecificState(state.id);
                                setIsOpen(false);
                              }}
                            >
                              <Check size={14} />
                              استعادة
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Draggable>
    </Dialog>
  );
};