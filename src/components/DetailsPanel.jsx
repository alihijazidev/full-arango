import React from 'react';
import { useGraph } from '../store/GraphContext';
import { X, Plus, Trash2, Filter as FilterIcon, ArrowLeftRight, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

export const DetailsPanel = ({ selectedId, isNode, onClose }) => {
  const { nodes, edges, updateFilters, updateEdgeDepth } = useGraph();
  
  const target = isNode 
    ? nodes.find(n => n.id === selectedId) 
    : edges.find(e => e.id === selectedId);

  if (!target) return null;

  const data = target.data || {};
  const label = isNode ? data.label : (target.label || data.metadata?.label || "رابط يدوي");
  const attributes = data.metadata?.attributes || [];
  const filters = data.filters || [];
  const depth = data.depth || 1;
  const isManualEdge = !isNode && (data.metadata?.isManual || data.metadata?.label === 'رابط يدوي');

  const addFilter = () => {
    if (!selectedId) return;
    const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      attribute: attributes[0] || '',
      operator: '=',
      value: ''
    };
    updateFilters(selectedId, isNode, [...filters, newFilter]);
  };

  const removeFilter = (fid) => {
    if (!selectedId) return;
    updateFilters(selectedId, isNode, filters.filter((f) => f.id !== fid));
  };

  const updateFilterField = (fid, field, value) => {
    if (!selectedId) return;
    updateFilters(selectedId, isNode, filters.map((f) => f.id === fid ? { ...f, [field]: value } : f));
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="font-bold text-lg">{isNode ? 'تفاصيل العقدة' : 'تفاصيل الرابط'}</h2>
          <Badge variant="outline" className="mt-1">
            {isNode ? (data.type === 'category' ? 'فئة' : 'مجموعة') : 'علاقة'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="p-6 flex-1 overflow-auto space-y-8" dir="rtl">
        <section>
          <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-2 block">الهوية</Label>
          <div className="bg-slate-100 p-3 rounded-md">
            <p className="font-bold text-xl">{label}</p>
            {isNode ? (
              <>
                {data.type === 'collection' && (
                  <p className="text-sm text-muted-foreground mt-1">الفئة الأب: {data.categoryName}</p>
                )}
                <p className="text-[10px] font-mono text-slate-500 mt-2">المسار: {data.fullPath}</p>
              </>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="font-mono text-[9px]">{data.metadata?.fromcol || 'مصدر يدوي'}</Badge>
                  <ArrowLeftRight size={12} className="text-slate-400" />
                  <Badge variant="secondary" className="font-mono text-[9px]">{data.metadata?.tocol || 'هدف يدوي'}</Badge>
                </div>
              </div>
            )}
          </div>
        </section>

        {!isNode && (
          <section>
            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest flex items-center gap-2 mb-3">
              <Layers size={12} />
              عمق الاستعلام (Depth)
            </Label>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                min="1" 
                max="10"
                value={depth} 
                onChange={(e) => updateEdgeDepth(selectedId, e.target.value)}
                disabled={!isManualEdge}
                className="w-24 h-9 text-center font-bold"
              />
              <p className="text-xs text-slate-500">
                {isManualEdge 
                  ? "يمكنك تعديل عمق البحث لهذا الرابط اليدوي." 
                  : "الروابط التلقائية محددة بالعمق 1 افتراضياً."}
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
              <FilterIcon size={12} />
              الفلاتر المتاحة
            </Label>
            {attributes.length > 0 && (
              <Button variant="outline" size="sm" onClick={addFilter} className="h-7 text-xs">
                <Plus size={12} className="ml-1" /> إضافة
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filters.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-xs">{attributes.length > 0 ? 'لا توجد فلاتر محددة' : 'لا توجد سمات متاحة للفلترة'}</p>
              </div>
            )}
            {filters.map((filter) => (
              <div key={filter.id} className="p-3 bg-slate-50 border rounded-md relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFilter(filter.id)}
                >
                  <Trash2 size={12} className="text-destructive" />
                </Button>
                
                <div className="space-y-2">
                  <Select 
                    value={filter.attribute} 
                    onValueChange={(v) => updateFilterField(filter.id, 'attribute', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="السمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {attributes.map((attr) => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Select 
                      value={filter.operator} 
                      onValueChange={(v) => updateFilterField(filter.id, 'operator', v)}
                    >
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue placeholder="العملية" />
                      </SelectTrigger>
                      <SelectContent>
                        {['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'].map(op => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      className="h-8 text-xs text-right" 
                      placeholder="القيمة" 
                      value={filter.value}
                      onChange={(e) => updateFilterField(filter.id, 'value', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};