import React from 'react';
import { useGraph } from '../store/GraphContext';
import { X, Plus, Trash2, Filter as FilterIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface DetailsPanelProps {
  selectedId: string | null;
  isNode: boolean;
  onClose: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ selectedId, isNode, onClose }) => {
  const { nodes, edges, updateFilters } = useGraph();
  
  const target = isNode 
    ? nodes.find(n => n.id === selectedId) 
    : edges.find(e => e.id === selectedId);

  if (!target) return null;

  const data = target.data;
  const attributes = isNode 
    ? (data.type === 'collection' ? data.metadata.attributes : [])
    : data.metadata.attributes;

  const filters = data.filters || [];

  const addFilter = () => {
    const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      attribute: attributes[0] || '',
      operator: '=',
      value: ''
    };
    updateFilters(selectedId!, isNode, [...filters, newFilter]);
  };

  const removeFilter = (fid: string) => {
    updateFilters(selectedId!, isNode, filters.filter((f: any) => f.id !== fid));
  };

  const updateFilterField = (fid: string, field: string, value: string) => {
    updateFilters(selectedId!, isNode, filters.map((f: any) => f.id === fid ? { ...f, [field]: value } : f));
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="font-bold text-lg">{isNode ? 'Node Details' : 'Edge Details'}</h2>
          <Badge variant="outline" className="mt-1">
            {isNode ? data.type : 'edge'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="p-6 flex-1 overflow-auto space-y-8">
        <section>
          <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-2 block">Identity</Label>
          <div className="bg-slate-100 p-3 rounded-md">
            <p className="font-bold text-xl">{data.label || data.metadata.name}</p>
            {isNode && data.type === 'collection' && (
              <p className="text-sm text-muted-foreground mt-1">Category: {data.metadata.category}</p>
            )}
            {!isNode && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="bg-white px-2 py-1 rounded border">{data.metadata.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="bg-white px-2 py-1 rounded border">{data.metadata.to}</span>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
              <FilterIcon size={12} />
              Composable Filters
            </Label>
            <Button variant="outline" size="sm" onClick={addFilter} className="h-7 text-xs">
              <Plus size={12} className="mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {filters.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-xs">No filters defined</p>
              </div>
            )}
            {filters.map((filter: any) => (
              <div key={filter.id} className="p-3 bg-slate-50 border rounded-md relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
                      <SelectValue placeholder="Attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {attributes.map((attr: string) => (
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
                        <SelectValue placeholder="Op" />
                      </SelectTrigger>
                      <SelectContent>
                        {['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'].map(op => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      className="h-8 text-xs" 
                      placeholder="Value" 
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

      <div className="p-4 border-t bg-slate-50">
        <Button className="w-full font-bold">
          Execute Live Query
        </Button>
      </div>
    </div>
  );
};