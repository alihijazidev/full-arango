import React, { useState, useMemo } from 'react';
import { useGraph } from '../store/GraphContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Search, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ResultTable = ({ data }) => {
  const { highlightedId, setHighlightedId } = useGraph();
  const [searchTerm, setSearchTerm] = useState('');

  const allNodes = useMemo(() => [...data.startnode, ...data.targetnode], [data]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return allNodes;
    const term = searchTerm.toLowerCase();
    return allNodes.filter(node => {
      const inId = node._id.toLowerCase().includes(term);
      const inLabel = node.label.toLowerCase().includes(term);
      const inProps = Object.entries(node).some(([key, value]) => 
        !key.startsWith('_') && String(value).toLowerCase().includes(term)
      );
      return inId || inLabel || inProps;
    });
  }, [allNodes, searchTerm]);

  const filteredEdges = useMemo(() => {
    if (!searchTerm) return data.edges;
    const term = searchTerm.toLowerCase();
    return data.edges.filter(edge => {
      const inFrom = edge._from.toLowerCase().includes(term);
      const inTo = edge._to.toLowerCase().includes(term);
      const inLabel = edge.label.toLowerCase().includes(term);
      return inFrom || inTo || inLabel;
    });
  }, [data.edges, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-slate-50/50">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="بحث في النتائج (المعرف، النوع، أو الخصائص)..." 
            className="pr-10 h-10 bg-white shadow-sm text-sm text-right" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العناصر المسترجعة ({filteredNodes.length})
              </h3>
              {searchTerm && filteredNodes.length === 0 && (
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
                      className={cn(
                        "cursor-pointer transition-colors",
                        highlightedId === item._id ? "bg-primary/10 border-primary" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(item._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                    >
                      <TableCell className="font-mono text-xs">{item._id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(item).filter(k => !k.startsWith('_') && k !== 'label' && k !== 'type' && k !== 'designedNodeId').map(key => (
                            <Badge key={key} variant="secondary" className="text-[10px] py-0">{key}: {item[key]}</Badge>
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
              {searchTerm && filteredEdges.length === 0 && (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEdges.map((edge) => (
                    <TableRow 
                      key={edge._id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        highlightedId === edge._id ? "bg-primary/10 border-primary" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(edge._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                    >
                      <TableCell className="font-mono text-[10px] text-slate-500">{edge._from}</TableCell>
                      <TableCell className="font-bold text-xs">{edge.label}</TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500">{edge._to}</TableCell>
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