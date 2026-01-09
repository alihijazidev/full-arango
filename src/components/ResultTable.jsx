import React, { useMemo, useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Search, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getArabicName } from '../utils/mapping';

export const ResultTable = ({ data }) => {
  const { 
    highlightedId, setHighlightedId, 
    selectedResultId, setSelectedResultId,
    resultSearchTerm, setResultSearchTerm 
  } = useGraph();
  
  const scrollAreaRef = useRef(null);

  const allNodes = useMemo(() => [...(data.startnode || []), ...(data.targetnode || [])], [data]);

  const filteredNodes = useMemo(() => {
    if (!resultSearchTerm) return allNodes;
    const term = resultSearchTerm.toLowerCase();
    return allNodes.filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      const inArabic = getArabicName(node.label).includes(term);
      const inProps = Object.entries(node).some(([key, value]) => {
        if (key.startsWith('_') || key === 'label' || key === 'type' || key === 'designedNodeId') return false;
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
      return inId || inLabel || inArabic || inProps;
    });
  }, [allNodes, resultSearchTerm]);

  const filteredEdges = useMemo(() => {
    const edges = data.edges || [];
    if (!resultSearchTerm) return edges;
    const term = resultSearchTerm.toLowerCase();
    return edges.filter(edge => {
      const inFrom = edge._from ? String(edge._from).toLowerCase().includes(term) : false;
      const inTo = edge._to ? String(edge._to).toLowerCase().includes(term) : false;
      const inLabel = edge.label ? String(edge.label).toLowerCase().includes(term) : false;
      return inFrom || inTo || inLabel;
    });
  }, [data.edges, resultSearchTerm]);

  // Handle scrolling to the selected row
  useEffect(() => {
    if (!selectedResultId) return;
    
    // Use a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      const element = document.getElementById(`row-${selectedResultId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedResultId]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-slate-50/50">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="بحث في النتائج (المعرف، النوع، أو الخصائص)..." 
            className="pr-10 h-10 bg-white shadow-sm text-sm text-right" 
            value={resultSearchTerm}
            onChange={(e) => setResultSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العناصر المسترجعة ({filteredNodes.length})
              </h3>
              {resultSearchTerm && filteredNodes.length === 0 && (
                <span className="text-xs text-rose-500 flex items-center gap-1">
                  <FilterX size={12} /> لا توجد نتائج مطابقة
                </span>
              )}
            </div>
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right">المعرف (_id)</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الخصائص</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNodes.map((item) => (
                    <TableRow 
                      key={item._id}
                      id={`row-${item._id}`}
                      className={cn(
                        "cursor-pointer transition-all",
                        (highlightedId === item._id || selectedResultId === item._id) ? "bg-primary/5 border-primary" : "",
                        selectedResultId === item._id ? "ring-2 ring-primary/20 ring-inset" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(item._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onClick={() => setSelectedResultId(item._id)}
                    >
                      <TableCell className="font-mono text-xs">{item._id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getArabicName(item.label)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item)
                            .filter(([key]) => !key.startsWith('_') && !['label', 'type', 'designedNodeId'].includes(key))
                            .map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-[10px] py-0">
                                {key}: {value !== null && value !== undefined ? String(value) : '-'}
                              </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العلاقات ({filteredEdges.length})
              </h3>
              {resultSearchTerm && filteredEdges.length === 0 && (
                <span className="text-xs text-rose-500 flex items-center gap-1">
                  <FilterX size={12} /> لا توجد نتائج مطابقة
                </span>
              )}
            </div>
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right">من (_from)</TableHead>
                    <TableHead className="text-right">العلاقة</TableHead>
                    <TableHead className="text-right">إلى (_to)</TableHead>
                    <TableHead className="text-right">الخصائص</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEdges.map((edge) => (
                    <TableRow 
                      key={edge._id}
                      id={`row-${edge._id}`}
                      className={cn(
                        "cursor-pointer transition-all",
                        (highlightedId === edge._id || selectedResultId === edge._id) ? "bg-primary/5 border-primary" : "",
                        selectedResultId === edge._id ? "ring-2 ring-primary/20 ring-inset" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(edge._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onClick={() => setSelectedResultId(edge._id)}
                    >
                      <TableCell className="font-mono text-[10px] text-slate-500">{edge._from}</TableCell>
                      <TableCell className="font-bold text-xs">{edge.label}</TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500">{edge._to}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(edge)
                            .filter(([key]) => !key.startsWith('_') && key !== 'label')
                            .map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-[10px] py-0">
                                {key}: {value !== null && value !== undefined ? String(value) : '-'}
                              </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};